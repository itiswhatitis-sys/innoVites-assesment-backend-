import { Injectable, BadGatewayException } from '@nestjs/common';
import { DesignInput } from '../../common/types/design-input';

@Injectable()
export class TextExtractionService {
  async extract(text: string): Promise<DesignInput> {
    /*
      In real systems:
      - This can be a lightweight LLM call
      - Or regex + heuristics initially
    */

    // Temporary deterministic extraction (for demo)
    try {
      const result: DesignInput = {};

      if (text.includes('IEC')) {
        result.standard = 'IEC 60502-1';
      }

      if (text.includes('10')) {
        result.csa = 10;
      }

      if (text.toLowerCase().includes('cu')) {
        result.conductor_material = 'Cu';
      }

      if (text.toLowerCase().includes('class 2')) {
        result.conductor_class = 'Class 2';
      }

      if (text.toLowerCase().includes('pvc')) {
        result.insulation_material = 'PVC';
      }

      if (text.includes('1.0')) {
        result.insulation_thickness = 1.0;
      }

      return result;
    } catch {
      throw new BadGatewayException('Failed to extract structured data from text');
    }
  }
}
