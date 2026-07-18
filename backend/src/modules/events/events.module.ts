import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { EventIndexerService } from './event-indexer.service';
import { EventsController } from './events.controller';

@Module({
  imports: [BlockchainModule],
  controllers: [EventsController],
  providers: [EventIndexerService],
  exports: [EventIndexerService],
})
export class EventsModule {}
