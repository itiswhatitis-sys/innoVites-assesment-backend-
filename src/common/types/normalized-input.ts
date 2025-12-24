export type NormalizedInput = {
  source: 'DB' | 'STRUCTURED' | 'TEXT';
  payload: Record<string, any> | string;
};
