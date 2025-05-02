import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ResponseInterceptor } from './../common/response/response.interceptor';

@Controller('users')
@UseInterceptors(ResponseInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return {
      message: 'User created successfully',
      user,
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      message: 'List of users',
      users,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User found',
      user,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    await this.usersService.update(id, dto);
    const updatedUser = await this.usersService.findOne(id);
    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return {
      message: 'User deleted successfully',
    };
  }
}
