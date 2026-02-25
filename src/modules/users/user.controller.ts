import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { AuthGuard } from '../auth/auth.gaurd';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResizeUserImageInterceptor } from './resize-user-image.interceptor';
import multer from 'multer';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}
  // TODO: in the end, complete authorization

  @Get('/user/getMe')
  async getMe(@Request() req: any): Promise<any> {
    return await this.userService.getMe(req);
  }

  @Patch('/user/updateMe')
  @UseInterceptors(
    FileInterceptor('photo', { storage: multer.memoryStorage() }),
    ResizeUserImageInterceptor,
  )
  async updateMe(
    @Request() req: any,
    @Body() user: UpdateUserDto,
  ): Promise<any> {
    return await this.userService.updateMe(req, user);
  }

  @Delete('/user/deleteMe')
  async deleteMe(@Request() req: any): Promise<any> {
    return await this.userService.deleteMe(req);
  }

  @Get('/users')
  @Roles('admin')
  async getUsers(): Promise<any> {
    return await this.userService.getUsers();
  }

  @Post('/user')
  async createUser(@Body() user: CreateUserDto): Promise<any> {
    return await this.userService.createUser(user);
  }

  @Get('/user/:id')
  async getUser(@Param('id') id: string): Promise<any> {
    return await this.userService.getUser(id);
  }

  @Patch('/user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserDto,
  ): Promise<any> {
    return await this.userService.updateUser(id, user);
  }

  @Delete('/user/:id')
  async deleteUser(@Param('id') id: string): Promise<any> {
    return await this.userService.deleteUser(id);
  }
}
