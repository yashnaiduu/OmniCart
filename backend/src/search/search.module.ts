import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AggregationModule } from '../aggregation/aggregation.module';
import { AiEngineModule } from '../ai-engine/ai-engine.module';

@Module({
  imports: [AggregationModule, AiEngineModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
