import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AgreementsModule } from '../agreements/agreements.module';

@Module({
  imports: [AgreementsModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
