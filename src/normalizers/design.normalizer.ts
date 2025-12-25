import { Injectable, NotFoundException } from '@nestjs/common';
import { DesignInput } from 'src/common/types/design-input';
import { CableRepository } from 'src/database/cable.repository';
import { TextExtractionService } from 'src/design/ai/text-extraction.service';
import { ValidateDesignDto } from 'src/design/dto/validate-design.dto';


@Injectable()
export class DesignNormalizer {
  constructor(
    private readonly repo: CableRepository,
    private readonly textExtractor: TextExtractionService,
  ) {}

  async normalize(dto: ValidateDesignDto): Promise<{
    source: 'DB' | 'STRUCTURED' | 'TEXT';
    payload: DesignInput;
  }> {
    // 1️⃣ DB-based input
   if (dto.designId) {
  const design = await this.repo.findById(dto.designId);
  if (!design) {
    throw new NotFoundException('Design ID not found');
  }

  // Exclude _id and designId
  const { _id, designId, ...rest } = design;

  return {
    source: 'DB',
    payload: rest, // Only the technical fields
  };
}

    // 2️⃣ Structured JSON input (pass-through)
    if (dto.structuredInput) {
      return {
        source: 'STRUCTURED',
        payload: dto.structuredInput,
      };
    }

    // 3️⃣ Free-text → structured JSON
    const extracted = await this.textExtractor.extract(dto.freeText!);

    return {
      source: 'TEXT',
      payload: extracted,
    };
  }
}
