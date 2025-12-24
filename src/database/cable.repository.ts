import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CableDesign,
  CableDesignDocument,
} from './schemas/cable-design.schema';

@Injectable()
export class CableRepository {
  constructor(
    @InjectModel(CableDesign.name)
    private readonly cableModel: Model<CableDesignDocument>,
  ) {}

  async findById(designId: string) {
    return this.cableModel.findOne({ designId }).lean();
  }
}
