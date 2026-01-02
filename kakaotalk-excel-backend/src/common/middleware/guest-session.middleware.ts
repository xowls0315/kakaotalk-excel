import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GuestSessionMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!req.cookies?.guest_session) {
      const guestSessionId = uuidv4();
      const isProduction =
        this.configService.get<boolean>('app.isProduction') ?? false;
      const guestSessionExpiresInDays = this.configService.get<number>(
        'app.guestSessionExpiresInDays',
      ) || 7;

      res.cookie('guest_session', guestSessionId, {
        httpOnly: true,
        sameSite: isProduction ? ('none' as const) : ('lax' as const),
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24 * guestSessionExpiresInDays,
      });
      req.cookies = req.cookies || {};
      req.cookies.guest_session = guestSessionId;
    }
    (req as any).guestSessionId = req.cookies.guest_session;
    next();
  }
}

