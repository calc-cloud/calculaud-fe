import {useEffect, useState} from 'react';

import {ColumnVisibility} from '@/components/common/ColumnControl';
import {
  ColumnSizing,
  loadColumnSizing,
  loadColumnVisibility,
  saveColumnSizing,
  saveColumnVisibility
} from '@/utils/columnStorage';

export const useColumnState = () => {
  // Column visibility state - load from localStorage
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(() => 
    loadColumnVisibility()
  );

  // Column sizing state - load from localStorage
  const [columnSizing, setColumnSizing] = useState<ColumnSizing>(() => 
    loadColumnSizing()
  );

  // Persist column visibility changes to localStorage
  useEffect(() => {
    saveColumnVisibility(columnVisibility);
  }, [columnVisibility]);

  // Persist column sizing changes to localStorage
  useEffect(() => {
    saveColumnSizing(columnSizing);
  }, [columnSizing]);

  return {
    columnVisibility,
    setColumnVisibility,
    columnSizing,
    setColumnSizing
  };
};