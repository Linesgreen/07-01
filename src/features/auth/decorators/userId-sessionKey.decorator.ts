import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentSession = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return {
    userId: Number(request.user?.id) ?? null,
    tokenKey: request.user?.tokenKey ?? null,
    deviceId: request.user?.deviceId ?? null,
  };
});
