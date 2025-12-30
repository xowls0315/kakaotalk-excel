import { apiGet, apiPut } from "../apiClient";

export interface UserSettings {
  defaultIncludeSystem: boolean;
  defaultSplitSheetsByDay: boolean;
  defaultDateRangeDays: number;
}

export interface UpdateSettingsRequest {
  defaultIncludeSystem?: boolean;
  defaultSplitSheetsByDay?: boolean;
  defaultDateRangeDays?: number;
}

/**
 * GET /settings - 사용자 설정 조회
 */
export async function getSettings(): Promise<UserSettings> {
  return apiGet<UserSettings>("/settings");
}

/**
 * PUT /settings - 사용자 설정 업데이트
 */
export async function updateSettings(
  settings: UpdateSettingsRequest
): Promise<UserSettings> {
  return apiPut<UserSettings>("/settings", settings);
}

