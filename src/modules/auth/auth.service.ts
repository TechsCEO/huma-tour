import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/userModel';
import { Model } from 'mongoose';
import { SigInDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SigInDto): Promise<{ access_token: string }> {
    const { username, pass } = signInDto;

    const user = await this.userModel
      .findOne({ email: username })
      .select('+password')
      .exec();

    if (!user || !(await user.correctPassword(pass, user.password))) {
      throw new UnauthorizedException('Incorrect Email or Password');
    }

    const payload = { sub: user._id, username: user.email, role: user.role };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
