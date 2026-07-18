import { Controller, Get, Module } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check health status of the backend control plane' })
  check() {
    return { status: 'ok', service: 'pactos-control-plane', time: new Date().toISOString() };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
