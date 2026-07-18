import { Injectable, Logger } from "@nestjs/common";
import { BlockchainService, DecodedContractEvent } from "../blockchain/blockchain.service";
import { PrismaService } from "../../platform/prisma.module";

@Injectable()
export class EventIndexerService {
  private readonly logger = new Logger(EventIndexerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchain: BlockchainService,
  ) {}

  async poll() {
    const stream = "soroban:pactos";
    const checkpoint = await this.prisma.listenerCheckpoint.upsert({
      where: { stream },
      update: {},
      create: { stream },
    });
    const page = await this.blockchain.events(checkpoint.cursor ?? undefined);
    for (const event of page.events) await this.process(stream, this.blockchain.decodeEvent(event));
    await this.prisma.listenerCheckpoint.update({
      where: { stream },
      data: { cursor: page.cursor, ledgerSequence: BigInt(page.latestLedger) },
    });
    return page.events.length;
  }

  private async process(consumer: string, event: DecodedContractEvent) {
    const messageId = event.id;
    await this.prisma.$transaction(async (tx) => {
      try {
        await tx.inboxReceipt.create({ data: { consumer, messageId } });
      } catch {
        return;
      } // The durable inbox receipt is the replay-protection boundary.

      const agreement = await tx.agreement.findFirst({ where: { contractId: event.contractId } });
      await tx.contractEvent.create({
        data: {
          transactionHash: event.txHash,
          eventIndex: event.eventIndex,
          contractId: event.contractId,
          ledgerSequence: BigInt(event.ledger),
          topic: JSON.stringify(event.topic),
          payload: event.value as never,
          agreementId: agreement?.id,
        },
      });
      await tx.outboxEvent.create({
        data: {
          type: "stellar.contract.event",
          aggregateId: agreement?.id ?? event.contractId,
          payload: event as never,
        },
      });
    });
    this.logger.debug({ messageId }, "Indexed Soroban event");
  }
}
