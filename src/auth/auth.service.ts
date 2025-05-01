import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../users/users.entity';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './jwt.payload';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service'; // Sửa lại chỗ import

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService, // Sửa lại tên đúng biến
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      return null;
    }
    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (isPasswordValid) {
      return user;
    }
    return null;
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Sai thông tin đăng nhập');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Sai mật khẩu');
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role, // Thêm role vào đây
    };

    const token = this.jwtService.sign(payload);
    return { accessToken: token };
  }

  async register(
    email: string,
    password: string,
    role: UserRole,
  ): Promise<User> {
    const hashedPassword: string = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role,
    });
    return this.userRepository.save(user);
  }
}
