
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Purpose } from '@/types';
import { formatDate } from '@/utils/dateUtils';

interface PurposeTableProps {
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
  const getTotalCostWithCurrencies = (purpose: Purpose) => {
    const costsByCurrency: { [key: string]: number } = {};
    
    purpose.emfs.forEach(emf => {
      emf.costs.forEach(cost => {
        if (!costsByCurrency[cost.currency]) {
          costsByCurrency[cost.currency] = 0;
        }
        costsByCurrency[cost.currency] += cost.amount;
      });
    });

    const costStrings = Object.entries(costsByCurrency).map(
      ([currency, amount]) => `${amount.toFixed(2)} ${currency}`
    );

    return costStrings.length > 0 ? costStrings.join(', ') : '0.00';
  };

  const getEMFIds = (purpose: Purpose) => {
    return purpose.emfs.map(emf => emf.id).join(', ');
  };

  const handleRowClick = (purpose: Purpose) => {
    onView(purpose);
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
            <TableHead className="w-32">Description</TableHead>
            <TableHead className="w-32">Content</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Hierarchy</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>EMF IDs</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead>Expected Delivery</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purposes.map((purpose) => (
            <TableRow 
              key={purpose.id} 
              onClick={() => handleRowClick(purpose)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium w-32">
                <div className="line-clamp-2 text-sm leading-tight">
                  {purpose.description}
                </div>
              </TableCell>
              <TableCell className="w-32">
                <div className="line-clamp-2 text-sm leading-tight">
                  {purpose.content}
                </div>
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
              <TableCell className="max-w-[150px] truncate">
                {getTotalCostWithCurrencies(purpose)}
              </TableCell>
              <TableCell>{formatDate(purpose.expected_delivery)}</TableCell>
              <TableCell>{formatDate(purpose.creation_time)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
