import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './modules/auth/auth.module';
import { AgreementsModule } from './modules/agreements/agreements.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { EventsModule } from './modules/events/events.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { PrismaModule } from './platform/prisma.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, cache: true }), ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), LoggerModule.forRoot({ pinoHttp: { redact: ['req.headers.authorization', 'req.headers.cookie'] } }), PrismaModule, AuthModule, AgreementsModule, BlockchainModule, EventsModule, NotificationsModule, TemplatesModule, HealthModule, DashboardModule] })
export class AppModule {}
