import { DesignInput } from '../../../common/types/design-input';

export function buildValidationPrompt(input: DesignInput): string {
  return `
You are an IEC cable design validation expert.

Instructions:
- Validate the given cable design against IEC standards.
- Do NOT hallucinate missing standards.
- If data is missing, return WARN.
- Respond ONLY with valid JSON.
- Do NOT add text outside JSON.

Input:
${JSON.stringify(input, null, 2)}

Return JSON in this exact format:
{
  "fields": { ... },
  "validation": [
    {
      "field": "string",
      "status": "PASS | FAIL | WARN",
      "expected": "string",
      "comment": "string"
    }
  ],
  "confidence": {
    "overall": number
  }
}
`;
}
