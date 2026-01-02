import { useState, useCallback } from "react";
import { getJobs } from "@/lib/api/jobs";
import { calculateJobStats } from "@/lib/utils/jobUtils";

interface JobStats {
  total: number;
  success: number;
  processing: number;
  failed: number;
  expired: number;
}

export function useJobStats() {
  const [stats, setStats] = useState<JobStats>({
    total: 0,
    success: 0,
    processing: 0,
    failed: 0,
    expired: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const allJobs = await getJobs();
      const calculatedStats = calculateJobStats(allJobs.jobs);
      
      // total은 API 응답의 total을 사용 (페이지네이션 고려)
      setStats({
        ...calculatedStats,
        total: allJobs.total || calculatedStats.total,
      });
    } catch (error) {
      console.error("Failed to load job stats:", error);
      // 에러 발생 시 기본값 유지
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { stats, isLoading, loadStats };
}

