import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from './dto/task.dto';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.Pending })
  status: TaskStatus;

  @Column()
  assignedby: string; // UUID của người giao task

  @Column({ nullable: true })
  dueDate?: string;

  @Column()
  userId: string; // UUID của người tạo task
}
