import {
  ColumnDef,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

import { ColumnVisibility } from "@/components/common/ColumnControl";
import { PurposeContextMenu } from "@/components/shared/PurposeContextMenu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminData } from "@/contexts/AdminDataContext";
import { Purpose } from "@/types";
import { ColumnSizing, loadColumnSizing, saveColumnSizing } from "@/utils/columnStorage";
import { hasAdminRole } from "@/utils/roleUtils";
import { SortConfig } from "@/utils/sorting";

import { createColumns } from "./columns";

interface TanStackPurposeTableProps {
  purposes: Purpose[];
  isLoading?: boolean;
  columnVisibility?: ColumnVisibility;
  sortConfig?: SortConfig;
  onSortChange?: (config: SortConfig) => void;
  columnSizing?: ColumnSizing;
  onColumnSizingChange?: (sizing: ColumnSizing) => void;
  onToggleFlag?: (purpose: Purpose) => void;
  onDeletePurpose?: (purpose: Purpose) => void;
}

export const TanStackPurposeTable: React.FC<TanStackPurposeTableProps> = ({
  purposes,
  isLoading = false,
  columnVisibility,
  sortConfig,
  onSortChange,
  columnSizing,
  onColumnSizingChange,
  onToggleFlag,
  onDeletePurpose,
}) => {
  const { hierarchies } = useAdminData();
  const navigate = useNavigate();
  const auth = useAuth();
  const isAdmin = hasAdminRole(auth.user);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    purpose: Purpose | null;
  }>({ visible: false, x: 0, y: 0, purpose: null });

  // Convert our ColumnVisibility to TanStack's VisibilityState
  const visibilityState: VisibilityState = useMemo(() => {
    if (!columnVisibility) return {};

    return {
      status: columnVisibility.status,
      statusMessage: columnVisibility.statusMessage,
      description: columnVisibility.description,
      content: columnVisibility.content,
      supplier: columnVisibility.supplier,
      pendingAuthority: columnVisibility.pendingAuthority,
      hierarchy: columnVisibility.hierarchy,
      serviceType: columnVisibility.serviceType,
      budgetSource: columnVisibility.budgetSource,
      purchases: columnVisibility.purchases,
      emfIds: columnVisibility.emfIds,
      demandIds: columnVisibility.demandIds,
      totalCost: columnVisibility.totalCost,
      expectedDelivery: columnVisibility.expectedDelivery,
      createdAt: columnVisibility.createdAt,
      lastModified: columnVisibility.lastModified,
    };
  }, [columnVisibility]);

  // Convert our ColumnSizing to TanStack's ColumnSizingState
  const sizingState: ColumnSizingState = useMemo(() => {
    return columnSizing || loadColumnSizing();
  }, [columnSizing]);

  // Create columns with hierarchies and sort props
  const columns = useMemo<ColumnDef<Purpose>[]>(
    () => createColumns(hierarchies, sortConfig, onSortChange),
    [hierarchies, sortConfig, onSortChange]
  );

  const handleColumnSizingChange = useCallback(
    (updater: any) => {
      if (typeof updater === "function") {
        const newSizing = updater(sizingState);
        onColumnSizingChange?.(newSizing);
        saveColumnSizing(newSizing);
      } else {
        onColumnSizingChange?.(updater);
        saveColumnSizing(updater);
      }
    },
    [sizingState, onColumnSizingChange]
  );

  const table = useReactTable({
    data: purposes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility: visibilityState,
      columnSizing: sizingState,
    },
    onColumnSizingChange: handleColumnSizingChange,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
  });

  const handleRowClick = (purpose: Purpose) => {
    navigate(`/purposes/${purpose.id}`);
  };

  const handleContextMenu = (e: React.MouseEvent, purpose: Purpose) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      purpose,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, purpose: null });
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (_event: MouseEvent) => {
      if (contextMenu.visible) {
        handleCloseContextMenu();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && contextMenu.visible) {
        handleCloseContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);

      return () => {
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [contextMenu.visible]);

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
      <Table
        style={{
          width: table.getCenterTotalSize(),
          minWidth: "100%",
        }}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    width: header.getSize(),
                    position: "relative",
                  }}
                  className="text-center relative before:content-[''] before:absolute before:right-0 before:top-3 before:bottom-3 before:w-px before:bg-border"
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}

                  {/* Resize handle */}
                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 transition-colors ${
                        header.column.getIsResizing() ? "bg-primary" : ""
                      }`}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              onClick={() => handleRowClick(row.original)}
              onContextMenu={(e) => (isAdmin ? handleContextMenu(e, row.original) : e.preventDefault())}
              className={`cursor-pointer h-20 ${
                row.original.is_flagged ? "bg-red-50 hover:bg-red-100" : "hover:bg-muted/50"
              }`}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={{
                    width: cell.column.getSize(),
                  }}
                  className="text-center"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.purpose && onToggleFlag && onDeletePurpose && (
        <PurposeContextMenu
          purpose={contextMenu.purpose}
          onToggleFlag={onToggleFlag}
          onDeletePurpose={onDeletePurpose}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          open={contextMenu.visible}
          onOpenChange={handleCloseContextMenu}
        />
      )}
    </div>
  );
};
