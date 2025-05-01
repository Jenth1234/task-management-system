// src/task/task.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskOwnerGuard } from './guards/task-owner.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    // Đăng ký TypeORM để quản lý Entity Task
    TypeOrmModule.forFeature([Task]),
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Hoặc cấu hình theo nhu cầu của bạn
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [TasksController], // Đăng ký controller
  providers: [TasksService, TaskOwnerGuard], // Đăng ký service
})
export class TasksModule {}
