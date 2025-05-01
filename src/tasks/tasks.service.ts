import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  FindTasksQueryDto,
} from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(dto: CreateTaskDto & { userId: string }): Promise<Task> {
    const task = this.taskRepository.create({
      ...dto,
      userId: dto.userId,
    });
    return this.taskRepository.save(task);
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) throw new NotFoundException('Không tìm thấy task');
    return task;
  }

  async findAll(
    query: FindTasksQueryDto & { userId: string },
  ): Promise<Task[]> {
    const {
      status,
      assignedby,
      dueDateFrom,
      dueDateTo,
      title,
      description,
      page = 1,
      limit = 10,
      userId,
    } = query;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (assignedby) {
      queryBuilder.andWhere('task.assignedby = :assignedby', { assignedby });
    }

    if (dueDateFrom) {
      queryBuilder.andWhere('task.dueDate >= :dueDateFrom', { dueDateFrom });
    }

    if (dueDateTo) {
      queryBuilder.andWhere('task.dueDate <= :dueDateTo', { dueDateTo });
    }

    if (title) {
      queryBuilder.andWhere('task.title ILIKE :title', { title: `%${title}%` });
    }

    if (description) {
      queryBuilder.andWhere('task.description ILIKE :description', {
        description: `%${description}%`,
      });
    }

    return queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.preload({ id, ...dto });
    if (!task) throw new NotFoundException('Không tìm thấy task');
    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Không tìm thấy task');
  }
}
