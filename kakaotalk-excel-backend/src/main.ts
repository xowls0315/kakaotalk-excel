import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // CORS 설정
  const frontendUrl = configService.get<string>('app.frontendUrl');
  const nodeEnv = configService.get<string>('app.nodeEnv');

  // CORS 허용 origin 목록
  const allowedOrigins: string[] = [];

  // 프론트엔드 URL 추가 (localhost 포함)
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
  }

  // 개발 환경: localhost 포트들 명시적으로 허용
  if (nodeEnv === 'development' || !nodeEnv || nodeEnv === '') {
    allowedOrigins.push('http://localhost:3000');
    allowedOrigins.push('http://localhost:3001');
  }

  // 프로덕션 환경에서는 Swagger UI도 허용 (현재 서버 URL)
  if (nodeEnv === 'production') {
    allowedOrigins.push('https://kakaotalk-excel-backend.onrender.com');
    // 프로덕션에서도 localhost 허용 (프론트엔드 개발자가 로컬에서 테스트할 수 있도록)
    if (frontendUrl && frontendUrl.includes('localhost')) {
      allowedOrigins.push(frontendUrl);
    }
  }

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // origin이 없거나 (같은 도메인 요청) 허용된 origin이면 통과
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // 개발 환경에서는 모든 origin 허용
        if (nodeEnv === 'development' || !nodeEnv || nodeEnv === '') {
          callback(null, true);
        } else {
          // 프로덕션: 허용되지 않은 origin 거부
          callback(null, false);
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Cookie Parser
  app.use(cookieParser());

  // Global Guards (JWT는 Public 데코레이터가 있으면 통과)
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('카카오톡 메시지 엑셀 변환 API')
    .setDescription(
      '카카오톡 대화 내보내기(.txt) 파일을 업로드하여 엑셀(.xlsx) 파일로 변환하는 API입니다.\n\n' +
        '## 주요 기능\n' +
        '- 게스트 모드: 로그인 없이 즉시 변환 및 다운로드\n' +
        '- 로그인 사용자: 변환 기록 저장, 재다운로드, 설정 저장\n' +
        '- 게스트 작업 귀속: 로그인 후 게스트 작업을 내 계정으로 가져오기\n\n' +
        '## 인증 방식\n' +
        '- JWT Bearer Token 사용\n' +
        '- Access Token: Authorization 헤더에 `Bearer {token}` 형식으로 전송\n' +
        '- Refresh Token: httpOnly 쿠키로 자동 관리 (프론트엔드에서는 신경 쓸 필요 없음)',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT Access Token을 입력하세요',
        in: 'header',
      },
      'JWT-auth', // 이 이름을 컨트롤러에서 사용
    )
    .addServer('http://localhost:3001', '로컬 개발 서버')
    .addServer(
      'https://kakaotalk-excel-backend.onrender.com',
      '프로덕션 서버 (Render)',
    )
    .addTag('Health', '서버 상태 확인')
    .addTag('Auth', '인증 관련 API (카카오 로그인, 토큰 관리)')
    .addTag('Convert', '파일 변환 API (게스트/로그인 사용자 공통)')
    .addTag('Jobs', '작업 관리 API (로그인 사용자 전용)')
    .addTag('Settings', '사용자 설정 API (로그인 사용자 전용)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 페이지 새로고침 시에도 인증 정보 유지
      tagsSorter: 'alpha', // 태그 알파벳 순 정렬
      operationsSorter: 'alpha', // API 알파벳 순 정렬
    },
    customSiteTitle: '카카오톡 엑셀 변환 API 문서',
  });

  const port = configService.get<number>('app.port') || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/api`);
}
void bootstrap();
