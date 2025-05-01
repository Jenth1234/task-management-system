import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from './jwt.payload'; // Đường dẫn đến file định nghĩa JwtPayload

// Mở rộng giao diện Request để thêm thuộc tính user
interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Lấy request từ context
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    // Trích xuất token từ header Authorization
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thiếu hoặc sai định dạng token');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Lấy khóa bí mật từ biến môi trường
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('Khóa bí mật JWT không được cấu hình');
      }

      // Xác minh token và ép kiểu kết quả thành JwtPayload
      const decoded: JwtPayload = this.jwtService.verify(token, { secret });
      request.user = decoded; // Gán thông tin người dùng vào request
      return true; // Cho phép truy cập
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
