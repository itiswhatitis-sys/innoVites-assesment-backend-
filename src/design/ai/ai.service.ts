import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIClient } from '@azure/openai';
import { AzureKeyCredential } from '@azure/core-auth';
import { DesignInput } from 'src/common/types/design-input';

interface AiValidationResult {
  fields: Record<string, any>;
  validation: { field: string; status: string; expected: any; comment: string }[];
  confidence: { overall: number };
}

@Injectable()
export class AiService {
  private client: OpenAIClient;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('OPEN_AI_URL');
    const apiKey = this.config.get<string>('OPEN_AI_KEY');

    if (!endpoint || !apiKey) {
      throw new Error('OpenAI endpoint or key not configured');
    }

    this.client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
  }

  async validateDesign(input: DesignInput): Promise<AiValidationResult> {
const prompt = `
You are an expert in IEC 60502-1 cable specifications.

INPUT:
"${input}"

TASK:
1. FIRST extract technical attributes from the input string.
2. Use engineering inference where applicable.
3. DO NOT leave fields null if a reasonable interpretation exists.
4. Then validate the extracted values against IEC 60502-1.

FIELD EXTRACTION RULES:
- "3c" → number_of_cores = 3
- "25sqmm" → conductor_size_mm2 = 25
- "600v / 600kv / 0.6/1kV" → voltage_rating = "0.6/1 kV"
- "xlpe" → insulation_type = "XLPE"
- "circular" or "round" → conductor_shape = "circular"
- "compacted" → conductor_construction = "compacted"
- "0.729ohm" → resistance_ohm = 0.729
- Color words (red, blue, etc.) → color
- Standard names like IEC 6028-1 → standard

OUTPUT FORMAT (JSON ONLY):
{
  "fields": {
    "standard": string,
    "number_of_cores": number,
    "conductor_size_mm2": number,
    "voltage_rating": string,
    "insulation_type": string,
    "conductor_shape": string,
    "conductor_construction": string,
    "resistance_ohm": number,
    "color": string
  },
  "validation": [
    {
      "field": string,
      "expected": string,
      "status": "PASS" | "FAIL" | "WARN",
      "comment": string
    }
  ],
  "confidence": number
}

If a value is inferred from shorthand, mark status as "PASS".
If ambiguous, mark "WARN".
Never leave fields empty.
`;


    try {
      const response = await this.client.getChatCompletions('gpt-4o', [
        { role: 'system', content: 'You are a strict JSON-only validator.' },
        { role: 'user', content: prompt },
      ]);

      const aiContentRaw = response.choices[0]?.message?.content ?? '';
      console.log('AI raw response:', aiContentRaw);

      // Strip code fences if present
      const aiContent = aiContentRaw.replace(/```(json)?/g, '').trim();

      let parsed: any = {};
      try {
        parsed = JSON.parse(aiContent);
      } catch (err) {
        console.error('Failed to parse AI JSON:', aiContent);
        parsed = {};
      }

      // Normalize fields (handle array → key-value)
      let fields: Record<string, any> = {};
      if (Array.isArray(parsed.fields)) {
        parsed.fields.forEach((f: any) => {
          if (f.field) fields[f.field] = f.expected;
        });
      } else if (typeof parsed.fields === 'object') {
        fields = parsed.fields;
      }

      // Normalize validation array
      let validation: AiValidationResult['validation'] = [];
      if (Array.isArray(parsed.validation)) {
        validation = parsed.validation.map((v: any) => ({
          field: v.field,
          status: v.status || 'PASS',
          expected: v.expected ?? fields[v.field],
          comment: v.comment || '',
        }));
      } else if (parsed.validation === 'valid' || parsed.validation === true) {
        // Auto-pass all fields
        validation = Object.keys(fields).map(key => ({
          field: key,
          status: 'PASS',
          expected: fields[key],
          comment: 'Auto-passed (AI returned valid)',
        }));
      }
let confidence = 0;

if (parsed.confidence != null) {
  if (typeof parsed.confidence === 'number') {
    // Convert 0–100 number to 0–1 fraction
    confidence = parsed.confidence > 1 ? parsed.confidence / 100 : parsed.confidence;
  } else if (typeof parsed.confidence === 'object' && parsed.confidence.overall != null) {
    confidence = parsed.confidence.overall > 1 ? parsed.confidence.overall / 100 : parsed.confidence.overall;
  } else if (typeof parsed.confidence === 'string') {
    const val = parsed.confidence.toLowerCase();
    if (val === 'high') confidence = 0.9;
    else if (val === 'medium') confidence = 0.6;
    else if (val === 'low') confidence = 0.3;
  }
}

// fallback
if (confidence === 0) confidence = 0.5;

return { fields, validation, confidence: { overall: confidence } };
    } catch (err) {
      console.error('AI service call failed:', err);
      throw new ServiceUnavailableException('AI service unavailable');
    }
  }
}
