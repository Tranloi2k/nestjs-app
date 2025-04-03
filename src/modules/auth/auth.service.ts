/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import removeKeyObject from '../helpers';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

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

  // async googleLogin(code: string) {
  //   // Đổi Authorization Code → Access Token
  //   const { data } = await axios.post('https://oauth2.googleapis.com/token', {
  //     code,
  //     client_id: '375207417006-u77a0k3mnbi6coog727rd590ipo524lc.apps.googleusercontent.com',
  //     client_secret: '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',
  //     redirect_uri: 'http://localhost:8080/',
  //     grant_type: 'authorization_code',
  //   });

  //   console.log(data);

  //   Lấy thông tin user từ Google
  //   const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
  //     headers: { Authorization: `Bearer ${data.access_token}` },
  //   });

  //   // Tạo JWT token
  //   const payload = { email: userInfo.data.email, sub: userInfo.data.sub };
  //   return this.jwtService.sign(payload);
  //   return '';
  // }

  private googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  async googleLogin(googleToken: string) {
    // Verify token với Google
    const ticket = await this.googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as TokenPayload;
    if (!payload || !payload?.email || !payload?.name) {
      throw new UnauthorizedException('Invalid google token');
    }

    let user = await this.userService.findUserByEmail(payload.email);

    if (!user) {
      user = await this.userService.createUser(payload.name, payload.email, '');
    }

    const token = await this.login(user.username, user.id);
    // Tạo JWT token
    return { ...token };
  }
}
