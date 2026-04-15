import { Module } from '@nestjs/common';
import { RefillController } from './refill.controller';
import { RefillService } from './refill.service';
import { PrismaModule } from '../prisma.module';
import { AggregationModule } from '../aggregation/aggregation.module';
import { AiEngineModule } from '../ai-engine/ai-engine.module';

@Module({
  imports: [PrismaModule, AggregationModule, AiEngineModule],
  controllers: [RefillController],
  providers: [RefillService],
})
export class RefillModule {}
