import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'kakaotalk-excel 변환기에 오신걸 환영합니다!';
  }
}
