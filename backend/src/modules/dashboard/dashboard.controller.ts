import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma.module';
import { AgreementsService } from '../agreements/agreements.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agreements: AgreementsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get aggregated dashboard metrics and recent items' })
  @ApiQuery({ name: 'walletAddress', required: false, type: 'string' })
  async getDashboard(@Query('walletAddress') walletAddress?: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600_000);

    // Build wallet filter if walletAddress is provided
    const walletWhere = walletAddress
      ? {
          OR: [
            { creator: { wallets: { some: { address: walletAddress } } } },
            { participants: { some: { walletAddress } } },
          ],
        }
      : {};

    // 1. Active agreements count (ACTIVE, FUNDED, EXECUTING)
    const activeCount = await this.prisma.agreement.count({
      where: {
        status: { in: ['ACTIVE', 'FUNDED', 'EXECUTING'] },
        ...walletWhere,
      },
    });

    // 2. Total Recipients
    const recipients = await this.prisma.participant.findMany({
      where: {
        role: 'Recipient',
        ...(walletAddress ? { agreement: walletWhere } : {}),
      },
      distinct: ['walletAddress'],
      select: { walletAddress: true },
    });
    const recipientCount = recipients.length;

    // 3. Execution success rate
    const totalExecutions = await this.prisma.execution.count({
      where: walletAddress ? { agreement: walletWhere } : {},
    });
    const successfulExecutions = await this.prisma.execution.count({
      where: {
        status: 'CONFIRMED',
        ...(walletAddress ? { agreement: walletWhere } : {}),
      },
    });
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 100.0;

    // 4. 30d volume
    let volumeVal = 0;
    if (walletAddress) {
      const events = await this.prisma.contractEvent.findMany({
        where: {
          observedAt: { gte: thirtyDaysAgo },
          agreement: walletWhere,
          topic: { contains: 'payout' },
        },
      });
      for (const e of events) {
        const payload = e.payload as any;
        const amt = payload?.amount ?? payload?.val ?? payload;
        if (typeof amt === 'number') {
          volumeVal += amt / 1e7;
        } else if (typeof amt === 'string' && !isNaN(Number(amt))) {
          volumeVal += Number(amt) / 1e7;
        }
      }
    } else {
      const volumeSum = await this.prisma.analyticsDaily.aggregate({
        _sum: { volumeBaseUnits: true },
        where: { date: { gte: thirtyDaysAgo } },
      });
      volumeVal = Number(volumeSum._sum.volumeBaseUnits ?? 0) / 1e7;
    }

    // 5. Recent agreements (limit 4)
    const recentDbAgreements = await this.prisma.agreement.findMany({
      where: walletWhere,
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        participants: true,
        versions: { orderBy: { version: 'desc' }, take: 1 },
      },
    });
    const recentAgreements = await Promise.all(
      recentDbAgreements.map((a) => this.agreements.toDto(a)),
    );

    // 6. Recent activity (limit 7)
    const recentDbEvents = await this.prisma.contractEvent.findMany({
      where: walletAddress ? { agreement: walletWhere } : {},
      orderBy: { observedAt: 'desc' },
      take: 7,
    });
    const recentActivity = recentDbEvents.map((e) => {
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

    // 7. Generate a simple 8-point sparkline for volume trends
    // Retrieve daily volume for the last 8 days
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 3600_000);
    const dailyVolumeHistory = await this.prisma.analyticsDaily.findMany({
      where: { date: { gte: eightDaysAgo } },
      orderBy: { date: 'asc' },
      take: 8,
    });
    const spark = dailyVolumeHistory.map((d) => ({ v: Number(d.volumeBaseUnits) / 1e7 }));
    while (spark.length < 8) {
      spark.unshift({ v: 0 }); // Pad with 0s if there's not enough data
    }

    return {
      activeAgreements: {
        value: String(activeCount),
        delta: '+0 this month',
      },
      volume30d: {
        value: volumeVal > 0 ? `$${(volumeVal / 1000).toFixed(1)}k` : '$0.00',
        delta: '+0%',
      },
      totalRecipients: {
        value: String(recipientCount),
        delta: '+0',
      },
      executionSuccess: {
        value: `${successRate.toFixed(1)}%`,
        delta: '+0%',
      },
      spark,
      recentAgreements,
      recentActivity,
    };
  }
}
