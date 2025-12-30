-- 카카오톡 엑셀 변환 서비스 데이터베이스 스키마
-- Postgres SQL

-- Schema 생성
CREATE SCHEMA IF NOT EXISTS "kakaotalk-excel";

-- 기존 테이블 및 트리거 삭제 (순서 중요: 외래키 참조 순서대로)
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS job_files;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS guest_sessions;
DROP TABLE IF EXISTS users;

-- Users 테이블 (카카오 로그인 유저)
CREATE TABLE IF NOT EXISTS "kakaotalk-excel".users (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL DEFAULT 'kakao',
    provider_user_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    nickname VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_provider_user_id ON "kakaotalk-excel".users(provider_user_id);

-- Guest Sessions 테이블 (게스트 세션 관리)
CREATE TABLE IF NOT EXISTS "kakaotalk-excel".guest_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_agent_hash VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guest_sessions_last_seen ON "kakaotalk-excel".guest_sessions(last_seen_at);

-- Jobs 테이블 (변환 작업)
CREATE TABLE IF NOT EXISTS "kakaotalk-excel".jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES "kakaotalk-excel".users(id) ON DELETE SET NULL,
    guest_session_id UUID REFERENCES "kakaotalk-excel".guest_sessions(id) ON DELETE SET NULL,
    original_file_name VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'previewed',
    options_json JSONB,
    room_name VARCHAR(255),
    total_messages INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

CREATE INDEX idx_jobs_user_id ON "kakaotalk-excel".jobs(user_id);
CREATE INDEX idx_jobs_guest_session_id ON "kakaotalk-excel".jobs(guest_session_id);
CREATE INDEX idx_jobs_status ON "kakaotalk-excel".jobs(status);
CREATE INDEX idx_jobs_created_at ON "kakaotalk-excel".jobs(created_at);

-- Job Files 테이블 (결과 파일)
CREATE TABLE IF NOT EXISTS "kakaotalk-excel".job_files (
    id SERIAL PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES "kakaotalk-excel".jobs(id) ON DELETE CASCADE,
    storage_type VARCHAR(50) NOT NULL DEFAULT 'local',
    path_or_url TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_files_job_id ON "kakaotalk-excel".job_files(job_id);
CREATE INDEX idx_job_files_expires_at ON "kakaotalk-excel".job_files(expires_at);

-- User Settings 테이블 (기본 옵션 저장)
CREATE TABLE IF NOT EXISTS "kakaotalk-excel".user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES "kakaotalk-excel".users(id) ON DELETE CASCADE,
    default_include_system BOOLEAN NOT NULL DEFAULT false,
    default_split_sheets_by_day BOOLEAN NOT NULL DEFAULT false,
    default_date_range_days INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_settings_user_id ON "kakaotalk-excel".user_settings(user_id);

-- Refresh Tokens 테이블 (JWT Refresh Token 관리)
CREATE TABLE IF NOT EXISTS "kakaotalk-excel".refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "kakaotalk-excel".users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON "kakaotalk-excel".refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON "kakaotalk-excel".refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON "kakaotalk-excel".refresh_tokens(expires_at);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION "kakaotalk-excel".update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON "kakaotalk-excel".users
    FOR EACH ROW EXECUTE FUNCTION "kakaotalk-excel".update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON "kakaotalk-excel".user_settings
    FOR EACH ROW EXECUTE FUNCTION "kakaotalk-excel".update_updated_at_column();
