
import { UnifiedFilters } from '@/types/filters';
import { SortConfig } from '@/utils/sorting';
import { purposeService } from '@/services/purposeService';

export const exportPurposesToCSV = async (
  filters: UnifiedFilters, 
  sortConfig: SortConfig, 
  toast: any,
  setIsLoading?: (loading: boolean) => void
) => {
  if (setIsLoading) setIsLoading(true);
  
  try {
    // Convert filters to API parameters (same as regular purposes request but without pagination)
    const apiParams = purposeService.mapFiltersToApiParams(filters, sortConfig, 1, 999999);
    
    // Remove pagination params for export
    delete apiParams.page;
    delete apiParams.limit;

    // Call the export CSV endpoint using the standard service pattern
    const response = await purposeService.exportPurposesCSV(apiParams);

    // Get the CSV blob from the response
    const blob = await response.blob();
    
    // Create and trigger download
    const link = document.createElement('a');
    const downloadUrl = URL.createObjectURL(blob);
    link.setAttribute('href', downloadUrl);
    
    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `purposes_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(downloadUrl);

    toast({
      title: "Export completed",
      description: `Successfully exported purposes to CSV with all applied filters and sorting.`,
    });
  } catch (error) {
    console.error('Export error:', error);
    toast({
      title: "Export failed",
      description: error instanceof Error ? error.message : "An error occurred while exporting data.",
      variant: "destructive",
    });
  } finally {
    if (setIsLoading) setIsLoading(false);
  }
};
