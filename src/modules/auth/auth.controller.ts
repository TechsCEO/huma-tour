import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigInDto, SignUpDto } from './auth.dto';
import { ResetPasswordDto, UpdateUserPasswordDto } from '../users/user.dto';
import { AuthGuard } from './auth.gaurd';
import type { Request as ExpressRequest, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signUp')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    return this.authService.signUp(res, signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: SigInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    return this.authService.login(res, signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/logout')
  logout(@Res({ passthrough: true }) res: Response): any {
    res.cookie('huma-jwt', 'logged out', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    return { status: 'success' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/forgotPassword')
  async forgotPassword(
    @Request() req: ExpressRequest,
    @Body('email') email: string,
  ): Promise<any> {
    return await this.authService.forgotPassword(req, email);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/resetPassword/:token')
  async resetPassword(
    @Res({ passthrough: true }) res: Response,
    @Param('token') token: string,
    @Body() user: ResetPasswordDto,
  ): Promise<any> {
    return await this.authService.resetPassword(res, token, user);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/updateMyPassword')
  @UseGuards(AuthGuard)
  async updateMyPassword(
    @Res({ passthrough: true }) res: Response,
    @Request() req: any,
    @Body() user: UpdateUserPasswordDto,
  ): Promise<any> {
    return await this.authService.updateMyPassword(req, res, user);
  }
}
