import { Injectable, BadGatewayException } from '@nestjs/common';
import { DesignInput } from '../../common/types/design-input';

@Injectable()
export class TextExtractionService {
  async extract(text: string): Promise<DesignInput> {
    try {
      // Basic sanity check
      if (!text || text.trim().length < 3) {
        throw new BadGatewayException('Invalid or insufficient input text');
      }

      const normalized = text.toLowerCase();
      const result: DesignInput = {};

      // --- Extraction Rules ---

      if (normalized.includes('iec')) {
        result.standard = 'IEC 60502-1';
      }

      if (/\b10\b/.test(normalized)) {
        result.csa = 10;
      }

      if (normalized.includes('cu') || normalized.includes('copper')) {
        result.conductor_material = 'Cu';
      }

      if (normalized.includes('class 2')) {
        result.conductor_class = 'Class 2';
      }

      if (normalized.includes('pvc')) {
        result.insulation_material = 'PVC';
      }

      if (normalized.includes('1.0')) {
        result.insulation_thickness = 1.0;
      }

      // 🔴 VALIDATION: No meaningful extraction
      if (Object.keys(result).length === 0) {
        throw new BadGatewayException(
          'Input does not contain any valid or recognizable technical data'
        );
      }

      return result;
    } catch (error) {
      throw new BadGatewayException(
        'Failed to extract structured data from input'
      );
    }
  }
}
