import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập người dùng' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Thông tin đăng nhập không hợp lệ.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký người dùng' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công.' })
  @ApiResponse({ status: 400, description: 'Thông tin đăng ký không hợp lệ.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Làm mới token' })
  @ApiResponse({ status: 200, description: 'Làm mới token thành công.' })
  @ApiResponse({
    status: 401,
    description: 'Token không hợp lệ hoặc đã hết hạn.',
  })
  refreshToken(@Body() dto: { refreshToken: string }) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
