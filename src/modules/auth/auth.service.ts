/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import removeKeyObject from '../helpers';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(email: string, password: string): Promise<LoginResponseDto | null> {
    const user = await this.userService.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(userName: string, userId: number) {
    const payload = {
      username: userName,
      sub: userId,
      iat: Math.floor(Date.now() / 1000), // Thêm thời gian hiện tại
      nonce: Math.random().toString(36).substring(2), // Thêm giá trị ngẫu nhiên
      expiresIn: '7d',
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshPayload = {
      username: userName,
      sub: userId,
      iat: Math.floor(Date.now() / 1000), // Thêm thời gian hiện tại
      nonce: Math.random().toString(36).substring(2), // Thêm giá trị ngẫu nhiên
    };
    const refreshToken = await this.jwtService.signAsync(refreshPayload);
    await this.userService.updateUser(userId, { refreshToken });
    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUserById(id: number): Promise<any> {
    const user = await this.userService.findUserById(id);
    if (user) {
      return removeKeyObject(user, 'password');
    }
    return null;
  }

  async refreshToken(token: string) {
    const payload: { sub: number } = this.jwtService.verify(token);
    const user: { id: number; name: string; refreshToken: string } = await this.validateUserById(
      payload.sub,
    );
    if (!user || token !== user.refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }
    const data = await this.login(user.name, user.id);
    return data;
  }
}
