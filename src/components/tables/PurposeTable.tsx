
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Purpose } from '@/types';
import { formatDate } from '@/utils/dateUtils';

interface Purp​oseTableProps {
  purposes: Purpose[];
  onView: (purpose: Purpose) => void;
  onEdit: (purpose: Purpose) => void;
  onDelete: (purposeId: string) => void;
  isLoading?: boolean;
}

export const PurposeTable: React.FC<PurposeTableProps> = ({
  purposes,
  onView,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const getTotalCost = (purpose: Purpose) => {
    return purpose.emfs.reduce((total, emf) => 
      total + emf.costs.reduce((emfTotal, cost) => emfTotal + cost.amount, 0), 0
    );
  };

  const getEMFIds = (purpose: Purpose) => {
    return purpose.emfs.map(emf => emf.id).join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading purposes...</p>
      </div>
    );
  }

  if (purposes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No purposes found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Hierarchy</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>EMF IDs</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead>Expected Delivery</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purposes.map((purpose) => (
            <TableRow key={purpose.id}>
              <TableCell className="font-medium max-w-[200px] truncate">
                {purpose.description}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {purpose.content}
              </TableCell>
              <TableCell>{purpose.supplier}</TableCell>
              <TableCell>{purpose.hierarchy_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{purpose.service_type}</Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={purpose.status === 'Completed' ? 'default' : 
                           purpose.status === 'In Progress' ? 'secondary' :
                           purpose.status === 'Rejected' ? 'destructive' : 'outline'}
                >
                  {purpose.status}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[150px] truncate">
                {getEMFIds(purpose) || 'None'}
              </TableCell>
              <TableCell>
                {getTotalCost(purpose).toFixed(2)} {purpose.currency}
              </TableCell>
              <TableCell>{formatDate(purpose.expected_delivery)}</TableCell>
              <TableCell>{formatDate(purpose.creation_time)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(purpose)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(purpose)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(purpose.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
