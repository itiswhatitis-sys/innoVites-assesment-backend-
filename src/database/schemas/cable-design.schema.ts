import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CableDesignDocument = CableDesign & Document;

@Schema({ collection: 'cable_designs', timestamps: true })
export class CableDesign {
  @Prop({ required: true, unique: true })
  designId: string;

  @Prop()
  standard: string;

  @Prop()
  voltage: string;

  @Prop()
  conductor_material: string;

  @Prop()
  conductor_class: string;

  @Prop()
  csa: number;

  @Prop()
  insulation_material: string;

  @Prop()
  insulation_thickness: number;
}

export const CableDesignSchema =
  SchemaFactory.createForClass(CableDesign);
