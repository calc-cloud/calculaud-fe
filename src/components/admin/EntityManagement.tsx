import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, MoreHorizontal, Loader, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useCallback, ReactNode } from 'react';

import { TablePagination } from '@/components/tables/TablePagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { API_CONFIG } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { BaseEntity, BaseListResponse, BaseQueryParams } from '@/services/BaseService';

export interface EntityField<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => ReactNode;
  className?: string;
}

export interface EntityManagementConfig<
  TEntity extends BaseEntity,
  TResponse extends BaseListResponse<TEntity>,
  TCreateRequest,
  TUpdateRequest,
  TQueryParams extends BaseQueryParams = BaseQueryParams
> {
  // Entity configuration
  entityName: string;
  entityNamePlural: string;
  queryKey: string;
  
  // Service methods
  service: {
    get: (params?: TQueryParams) => Promise<TResponse>;
    create: (data: TCreateRequest) => Promise<TEntity>;
    update: (id: number, data: TUpdateRequest) => Promise<TEntity>;
    delete: (id: number) => Promise<void>;
  };
  
  // Display configuration
  displayFields: EntityField<TEntity>[];
  searchPlaceholder?: string;
  gridColumns?: number;
  
  // Modal configuration
  ModalComponent: React.ComponentType<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editItem: TEntity | null;
    onSave: (data: any, editId?: number) => Promise<void>;
  }>;
  
  // Optional customizations
  buildQueryParams?: (page: number, limit: number, search?: string) => TQueryParams;
  customActions?: (item: TEntity) => ReactNode;
}

export function EntityManagement<
  TEntity extends BaseEntity,
  TResponse extends BaseListResponse<TEntity>,
  TCreateRequest,
  TUpdateRequest,
  TQueryParams extends BaseQueryParams = BaseQueryParams
>({ config }: { config: EntityManagementConfig<TEntity, TResponse, TCreateRequest, TUpdateRequest, TQueryParams> }) {
  // State management
  const [entities, setEntities] = useState<TEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<TEntity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<TEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const itemsPerPage = API_CONFIG.PAGINATION.DEFAULT_LIMIT;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, API_CONFIG.SEARCH.DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch entities
  const fetchEntities = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const params = config.buildQueryParams 
        ? config.buildQueryParams(currentPage, itemsPerPage, debouncedSearch || undefined)
        : { page: currentPage, limit: itemsPerPage, search: debouncedSearch || undefined } as TQueryParams;
      
      const response = await config.service.get(params);
      setEntities(response.items || []);
      setTotalPages(response.pages || 1);
      setTotalCount(response.total || 0);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to connect to API');
      toast({
        title: "API Connection Error",
        description: "Unable to connect to the backend API. The interface will work with limited functionality.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, itemsPerPage, toast, config]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const handleCreate = () => {
    if (apiError) {
      toast({
        title: "API Connection Required",
        description: `Cannot create ${config.entityNamePlural} without API connection.`,
        variant: "destructive"
      });
      return;
    }
    setEditingEntity(null);
    setIsModalOpen(true);
  };

  const handleEdit = (entity: TEntity) => {
    if (apiError) {
      toast({
        title: "API Connection Required",
        description: `Cannot edit ${config.entityNamePlural} without API connection.`,
        variant: "destructive"
      });
      return;
    }
    setEditingEntity(entity);
    setIsModalOpen(true);
  };

  const handleSave = async (data: TCreateRequest | TUpdateRequest, editId?: number) => {
    try {
      if (editId) {
        await config.service.update(editId, data as TUpdateRequest);
        toast({ title: `${config.entityName} updated successfully` });
      } else {
        await config.service.create(data as TCreateRequest);
        toast({ title: `${config.entityName} created successfully` });
      }
      
      // Invalidate the React Query cache so other components get updated data
      queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      
      await fetchEntities();
    } catch (error) {
      toast({
        title: `Error saving ${config.entityName.toLowerCase()}`,
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleDeleteClick = (entity: TEntity) => {
    if (apiError) {
      toast({
        title: "API Connection Required",
        description: `Cannot delete ${config.entityNamePlural} without API connection.`,
        variant: "destructive"
      });
      return;
    }
    setEntityToDelete(entity);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!entityToDelete) return;
    
    setIsDeleting(true);
    try {
      await config.service.delete(entityToDelete.id);
      toast({ title: `${config.entityName} deleted successfully` });
      setDeleteDialogOpen(false);
      setEntityToDelete(null);
      
      // Invalidate the React Query cache so other components get updated data
      queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      
      await fetchEntities();
    } catch (error) {
      toast({
        title: `Error deleting ${config.entityName.toLowerCase()}`,
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetryConnection = () => {
    fetchEntities();
  };

  const renderEntityCard = (entity: TEntity) => (
    <div key={entity.id} className="p-6 border rounded-lg text-sm bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 mr-3">
          {config.displayFields.map((field, index) => (
            <div key={field.key as string} className={`${index === 0 ? 'font-medium truncate' : 'text-xs text-gray-500 mt-1'} ${field.className || ''}`}>
              {field.render ? field.render(entity[field.key], entity) : String(entity[field.key] || '')}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {config.customActions && config.customActions(entity)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(entity)}>
                <Edit className="h-3 w-3 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteClick(entity)} className="text-red-600">
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
        <CardTitle className="text-lg">{config.entityName} Management</CardTitle>
        <div className="flex items-center gap-2">
          {apiError && (
            <Button onClick={handleRetryConnection} variant="outline" size="sm">
              Retry Connection
            </Button>
          )}
          <Button onClick={handleCreate} size="sm" disabled={isLoading || !!apiError}>
            <Plus className="h-4 w-4 mr-1" />
            Add {config.entityName}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">API Connection Error</p>
                <p className="text-xs text-red-600 mt-1">{apiError}</p>
              </div>
            </div>
          )}
          
          <div className="relative flex-shrink-0 mb-4 mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={config.searchPlaceholder || `Search ${config.entityNamePlural.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 focus-visible:ring-1"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center my-4">
                  <Loader className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500 text-lg font-medium">Loading {config.entityNamePlural.toLowerCase()}...</p>
                </div>
              </div>
            ) : apiError ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center my-4">
                  <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-500 text-lg font-medium">Unable to load {config.entityNamePlural.toLowerCase()}</p>
                  <p className="text-red-400 text-sm mt-1">Check console for detailed error information</p>
                  <Button onClick={handleRetryConnection} variant="outline" size="sm" className="mt-3">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : entities.length > 0 ? (
              <div className={`grid grid-cols-${config.gridColumns || 3} gap-6`}>
                {entities.map(renderEntityCard)}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center my-4">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No {config.entityNamePlural.toLowerCase()} found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {debouncedSearch ? `No ${config.entityNamePlural.toLowerCase()} match "${debouncedSearch}"` : `No ${config.entityNamePlural.toLowerCase()} available`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {!isLoading && !apiError && totalCount > 0 && (
            <div className="flex-shrink-0 mt-4">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </CardContent>

      <config.ModalComponent
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editItem={editingEntity}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {config.entityName}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {config.entityName.toLowerCase()}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}