import { Module } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { ConnectorsModule } from '../connectors/connectors.module';

@Module({
  imports: [ConnectorsModule],
  providers: [AggregationService],
  exports: [AggregationService],
})
export class AggregationModule {}
