import {
  Controller,
  Param,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  FindTasksQueryDto,
} from './dto/task.dto';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthGuard } from '../auth/auth.guard';
import { TaskOwnerGuard } from './guards/task-owner.guard';
import { JwtPayload } from '../auth/jwt.payload';

@Controller('tasks')
@UseGuards(AuthGuard) // Áp dụng AuthGuard cho toàn bộ controller
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: { user: JwtPayload },
  ) {
    // Tạo và lưu task thông qua service
    const task = await this.tasksService.create({
      ...createTaskDto,
      userId: req.user.sub, // Gán userId từ JWT payload
    });
    return {
      message: 'Tạo task thành công',
      task,
    };
  }

  @Get(':id')
  @UseGuards(TaskOwnerGuard) // AuthGuard đã được áp dụng ở cấp controller
  async findOne(@Param('id') id: string) {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Không tìm thấy task với ID ${id}`);
    }
    return {
      message: 'Tìm task thành công',
      task,
    };
  }

  @Get()
  async findAll(
    @Query() query: FindTasksQueryDto,
    @Req() req: { user: JwtPayload },
  ) {
    const tasks = await this.tasksService.findAll({
      ...query,
      userId: req.user.sub, // Lọc task theo userId
    });
    return {
      message: 'Tìm danh sách task thành công',
      tasks,
    };
  }

  @Patch(':id')
  @UseGuards(TaskOwnerGuard)
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const task = await this.tasksService.update(id, updateTaskDto);
    if (!task) {
      throw new NotFoundException(`Không tìm thấy task với ID ${id}`);
    }
    return {
      message: 'Cập nhật task thành công',
      task,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(TaskOwnerGuard)
  async remove(@Param('id') id: string) {
    await this.tasksService.remove(id);
    return {
      message: 'Xóa task thành công',
    };
  }
}
