/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

import { UserService } from '../user/user.service';
import removeKeyObject from '../helpers';
import { LoginResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /*
   |--------------------------------------------------------------------------
   | VALIDATE USER
   |--------------------------------------------------------------------------
   */

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<LoginResponseDto, 'password'> | null> {
    const user = await this.userService.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return removeKeyObject(user, 'password');
    }
    return null;
  }

  async validateUserById(id: number) {
    const user = await this.userService.findUserById(id);

    if (!user) {
      return null;
    }

    return removeKeyObject(user, 'password');
  }

  /*
   |--------------------------------------------------------------------------
   | TOKEN GENERATORS
   |--------------------------------------------------------------------------
   */

  private async generateAccessToken(username: string, userId: number) {
    return this.jwtService.signAsync(
      {
        username,
        sub: userId,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    );
  }

  private async generateRefreshToken(username: string, userId: number) {
    return this.jwtService.signAsync(
      {
        username,
        sub: userId,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
  }

  /*
   |--------------------------------------------------------------------------
   | LOGIN
   |--------------------------------------------------------------------------
   */

  async login(username: string, userId: number) {
    const accessToken = await this.generateAccessToken(username, userId);

    const refreshToken = await this.generateRefreshToken(username, userId);

    // Hash refresh token trước khi lưu DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userService.updateUser(userId, {
      refreshToken: hashedRefreshToken,
    });

    return {
      userId,
      accessToken,
      refreshToken,
    };
  }

  /*
   |--------------------------------------------------------------------------
   | REFRESH TOKEN
   |--------------------------------------------------------------------------
   */

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{
        sub: number;
        username: string;
      }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userService.findUserById(payload.sub);

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Refresh token rotation
      return this.login(user.username, user.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }

  // async logout(userId: number) {
  //   await this.userService.updateUser(userId, {
  //     refreshToken: null,
  //   });

  //   return {
  //     message: 'Logout successful',
  //   };
  // }

  async googleLogin(googleToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as TokenPayload;

    if (!payload || !payload.email || !payload.name) {
      throw new UnauthorizedException('Invalid Google token');
    }

    let user = await this.userService.findUserByEmail(payload.email);

    if (!user) {
      user = await this.userService.createUser(payload.name, payload.email, '');
    }

    return this.login(user.username, user.id);
  }
}
