import { Injectable, BadGatewayException } from '@nestjs/common';
import { ValidateDesignDto } from './dto/validate-design.dto';
import { validateSingleInput } from './validators/input-type.validator';
import { AiService } from './ai/ai.service';
import { DesignNormalizer } from 'src/normalizers/design.normalizer';

@Injectable()
export class DesignService {
  constructor(
    private readonly normalizer: DesignNormalizer,
    private readonly aiService: AiService,
  ) {}

  async validateDesign(dto: ValidateDesignDto) {
    // 1. Validate exactly one input type
    validateSingleInput(dto);

    // 2. Normalize input (DB / structured / text → JSON)
    const normalized = await this.normalizer.normalize(dto);

    // 3. Call AI validation service
  const aiResponse = await this.aiService.validateDesign(normalized.payload);

    // 4. Guard against malformed AI output
    if (!aiResponse?.validation || !Array.isArray(aiResponse.validation)) {
      throw new BadGatewayException('Invalid AI response');
    }

    // 5. Format API response
    return {
      inputSource: normalized.source,
      fields: aiResponse.fields,
      results: aiResponse.validation.map((v: { field: string | number; expected: any; status: any; comment: any; }) => ({
        field: v.field,
        provided: aiResponse.fields?.[v.field],
        expected: v.expected,
        status: v.status,
        comment: v.comment,
      })),
      overallStatus: aiResponse.validation.every((v: { status: string; }) => v.status === 'PASS')
        ? 'PASS'
        : 'FAIL',
      confidence: aiResponse.confidence?.overall ?? 0,
    };
  }
}
