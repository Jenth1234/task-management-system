import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // ✅ ĐÚNG
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { Task } from './task.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  FindTasksQueryDto,
} from './dto/task.dto';

// Dịch vụ quản lý các tác vụ (tasks)
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly CACHE_TTL: number;
  private readonly ERRORS = {
    TASK_NOT_FOUND: 'Không tìm thấy task',
  };

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    // Lấy TTL từ biến môi trường, mặc định 1 giờ
    this.CACHE_TTL = this.configService.get<number>('CACHE_TTL', 3600);
  }

  // Sinh khóa cache từ type và các tham số
  private generateCacheKey(type: string, ...params: string[]): string {
    return `${type}_${params.join('_')}`;
  }

  // Tạo task mới
  async create(dto: CreateTaskDto & { userId: string }): Promise<Task> {
    const task = this.taskRepository.create({ ...dto, userId: dto.userId });
    this.logger.log(`Tạo task mới cho user ${dto.userId}`);
    return this.taskRepository.save(task);
  }

  // Tìm task theo ID
  async findOne(id: string): Promise<Task> {
    const cacheKey = this.generateCacheKey('task', id);
    const cachedTask = await this.cacheManager.get<Task>(cacheKey);
    if (cachedTask) {
      this.logger.log(`Cache hit cho task ${id}`);
      return cachedTask;
    }

    const task = await this.taskRepository.findOneBy({ id });
    if (!task) throw new NotFoundException(this.ERRORS.TASK_NOT_FOUND);

    this.logger.log(`Lấy task ${id} từ database`);
    await this.cacheManager.set(cacheKey, task, this.CACHE_TTL);
    return task;
  }

  // Tìm danh sách task với bộ lọc và phân trang
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
    const cacheKey = this.generateCacheKey(
      'tasks',
      userId,
      JSON.stringify({
        status,
        assignedby,
        dueDateFrom,
        dueDateTo,
        title,
        description,
        page,
        limit,
      }),
    );

    const cachedTasks = await this.cacheManager.get<Task[]>(cacheKey);
    if (cachedTasks) {
      this.logger.log('Cache hit cho danh sách tasks');
      return cachedTasks;
    }

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId });

    // Áp dụng bộ lọc động
    const filters = {
      status,
      assignedby,
      dueDateFrom: dueDateFrom && { '>=': dueDateFrom },
      dueDateTo: dueDateTo && { '<=': dueDateTo },
      title: title && { ILIKE: `%${title}%` },
      description: description && { ILIKE: `%${description}%` },
    };

    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        const condition =
          typeof value === 'object'
            ? (value as Record<string, unknown>)
            : { '=': value };
        const operator = Object.keys(condition)[0];
        const paramValue = condition[operator]; // kiểu: unknown

        queryBuilder.andWhere(`task.${key} ${operator} :${key}`, {
          [key]: paramValue,
        });
      }
    }
    const tasks = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    await this.cacheManager.set(cacheKey, tasks, this.CACHE_TTL);
    this.logger.log(`Lấy ${tasks.length} tasks từ database`);
    return tasks;
  }

  // Cập nhật task
  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.preload({ id, ...dto });
    if (!task) throw new NotFoundException(this.ERRORS.TASK_NOT_FOUND);
    const updatedTask = await this.taskRepository.save(task);

    // Xóa cache
    await this.cacheManager.del(this.generateCacheKey('task', id));
    await this.cacheManager.del(this.generateCacheKey('tasks', '*')); // Xóa cache danh sách tasks
    this.logger.log(`Cập nhật task ${id} và xóa cache`);
    return updatedTask;
  }

  // Xóa task
  async remove(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(this.ERRORS.TASK_NOT_FOUND);

    // Xóa cache
    await this.cacheManager.del(this.generateCacheKey('task', id));
    await this.cacheManager.del(this.generateCacheKey('tasks', '*')); // Xóa cache danh sách tasks
    this.logger.log(`Xóa task ${id} và xóa cache`);
  }
}
