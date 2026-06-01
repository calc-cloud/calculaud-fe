import * as XLSX from "xlsx";

import { purposeService } from "@/services/purposeService";
import { UnifiedFilters } from "@/types/filters";
import { SortConfig } from "@/utils/sorting";

const EXPORT_COLUMNS = [
  "ID",
  "Description",
  "Status",
  "Creation Time",
  "Last Modified",
  "Comments",
  "Hierarchy",
  "Supplier",
  "Service Type",
  "Services",
  "Purchases",
  "EMF IDs",
  "Bikushit IDs",
  "Demand IDs",
  "Order IDs",
];

const MULTI_VALUE_COLUMNS = new Set(["Services", "EMF IDs", "Bikushit IDs", "Demand IDs", "Order IDs"]);

const STATUS_DISPLAY: Record<string, string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  SIGNED: "Signed",
  PARTIALLY_SUPPLIED: "Partially Supplied",
};

const formatDate = (iso: string): string => (iso ? iso.split("T")[0] : "");

const formatPurchaseCount = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return "0";
  const count = trimmed.split("\n").filter((v) => v.trim()).length;
  return String(count);
};

const transformCell = (col: string, value: string): string => {
  if (col === "Status") return STATUS_DISPLAY[value] ?? value;
  if (col === "Creation Time" || col === "Last Modified") return formatDate(value);
  if (col === "Purchases") return formatPurchaseCount(value);
  if (MULTI_VALUE_COLUMNS.has(col))
    return value
      .split("\n")
      .filter((v) => v.trim())
      .join(", ");
  return value;
};

export const exportPurposesToExcel = async (
  filters: UnifiedFilters,
  sortConfig: SortConfig,
  toast: any,
  setIsLoading?: (loading: boolean) => void
) => {
  if (setIsLoading) setIsLoading(true);

  try {
    const apiParams = purposeService.mapFiltersToApiParams(filters, sortConfig, 1, 999999);
    delete apiParams.page;
    delete apiParams.limit;

    const response = await purposeService.exportPurposesCSV(apiParams);
    const csvText = await response.text();

    // Parse CSV preserving embedded newlines in quoted cells
    const parsed = XLSX.read(csvText, { type: "string" });
    const allRows: string[][] = XLSX.utils.sheet_to_json(parsed.Sheets[parsed.SheetNames[0]], { header: 1 });

    if (allRows.length === 0) throw new Error("No data to export.");

    const csvHeaders = allRows[0] as string[];
    const colIndices = EXPORT_COLUMNS.map((col) => csvHeaders.indexOf(col));

    const outputRows = [
      EXPORT_COLUMNS,
      ...allRows.slice(1).map((row) =>
        colIndices.map((idx, i) => {
          const value = String((idx !== -1 ? row[idx] : "") ?? "");
          return transformCell(EXPORT_COLUMNS[i], value);
        })
      ),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(outputRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purposes");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    const downloadUrl = URL.createObjectURL(blob);
    link.setAttribute("href", downloadUrl);
    link.setAttribute("download", `purposes_export_${new Date().toISOString().split("T")[0]}.xlsx`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    toast({
      title: "Export completed",
      description: "Successfully exported purposes to Excel with all applied filters and sorting.",
    });
  } catch (error) {
    toast({
      title: "Export failed",
      description: error instanceof Error ? error.message : "An error occurred while exporting data.",
      variant: "destructive",
    });
  } finally {
    if (setIsLoading) setIsLoading(false);
  }
};
