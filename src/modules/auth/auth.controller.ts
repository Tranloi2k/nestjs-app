import { Controller, Post, Body, Res, UnauthorizedException, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.authService.login(user);
    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      secure: true,
    });
    return { message: 'Login successful' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: Request, @Res() res: Response) {
    // Xóa token từ phía client (ví dụ: xóa cookie hoặc token từ localStorage)
    res.clearCookie('access_token'); // Xóa cookie nếu sử dụng cookie
    return res.status(200).json({ message: 'Logout successful' });
  }
}
