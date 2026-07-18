import { Body, Controller, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { AgreementsService } from './agreements.service';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';

const createSchema = z.object({
  chainAgreementId: z.string().min(1),
  creatorId: z.string().min(1),
  contractId: z.string().min(1),
  assetAddress: z.string().min(1),
  metadataHash: z.string().length(64),
  ruleHash: z.string().length(64),
  participants: z.array(
    z.object({
      walletAddress: z.string(),
      role: z.string(),
      shareBps: z.number().int().min(0).max(10_000).optional(),
    }),
  ).min(1),
});

const prepareSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  blocks: z.array(z.any()).min(1),
  creatorAddress: z.string().min(1),
  assetAddress: z.string().min(1).optional(),
  cadence: z.string().optional(),
  monthlyBudget: z.number().optional(),
  currency: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  blocks: z.array(z.any()).optional(),
  status: z.string().optional(),
});

@ApiTags('agreements')
@Controller('agreements')
export class AgreementsController {
  constructor(private readonly agreements: AgreementsService) {}

  @Post()
  @ApiOperation({ summary: 'Directly create an agreement record (legacy support)', deprecated: true })
  /**
   * @deprecated Use prepare flow instead
   */
  create(@Body(new ZodValidationPipe(createSchema)) body: z.infer<typeof createSchema>) {
    return this.agreements.create(body);
  }

  @Post('prepare')
  @ApiOperation({ summary: 'Generate a new draft agreement and compile the Soroban register transaction' })
  @ApiBody({ schema: { type: 'object', required: ['name', 'blocks', 'creatorAddress', 'assetAddress'], properties: { name: { type: 'string' }, description: { type: 'string' }, blocks: { type: 'array', items: { type: 'object' } }, creatorAddress: { type: 'string' }, assetAddress: { type: 'string' }, cadence: { type: 'string' }, monthlyBudget: { type: 'number' }, currency: { type: 'string' } } } })
  prepare(@Body(new ZodValidationPipe(prepareSchema)) body: z.infer<typeof prepareSchema>) {
    return this.agreements.prepare(body);
  }

  @Get()
  @ApiOperation({ summary: 'List all agreements with pagination support' })
  @ApiQuery({ name: 'cursor', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, type: 'string' })
  list(@Query('cursor') cursor?: string, @Query('status') status?: string) {
    return this.agreements.list(cursor, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single agreement' })
  get(@Param('id') id: string) {
    return this.agreements.get(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update agreement metadata (drafts only) or status' })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, blocks: { type: 'array', items: { type: 'object' } }, status: { type: 'string' } } } })
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateSchema)) body: z.infer<typeof updateSchema>) {
    return this.agreements.update(id, body);
  }
}

@Module({
  controllers: [AgreementsController],
  providers: [AgreementsService],
  exports: [AgreementsService],
})
export class AgreementsModule {}
