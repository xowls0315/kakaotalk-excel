import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '사용자 정보',
    example: {
      id: 1,
      nickname: '홍길동',
      email: 'user@example.com',
    },
  })
  user: {
    id: number;
    nickname: string;
    email?: string;
  };
}
