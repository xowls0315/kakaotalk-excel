import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GuestSessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.cookies?.guest_session) {
      const guestSessionId = uuidv4();
      res.cookie('guest_session', guestSessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge:
          1000 *
          60 *
          60 *
          24 *
          parseInt(process.env.GUEST_SESSION_EXPIRES_IN_DAYS || '7', 10),
      });
      req.cookies = req.cookies || {};
      req.cookies.guest_session = guestSessionId;
    }
    (req as any).guestSessionId = req.cookies.guest_session;
    next();
  }
}

