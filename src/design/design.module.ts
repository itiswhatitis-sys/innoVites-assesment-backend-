import { Module } from '@nestjs/common';
import { DesignController } from './design.controller';
import { DesignService } from './design.service';
import { AiService } from './ai/ai.service';
import { CableRepository } from '../database/cable.repository';
import { DatabaseModule } from 'src/database/database.module';
import { TextExtractionService } from './ai/text-extraction.service';
import { DesignNormalizer } from 'src/normalizers/design.normalizer';
@Module({
  imports: [DatabaseModule],
  controllers: [DesignController],
  providers: [
    DesignService,
    AiService,
    CableRepository,
    TextExtractionService,
      DesignNormalizer, // 👈 required
  ],
})
export class DesignModule {}
