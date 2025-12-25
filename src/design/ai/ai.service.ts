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
You are an expert in cable standards, specifically IEC 60502-1.

Input (DO NOT MODIFY THIS OBJECT):
${JSON.stringify(input, null, 2)}

STRICT RULES:
1. You MUST return the input exactly as provided under the key "fields".
2. Do NOT add, remove, rename, or transform any field inside "fields".
3. Perform validation ONLY in the "validation" array.
4. Return ONLY valid JSON (no markdown, no explanations).
5. Response structure MUST be:

{
  "fields": { ...exact input... },
  "validation": [
    {
      "field": "<field_name>",
      "status": "PASS | FAIL | WARN",
      "expected": "<expected_value>",
      "comment": "<reason>"
    }
  ],
  "confidence": {
    "overall": number (0–100)
  }
}

6. If a field is not covered by IEC 60502-1, mark it as:
   status: "WARN"
   comment: "Not defined in IEC 60502-1"

7. Never hallucinate standards or values.
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
          status: v.status || 'FAIL',
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
