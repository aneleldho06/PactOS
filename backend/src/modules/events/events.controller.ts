import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma.module';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('activity')
@Controller('activity')
export class EventsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List all indexed events/activity with pagination' })
  @ApiQuery({ name: 'cursor', required: false, type: 'string' })
  @ApiQuery({ name: 'agreementId', required: false, type: 'string' })
  @ApiQuery({ name: 'walletAddress', required: false, type: 'string' })
  async list(
    @Query('cursor') cursor?: string,
    @Query('agreementId') agreementId?: string,
    @Query('walletAddress') walletAddress?: string,
  ) {
    const walletWhere = walletAddress
      ? {
          agreement: {
            OR: [
              { creator: { wallets: { some: { address: walletAddress } } } },
              { participants: { some: { walletAddress } } },
            ],
          },
        }
      : {};

    const rows = await this.prisma.contractEvent.findMany({
      where: {
        ...(agreementId ? { agreementId } : {}),
        ...walletWhere,
      },
      take: 51,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ observedAt: 'desc' }, { id: 'desc' }],
    });

    const next = rows.length > 50 ? rows.pop()?.id : undefined;

    const data = rows.map((e) => {
      let topicArray: string[] = [];
      try {
        topicArray = JSON.parse(e.topic);
      } catch {
        topicArray = [e.topic];
      }
      const primaryTopic = topicArray[0] || 'event';

      let kind: 'execution' | 'deposit' | 'payout' | 'return' | 'conversion' | 'system' = 'system';
      let title = `Event: ${primaryTopic}`;
      let subtitle = `Contract: ${e.contractId.substring(0, 8)}`;
      let amount: string | undefined = undefined;

      const payload = e.payload as any;

      if (primaryTopic === 'payout') {
        kind = 'payout';
        const amt = payload?.amount ?? payload?.val ?? payload;
        const formattedAmt = amt ? (Number(amt) / 1e7).toLocaleString() : '0';
        title = `Recipient received funds`;
        subtitle = `Payout processed`;
        amount = `$${formattedAmt}`;
      } else if (primaryTopic === 'esclock') {
        kind = 'deposit';
        const amt = payload?.amount ?? payload?.val ?? payload;
        const formattedAmt = amt ? (Number(amt) / 1e7).toLocaleString() : '0';
        title = `Funds locked in escrow`;
        subtitle = `Escrow active`;
        amount = `$${formattedAmt}`;
      } else if (primaryTopic === 'escrel') {
        kind = 'return';
        const amt = payload?.amount ?? payload?.val ?? payload;
        const formattedAmt = amt ? (Number(amt) / 1e7).toLocaleString() : '0';
        title = `Escrow funds released`;
        subtitle = `Escrow complete`;
        amount = `$${formattedAmt}`;
      } else if (primaryTopic === 'conversion' || primaryTopic === 'swap') {
        kind = 'conversion';
        title = `Converted token`;
        subtitle = `Stellar DEX conversion`;
      } else if (primaryTopic === 'execution' || primaryTopic === 'run') {
        kind = 'execution';
        title = `Agreement executed`;
        subtitle = `Workflow automated`;
      }

      return {
        id: e.id,
        kind,
        title,
        subtitle,
        amount,
        status: 'completed',
        time: e.observedAt.toISOString(),
        agreementId: e.agreementId,
      };
    });

    return { data, nextCursor: next };
  }
}
