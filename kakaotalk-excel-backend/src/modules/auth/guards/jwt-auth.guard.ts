import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // Public 엔드포인트이지만, 토큰이 있으면 사용자 정보를 추출하기 위해
      // Strategy를 실행하되 실패해도 통과하도록 설정
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      if (token) {
        // 토큰이 있으면 Strategy를 실행하여 사용자 정보를 추출
        // 실패해도 Public 엔드포인트는 통과
        const result = super.canActivate(context);
        if (result instanceof Promise) {
          return result.then(() => true).catch(() => true);
        } else if (result instanceof Observable) {
          return result.pipe(
            map(() => true),
            catchError(() => of(true)),
          );
        } else {
          // boolean인 경우
          return true;
        }
      }
      // 토큰이 없으면 그냥 통과
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Public 엔드포인트에서도 사용자 정보를 추출할 수 있도록 처리
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Public 엔드포인트에서는 에러가 있어도 통과하되, 사용자 정보는 설정
      console.log(
        `[JwtAuthGuard] Public endpoint - user: ${user ? `id=${user.id}` : 'null'}, err: ${err ? err.message : 'null'}`,
      );
      if (user) {
        return user;
      }
      // 사용자 정보가 없어도 통과 (게스트 모드)
      return undefined;
    }

    // Public이 아닌 엔드포인트는 기본 동작 (에러 발생 시 401)
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }
    return user;
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (!authHeader) {
      return null;
    }
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
    return null;
  }
}
