import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import sharp from 'sharp';
import type { Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';

type RequestWithFile = Request & {
  file?: Express.Multer.File;
  body: Record<string, unknown>;
  user?: { id?: string };
};

@Injectable()
export class ResizeUserImageInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest<RequestWithFile>();
    const file = req.file;

    if (!file) return next.handle();

    const userId = req.user?.id || req.body.id;
    if (!userId) return next.handle();

    const now = Date.now();
    const outDir = path.resolve(process.cwd(), 'public', 'img', 'users');
    fs.mkdirSync(outDir, { recursive: true });

    const filename = `user-${userId}-${now}.jpeg`;
    await sharp(file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(path.join(outDir, filename));

    req.body.photo = filename;

    return next.handle();
  }
}
