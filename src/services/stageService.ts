import { apiService } from "@/services/apiService";

export interface UpdateStageRequest {
  value?: string;
  completion_date?: string | null;
  priority?: number;
}

export interface StageResponse {
  id: number;
  purchase_id: number;
  stage_type_id: number;
  priority: number;
  value: string | null;
  completion_date: string | null;
  days_since_previous_stage: number | null;
  stage_type: {
    id: number;
    name: string;
    value_required: boolean;
  };
}

class StageService {
  async updateStage(stageId: number, data: UpdateStageRequest): Promise<StageResponse> {
    return apiService.patch<StageResponse>(`/stages/${stageId}`, data);
  }
}

export const stageService = new StageService();
