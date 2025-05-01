import { Injectable } from '@nestjs/common';
import { User } from './users.entity';
import { CreateUserDto, UpdateUserDto } from './dto/index';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  create(dto: CreateUserDto) {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }
  findAll() {
    return this.userRepository.find();
  }
  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
  update(id: string, dto: UpdateUserDto) {
    return this.userRepository.update(id, dto);
  }
  remove(id: string) {
    return this.userRepository.delete(id);
  }
}
