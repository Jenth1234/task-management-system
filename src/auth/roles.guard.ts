import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';
import { JwtPayload } from './jwt.payload';

// Mở rộng giao diện Request để thêm thuộc tính user
interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Kiểm tra ngữ cảnh HTTP
    if (context.getType() !== 'http') {
      throw new UnauthorizedException('Chỉ hỗ trợ ngữ cảnh HTTP');
    }

    // Lấy danh sách vai trò yêu cầu từ metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Nếu không có vai trò yêu cầu, cho phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Lấy request và user
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const user: JwtPayload | undefined = request.user;

    // Kiểm tra user và vai trò
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Không đủ quyền truy cập. Vai trò yêu cầu: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
