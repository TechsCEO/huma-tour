import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/userModel';
import { Model } from 'mongoose';
import { SigInDto, SignUpDto } from './auth.dto';
import { ResetPasswordDto, UpdateUserPasswordDto } from '../users/user.dto';
import { type Request as ExpressRequest, Request, Response } from 'express';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async login(
    res: Response,
    signInDto: SigInDto,
  ): Promise<{ access_token: string }> {
    const { username, pass } = signInDto;

    const userDoc = await this.userModel
      .findOne({ email: username })
      .select('+password')
      .exec();

    if (!userDoc || !(await userDoc.correctPassword(pass, userDoc.password))) {
      throw new UnauthorizedException('Incorrect Email or Password');
    }

    return this.createSendToken(userDoc, res);
  }

  async signUp(res: Response, signUpDto: SignUpDto) {
    const newUser = await this.userModel.create(signUpDto);
    return this.createSendToken(newUser, res, 201);
  }

  async updateMyPassword(req: any, res: Response, user: UpdateUserPasswordDto) {
    const userId = req.user.id as string;
    const userDoc = await this.userModel
      .findById({ _id: userId })
      .select('+password')
      .exec();

    if (!userDoc) throw new NotFoundException('User not found!');

    const isPasswordCorrect = await userDoc.correctPassword(
      user.currentPassword,
      userDoc.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Your current password is wrong');
    }

    const isSameAsOld = await userDoc.correctPassword(
      user.password,
      userDoc.password,
    );

    if (isSameAsOld) {
      throw new BadRequestException(
        'You can not set your old password as your new password',
      );
    }

    userDoc.password = user.password;
    userDoc.passwordConfirm = user.passwordConfirm;
    await userDoc.save();

    return this.createSendToken(userDoc, res);
  }

  async forgotPassword(req: Request, email: string) {
    const userDoc = await this.userModel.findOne({ email });
    if (!userDoc) throw new NotFoundException('User not found!');

    const resetToken = userDoc.createPasswordResetToken();
    await userDoc.save({ validateBeforeSave: true });

    const resetURL = `${req.protocol}://${req.get('host')}/auth/resetPassword/${resetToken}`;
    return {
      message: 'Token sent to email!',
      resetURL,
    };
  }

  async resetPassword(res: Response, token: string, user: ResetPasswordDto) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const userDoc = await this.userModel
      .findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      })
      .select('+password');

    if (!userDoc) {
      throw new BadRequestException('Token is invalid or expired');
    }

    const isSameAsOld = await userDoc.correctPassword(
      user.password,
      userDoc.password,
    );
    console.log({ isSameAsOld });

    if (isSameAsOld) {
      throw new BadRequestException(
        'You can not set your old password as your new password',
      );
    }

    userDoc.password = user.password;
    userDoc.passwordConfirm = user.passwordConfirm;
    userDoc.passwordResetToken = undefined;
    userDoc.passwordResetExpires = undefined;
    await userDoc.save();

    return this.createSendToken(userDoc, res);
  }

  async createSendToken(
    userDoc: UserDocument,
    res: Response,
    statusCode = 200,
  ) {
    const { access_token } = await this.signToken(userDoc.id, userDoc.role);

    const days = Number(process.env.JWT_COOKIE_EXPIRES_IN ?? 90);
    const cookieOptions: {
      expires: Date;
      httpOnly: boolean;
      secure?: boolean;
      sameSite?: 'lax' | 'strict' | 'none';
    } = {
      expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'lax',
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    // Keep cookie name consistent with your logout(): it clears `jwt`
    res.cookie('huma-jwt', access_token, cookieOptions);

    // Don’t mutate the mongoose doc in service; just shape response data
    const user = userDoc.toObject?.() ?? userDoc;
    delete (user as any).password;
    delete (user as any).passwordResetToken;
    delete (user as any).passwordChangedAt;

    res.status(statusCode);

    return {
      status: 'success',
      access_token,
      data: { user },
    };
  }

  signToken = async (id: string, role: string) => {
    const payLoad = { id, role };
    return { access_token: await this.jwtService.signAsync(payLoad) };
  };
}
