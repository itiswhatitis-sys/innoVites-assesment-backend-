import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CableDesign,
  CableDesignSchema,
} from './schemas/cable-design.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CableDesign.name, schema: CableDesignSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
