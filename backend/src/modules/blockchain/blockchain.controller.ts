import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { BlockchainService } from './blockchain.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

const transactionSchema = z.object({
  transactionXdr: z.string().min(1, 'Transaction XDR is required'),
});

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchain: BlockchainService) {}

  @Post('simulate')
  @ApiOperation({ summary: 'Simulate a signed or unsigned transaction on-chain' })
  @ApiBody({ schema: { type: 'object', properties: { transactionXdr: { type: 'string' } }, required: ['transactionXdr'] } })
  simulate(@Body(new ZodValidationPipe(transactionSchema)) body: z.infer<typeof transactionSchema>) {
    return this.blockchain.simulate(body.transactionXdr);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit a signed transaction to the Stellar network' })
  @ApiBody({ schema: { type: 'object', properties: { transactionXdr: { type: 'string' } }, required: ['transactionXdr'] } })
  submit(@Body(new ZodValidationPipe(transactionSchema)) body: z.infer<typeof transactionSchema>) {
    return this.blockchain.submit(body.transactionXdr);
  }

  @Get('transaction/:hash')
  @ApiOperation({ summary: 'Retrieve the status and details of a submitted transaction' })
  transaction(@Param('hash') hash: string) {
    return this.blockchain.transaction(hash);
  }
}
