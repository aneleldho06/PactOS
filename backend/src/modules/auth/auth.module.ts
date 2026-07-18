import { Body, Controller, Module, Post } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { AuthService } from './auth.service';

const challengeSchema = z.object({ walletAddress: z.string().regex(/^G[A-Z2-7]{55}$/) });
const verifySchema = challengeSchema.extend({ nonce: z.string().uuid(), signature: z.string().min(1) });

@ApiTags('auth')
@Controller('auth')
class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('challenge')
  @ApiOperation({ summary: 'Request a backend wallet challenge (nonce)' })
  @ApiBody({ schema: { type: 'object', required: ['walletAddress'], properties: { walletAddress: { type: 'string', pattern: '^G[A-Z2-7]{55}$' } } } })
  challenge(@Body(new ZodValidationPipe(challengeSchema)) body: z.infer<typeof challengeSchema>) {
    return this.auth.challenge(body.walletAddress);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify the signed challenge and return a user auth session' })
  @ApiBody({ schema: { type: 'object', required: ['walletAddress', 'nonce', 'signature'], properties: { walletAddress: { type: 'string', pattern: '^G[A-Z2-7]{55}$' }, nonce: { type: 'string', format: 'uuid' }, signature: { type: 'string' } } } })
  verify(@Body(new ZodValidationPipe(verifySchema)) body: z.infer<typeof verifySchema>) {
    return this.auth.verify(body);
  }
}

@Module({ imports: [JwtModule.register({})], controllers: [AuthController], providers: [AuthService] })
export class AuthModule {}
