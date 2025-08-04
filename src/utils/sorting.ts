export type SortField = "creation_time" | "expected_delivery" | "last_modified" | "days_since_last_completion";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
