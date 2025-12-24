import { Body, Controller, Post } from '@nestjs/common';
import { DesignService } from './design.service';
import { ValidateDesignDto } from './dto/validate-design.dto';

@Controller('design')
export class DesignController {
  constructor(private readonly designService: DesignService) {}

  @Post('validate')
  async validate(@Body() dto: ValidateDesignDto) {
    return this.designService.validateDesign(dto);
  }
}
