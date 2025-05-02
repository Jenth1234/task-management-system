import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.entity';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './jwt.payload';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
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
      role: user.role,
    };

    const token = this.jwtService.sign(payload);
    return { accessToken: token };
  }

  async register(dto: RegisterDto) {
    const { email, password, role } = dto;

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('Email đã được đăng ký');
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role,
    });

    return this.userRepository.save(user);
  }
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      const user = await this.userRepository.findOneBy({ id: payload.sub });

      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }

      const newPayload: JwtPayload = {
        email: user.email,
        sub: user.id,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
