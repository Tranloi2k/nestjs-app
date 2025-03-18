/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User Name', example: 'loi_tran' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    description: 'email',
    example: 'abc@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'password',
    example: 'abc123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
