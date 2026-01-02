import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Vercel 배포 최적화
  output: undefined, // 기본값 유지 (Vercel은 자동으로 처리)
  
  // 이미지 최적화 (필요한 경우)
  images: {
    unoptimized: false, // Vercel에서 자동 최적화
  },
};

export default nextConfig;
