import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { AuthGuard } from '../auth/auth.gaurd';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}
  // TODO: in the end, complete authorization

  @Get('/users')
  @Roles('lead-guide', 'admin')
  async getUsers(): Promise<any> {
    return await this.userService.getUsers();
  }

  @Get('/user/:id')
  async getUser(@Param('id') id: string): Promise<any> {
    return await this.userService.getUser(id);
  }

  @Delete('/user/:id')
  async deleteUser(@Param('id') id: string): Promise<any> {
    return await this.userService.deleteUser(id);
  }

  @Post('/user')
  async createUser(@Body() user: CreateUserDto): Promise<any> {
    return await this.userService.createUser(user);
  }

  @Patch('/user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserDto,
  ): Promise<any> {
    return await this.userService.updateUser(id, user);
  }
}
