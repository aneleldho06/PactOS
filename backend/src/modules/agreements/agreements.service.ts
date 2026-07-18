import { BadGatewayException, ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../platform/prisma.module';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Address, Account, Contract, Operation, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { createHash } from 'node:crypto';

@Injectable()
export class AgreementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly blockchain: BlockchainService,
  ) {}

  /**
   * @deprecated Use prepare instead
   */
  async create(input: any) {
    const { participants, ...agreement } = input;
    return this.prisma.$transaction(async tx => {
      const created = await tx.agreement.create({
        data: { ...agreement, participants: { create: participants } },
        include: { participants: true }
      });
      await tx.outboxEvent.create({
        data: { type: 'agreement.metadata.created', aggregateId: created.id, payload: { agreementId: created.id } }
      });
      return created;
    });
  }

  async prepare(input: {
    name: string;
    description: string;
    blocks: any[];
    creatorAddress: string;
    assetAddress?: string;
    cadence?: string;
    monthlyBudget?: number;
    currency?: string;
  }) {
    const creatorAddress = input.creatorAddress;
    const defaultAsset = this.config.get<string>('STELLAR_DEFAULT_ASSET_ADDRESS', 'CDLZFC3SYJYDZT7K67VZ75HPJGWAMBOEFUR2TIUG2WDJ2WCOYCCKJ6LU');
    const assetAddress = input.assetAddress || defaultAsset;

    // Find or create creator wallet & user
    let wallet = await this.prisma.wallet.findUnique({
      where: { address: creatorAddress },
      include: { user: true },
    });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          address: creatorAddress,
          network: this.config.get<string>('STELLAR_NETWORK', 'testnet'),
          status: 'LINKED',
          user: { create: {} },
        },
        include: { user: true },
      });
    }
    const creatorId = wallet.user.id;

    // Generate off-chain random 32-byte agreement ID
    const randomUuid = crypto.randomUUID();
    const idHex = createHash('sha256').update(randomUuid).digest('hex');

    // Create manifest and ADL
    const manifest = {
      name: input.name,
      description: input.description,
      emoji: '📜',
      cadence: input.cadence || 'One-time',
      monthlyBudget: input.monthlyBudget || 0,
      currency: input.currency || 'USDC',
      blocks: input.blocks,
    };
    const adl = {
      blocks: input.blocks,
    };

    const metadataHash = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
    const ruleHash = createHash('sha256').update(JSON.stringify(adl)).digest('hex');

    // Default status for created agreement in DB is DRAFT
    const status = 'DRAFT';

    // Parse participants from the blocks (e.g. SPLIT blocks or ESCROW)
    const participantsData: { walletAddress: string; role: string; shareBps?: number }[] = [
      { walletAddress: creatorAddress, role: 'Creator', shareBps: 10000 },
    ];

    // Read SPLIT blocks to get other participants
    for (const block of input.blocks) {
      if (block.type === 'SPLIT' && block.config?.parts) {
        const parts = block.config.parts as { label: string; pct: number }[];
        for (const part of parts) {
          participantsData.push({
            walletAddress: part.label.startsWith('G') && part.label.length === 56 ? part.label : `GBMOCKRECIPIENT${createHash('md5').update(part.label).digest('hex').substring(0, 42)}`,
            role: 'Recipient',
            shareBps: Math.round(part.pct * 100),
          });
        }
      }
    }

    // Build the Soroban register transaction XDR
    const registryContractId = this.blockchain.contracts.registry;
    const networkPassphrase = this.config.getOrThrow<string>('STELLAR_NETWORK_PASSPHRASE');

    // Retrieve account sequence from Soroban RPC
    let sequence = '0';
    try {
      const accountResponse = await this.blockchain.rpc<{ id: string; sequence: string }>('getAccount', {
        address: creatorAddress,
      });
      sequence = accountResponse.sequence;
    } catch {
      sequence = '0';
    }

    const agreementScVal = this.buildAgreementScVal({
      idHex,
      creator: creatorAddress,
      participants: participantsData.map((p) => p.walletAddress),
      asset: assetAddress,
      ruleHashHex: ruleHash,
      metadataHashHex: metadataHash,
    });

    const registryContract = new Contract(registryContractId);
    const op = Operation.invokeContractFunction({
      contract: registryContract.address().toString(),
      function: 'register',
      args: [agreementScVal],
    });

    const sourceAccount = new Account(creatorAddress, sequence);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100000',
      networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(0)
      .build();

    const transactionXdr = tx.toXDR();

    // Create the DB record in DRAFT status
    const created = await this.prisma.$transaction(async (tx) => {
      const agreementRecord = await tx.agreement.create({
        data: {
          chainAgreementId: idHex,
          creatorId,
          contractId: registryContractId,
          status,
          assetAddress,
          metadataHash,
          ruleHash,
          participants: {
            create: participantsData.map((p) => ({
              walletAddress: p.walletAddress,
              role: p.role,
              shareBps: p.shareBps,
            })),
          },
        },
        include: { participants: true },
      });

      await tx.agreementVersion.create({
        data: {
          agreementId: agreementRecord.id,
          version: 1,
          compilerVersion: '0.1.0',
          adl: adl as any,
          contentHash: ruleHash,
          manifest: manifest as any,
        },
      });

      return agreementRecord;
    });

    return {
      agreementId: created.id,
      chainAgreementId: idHex,
      metadataHash,
      ruleHash,
      transactionXdr,
    };
  }

  async update(
    id: string,
    input: {
      name?: string;
      description?: string;
      blocks?: any[];
      status?: string;
    },
  ) {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
    if (!agreement) throw new NotFoundException('Agreement not found');

    if (agreement.status !== 'DRAFT' && (input.name !== undefined || input.description !== undefined || input.blocks !== undefined)) {
      throw new BadRequestException('Cannot edit the structure of deployed agreements; they are immutable on-chain.');
    }

    return this.prisma.$transaction(async (tx) => {
      if (input.status) {
        await tx.agreement.update({
          where: { id },
          data: { status: input.status as any },
        });
      }

      if (agreement.status === 'DRAFT' && (input.name !== undefined || input.description !== undefined || input.blocks !== undefined)) {
        const latestVersion = agreement.versions[0];
        const oldManifest = (latestVersion?.manifest as any) || {};
        const oldAdl = (latestVersion?.adl as any) || {};

        const manifest = {
          name: input.name !== undefined ? input.name : oldManifest.name,
          description: input.description !== undefined ? input.description : oldManifest.description,
          emoji: oldManifest.emoji || '📜',
          cadence: oldManifest.cadence || 'One-time',
          monthlyBudget: oldManifest.monthlyBudget || 0,
          currency: oldManifest.currency || 'USDC',
          blocks: input.blocks !== undefined ? input.blocks : oldManifest.blocks || [],
        };

        const adl = {
          blocks: input.blocks !== undefined ? input.blocks : oldAdl.blocks || [],
        };

        const metadataHash = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
        const ruleHash = createHash('sha256').update(JSON.stringify(adl)).digest('hex');

        const nextVersion = (latestVersion?.version || 0) + 1;

        await tx.agreement.update({
          where: { id },
          data: {
            metadataHash,
            ruleHash,
            version: nextVersion,
          },
        });

        await tx.agreementVersion.create({
          data: {
            agreementId: id,
            version: nextVersion,
            compilerVersion: '0.1.0',
            adl: adl as any,
            contentHash: ruleHash,
            manifest: manifest as any,
          },
        });
      }

      const updated = await tx.agreement.findUnique({
        where: { id },
        include: { participants: true, versions: { orderBy: { version: 'desc' }, take: 1 } },
      });
      return this.toDto(updated);
    });
  }

  async list(cursor?: string, status?: string) {
    const rows = await this.prisma.agreement.findMany({
      where: status ? { status: status as any } : undefined,
      take: 51,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { participants: true, versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
    const next = rows.length > 50 ? rows.pop()?.id : undefined;
    const data = await Promise.all(rows.map((row) => this.toDto(row)));
    return { data, nextCursor: next };
  }

  async get(id: string) {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id },
      include: {
        participants: true,
        versions: { orderBy: { version: 'desc' }, take: 1 },
        executions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!agreement) throw new NotFoundException('Agreement not found');
    return this.toDto(agreement);
  }

  async toDto(agreement: any) {
    const latestVersion = agreement.versions?.[0];
    const manifest = (latestVersion?.manifest as any) || {};
    const adl = (latestVersion?.adl as any) || {};

    const recipients = agreement.participants.map((p: any) => ({
      id: p.id,
      name: p.walletAddress.substring(0, 4) + '...' + p.walletAddress.substring(p.walletAddress.length - 4),
      role: p.role,
      share: p.shareBps ? p.shareBps / 100 : 100,
      avatarColor: `var(--chart-${(p.walletAddress.charCodeAt(5) % 4) + 1})`,
      currency: manifest.currency || 'USDC',
    }));

    const blocks = manifest.blocks || adl.blocks || [];

    let frontendStatus = 'draft';
    switch (agreement.status) {
      case 'ACTIVE':
      case 'EXECUTING':
      case 'FUNDED':
        frontendStatus = 'active';
        break;
      case 'COMPLETED':
        frontendStatus = 'completed';
        break;
      case 'PAUSED':
        frontendStatus = 'paused';
        break;
      case 'DEPLOYED':
        frontendStatus = 'waiting';
        break;
      case 'CANCELLED':
      case 'ARCHIVED':
        frontendStatus = 'paused';
        break;
      case 'DRAFT':
      default:
        frontendStatus = 'draft';
        break;
    }

    return {
      id: agreement.id,
      chainAgreementId: agreement.chainAgreementId,
      emoji: manifest.emoji || '📜',
      name: manifest.name || `Agreement ${agreement.chainAgreementId.substring(0, 8)}`,
      description: manifest.description || 'No description provided.',
      status: frontendStatus,
      cadence: manifest.cadence || 'One-time',
      monthlyBudget: manifest.monthlyBudget || 0,
      currency: manifest.currency || 'USDC',
      nextRun: manifest.nextRun || new Date(Date.now() + 24 * 3600_000).toISOString(),
      createdAt: agreement.createdAt.toISOString(),
      progress: manifest.progress !== undefined ? manifest.progress : (agreement.status === 'COMPLETED' ? 100 : 0),
      recipients,
      blocks,
    };
  }

  private buildAgreementScVal(agreement: {
    idHex: string;
    creator: string;
    participants: string[];
    asset: string;
    ruleHashHex: string;
    metadataHashHex: string;
  }): xdr.ScVal {
    const entries = [
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('asset'),
        val: xdr.ScVal.scvAddress(Address.fromString(agreement.asset).toScAddress()),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('created_at'),
        val: xdr.ScVal.scvU64(xdr.Uint64.fromString('0')),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('creator'),
        val: xdr.ScVal.scvAddress(Address.fromString(agreement.creator).toScAddress()),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('id'),
        val: xdr.ScVal.scvBytes(Buffer.from(agreement.idHex, 'hex')),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('metadata_hash'),
        val: xdr.ScVal.scvBytes(Buffer.from(agreement.metadataHashHex, 'hex')),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('participants'),
        val: xdr.ScVal.scvVec(agreement.participants.map((p) => xdr.ScVal.scvAddress(Address.fromString(p).toScAddress()))),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('rule_hash'),
        val: xdr.ScVal.scvBytes(Buffer.from(agreement.ruleHashHex, 'hex')),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('schedule'),
        val: xdr.ScVal.scvU64(xdr.Uint64.fromString('0')),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('status'),
        val: xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('Draft')]),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('updated_at'),
        val: xdr.ScVal.scvU64(xdr.Uint64.fromString('0')),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('version'),
        val: xdr.ScVal.scvU32(1),
      }),
    ];
    return xdr.ScVal.scvMap(entries);
  }
}
