import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma.module';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { mapContractEventToActivityDto } from './events.mapper';

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

    const data = rows.map(mapContractEventToActivityDto);

    return { data, nextCursor: next };
  }
}
