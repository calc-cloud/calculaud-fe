import { Check, Columns } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export interface ColumnVisibility {
  status: boolean;
  description: boolean;
  content: boolean;
  supplier: boolean;
  pendingAuthority: boolean;
  hierarchy: boolean;
  serviceType: boolean;
  purchases: boolean;
  emfIds: boolean;
  demandIds: boolean;
  totalCost: boolean;
  expectedDelivery: boolean;
  createdAt: boolean;
  lastModified: boolean;
  statusMessage: boolean;
}

export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  status: true,
  description: true,
  content: true,
  supplier: true,
  pendingAuthority: false,
  hierarchy: true,
  serviceType: true,
  purchases: true,
  emfIds: true,
  demandIds: false,
  totalCost: true,
  expectedDelivery: true,
  createdAt: false,
  lastModified: true,
  statusMessage: false,
};

const COLUMN_LABELS = {
  status: "Status",
  description: "Description",
  content: "Content",
  supplier: "Supplier",
  pendingAuthority: "Pending Authority",
  hierarchy: "Hierarchy",
  serviceType: "Service Type",
  purchases: "Purchases",
  emfIds: "EMF IDs",
  demandIds: "Demand IDs",
  totalCost: "Total Cost",
  expectedDelivery: "Expected Delivery",
  createdAt: "Created At",
  lastModified: "Last Modified",
  statusMessage: "Status Message",
};

interface ColumnControlProps {
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
  triggerText?: string;
}

export const ColumnControl: React.FC<ColumnControlProps> = ({
  columnVisibility,
  onColumnVisibilityChange,
  triggerText = "Columns",
}) => {
  const [open, setOpen] = useState(false);

  const visibleColumnsCount = Object.values(columnVisibility).filter(Boolean).length;
  const totalColumnsCount = Object.keys(columnVisibility).length;

  const handleColumnToggle = (columnKey: keyof ColumnVisibility) => {
    onColumnVisibilityChange({
      ...columnVisibility,
      [columnKey]: !columnVisibility[columnKey],
    });
  };

  const handleShowAll = () => {
    onColumnVisibilityChange(DEFAULT_COLUMN_VISIBILITY);
  };

  const handleHideAll = () => {
    // Keep at least one column visible (description as it's essential)
    const allHidden = Object.keys(columnVisibility).reduce(
      (acc, key) => ({
        ...acc,
        [key]: key === "description",
      }),
      {} as ColumnVisibility
    );
    onColumnVisibilityChange(allHidden);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Columns className="h-4 w-4" />
          {triggerText}
          <span className="text-xs text-muted-foreground">
            ({visibleColumnsCount}/{totalColumnsCount})
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Column Visibility</h4>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShowAll} className="flex-1">
              <Check className="h-3 w-3 mr-1" />
              Show All
            </Button>
            <Button variant="outline" size="sm" onClick={handleHideAll} className="flex-1">
              Hide All
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            {Object.entries(COLUMN_LABELS).map(([key, label]) => {
              const columnKey = key as keyof ColumnVisibility;
              const isChecked = columnVisibility[columnKey];
              const isDisabled = key === "description" && visibleColumnsCount === 1;

              return (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={isChecked}
                    onCheckedChange={() => !isDisabled && handleColumnToggle(columnKey)}
                    disabled={isDisabled}
                  />
                  <Label
                    htmlFor={key}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                      isDisabled ? "text-muted-foreground" : "cursor-pointer"
                    }`}
                  >
                    {label}
                    {isDisabled && <span className="text-xs text-muted-foreground ml-2">(Required)</span>}
                  </Label>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground">
            <p>
              {visibleColumnsCount} of {totalColumnsCount} columns visible
            </p>
            <p className="mt-1">
              Description column is always required and cannot be hidden when it's the only visible column.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
