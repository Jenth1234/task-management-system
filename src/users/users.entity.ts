// src/users/users.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Manager = 'manager',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.User })
  role: UserRole;
}
