import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './userModel';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { filterObj } from '../../utils/filter-obj.util';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getUsers() {
    const users = await this.userModel.find().lean().exec();
    return {
      status: 'success',
      length: users.length,
      data: {
        users,
      },
    };
  }

  async getUser(userId: string) {
    const userDoc = await this.userModel.findOne({ _id: userId }).lean().exec();
    return {
      status: 'success',
      data: userDoc,
    };
  }

  async getMe(req: any) {
    const userId = req.user.id as string;
    const userDoc = await this.userModel.findOne({ _id: userId }).lean().exec();

    delete (userDoc as any).passwordResetToken;
    return {
      status: 'success',
      data: userDoc,
    };
  }

  async deleteMe(req: any) {
    const userId = req.user.id as string;
    const userDoc = await this.userModel
      .findByIdAndDelete({ _id: userId })
      .lean()
      .exec();
    return {
      status: 'success',
      data: userDoc,
    };
  }

  async createUser(user: CreateUserDto) {
    const createdUser = await this.userModel.create(user);
    return {
      status: 'success',
      data: createdUser,
    };
  }

  async updateUser(userId: string, user: UpdateUserDto) {
    const doc = await this.userModel.findById(userId);
    if (!doc) throw new NotFoundException('User not found!');

    doc.set(user);
    const saved = await doc.save();

    return { status: 200, data: saved };
  }

  async updateMe(req: any, user: UpdateUserDto) {
    const userId = req.user.id as string;
    if ('password' in user || 'passwordConfirm' in user) {
      throw new BadRequestException(
        'This route is not for password updates. Please use /updateMyPassword',
      );
    }

    const filteredBody = filterObj(user, 'name', 'email', 'photo');

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, filteredBody, {
        new: true,
        runValidators: true,
      })
      .lean()
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      status: 'success',
      data: {
        user: updatedUser,
      },
    };
  }

  async deleteUser(userId: string) {
    const userDoc = await this.userModel.deleteOne({ _id: userId });
    return { status: userDoc.deletedCount > 0 ? 200 : 404 };
  }
}
