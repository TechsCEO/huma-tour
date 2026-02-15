import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user?: { role?: Role } }>();
    const user = req.user;

    if (!user?.role) {
      throw new ForbiddenException('Missing role on token/user payload');
    }
    const allowed = requiredRoles.includes(user.role);

    if (!allowed) {
      throw new ForbiddenException(
        `Access denied. Only "${requiredRoles.join(', ')}" can make this request.`,
      );
    }

    return true;
  }
}
