import { apiService } from '@/services/apiService';

export interface UpdateStageRequest {
  value?: string;
  completion_date?: string | null; // Date format: "YYYY-MM-DD" (e.g., "2025-07-08")
}

export interface UpdateStageResponse {
  id: number;
  purchase_id: number;
  stage_type_id: number;
  priority: number;
  value: string | null;
  completion_date: string | null; // Date format: "YYYY-MM-DD" (e.g., "2025-07-08")
  stage_type: {
    id: number;
    name: string;
    value_required: boolean;
  };
}

class StageService {
  async updateStage(stageId: string, data: UpdateStageRequest): Promise<UpdateStageResponse> {
    return apiService.patch<UpdateStageResponse>(`/stages/${stageId}`, data);
  }
}

export const stageService = new StageService(); 