import { BadRequestException } from '@nestjs/common';
import { ValidateDesignDto } from '../dto/validate-design.dto';

export function validateSingleInput(dto: ValidateDesignDto) {
  const inputs = [
    dto.designId,
    dto.structuredInput,
    dto.freeText,
  ].filter(Boolean);

  if (inputs.length !== 1) {
    throw new BadRequestException(
      'Exactly one input type must be provided',
    );
  }
}
