import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type Role = 'user' | 'guide' | 'lead-guide' | 'admin';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
