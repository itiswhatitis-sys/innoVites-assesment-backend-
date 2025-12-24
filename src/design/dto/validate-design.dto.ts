import { IsOptional, IsString, IsObject } from 'class-validator';

export class ValidateDesignDto {
  @IsOptional()
  @IsString()
  designId?: string;

  @IsOptional()
  @IsObject()
  structuredInput?: Record<string, any>;

  @IsOptional()
  @IsString()
  freeText?: string;
}
