import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthSchedulerService } from './auth-scheduler.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const accessSecret = configService.get<string>('jwt.accessSecret');
        const accessExpiresIn = configService.get<string>('jwt.accessExpiresIn');
        if (!accessSecret || !accessExpiresIn) {
          throw new Error('JWT configuration is missing');
        }
        return {
          secret: accessSecret,
          signOptions: {
            expiresIn: accessExpiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, KakaoStrategy, JwtStrategy, AuthSchedulerService],
  exports: [AuthService],
})
export class AuthModule {}

