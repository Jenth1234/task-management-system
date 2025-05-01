import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { TasksService } from '../tasks.service';
import { Request } from 'express';
import { JwtPayload } from '../../auth/jwt.payload'; // Đảm bảo JwtPayload đã khai báo đúng interface

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class TaskOwnerGuard implements CanActivate {
  constructor(private readonly tasksService: TasksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    const taskId = request.params.id;

    if (!userId || !taskId) {
      throw new ForbiddenException(
        'Thiếu thông tin để xác thực quyền truy cập',
      );
    }

    const task = await this.tasksService.findOne(taskId);
    if (!task) {
      throw new ForbiddenException('Task không tồn tại');
    }

    // Kiểm tra nếu user không phải là người tạo task
    if (task.assignedby !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập task này');
    }

    return true;
  }
}
