import {
  Controller,
  Get,
  Param,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
@Controller('cats')
export class CatsController {
  @Post()
  create() {
    return 'This action adds a new cat';
  }
  @Get()
  findAll() {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    return 'This action returns all cats';
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action lấy id là: ${id}`;
  }
}
