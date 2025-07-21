import React from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
                                                                  onPageChange,
                                                                  isLoading = false
}) => {
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Don't render pagination if there are no pages or only one page (unless loading)
  if (totalPages <= 1 && !isLoading) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <Pagination>
        <PaginationContent className={isLoading ? "opacity-75" : ""}>
          <PaginationItem>
            <PaginationPrevious
                onClick={() => !isLoading && onPageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1 || isLoading
                      ? "pointer-events-none opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                }
            />
          </PaginationItem>
          
          {renderPaginationItems()}
          
          <PaginationItem>
            <PaginationNext
                onClick={() => !isLoading && onPageChange(Math.min(totalPages, currentPage + 1))}
                className={
                  currentPage === totalPages || isLoading
                      ? "pointer-events-none opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
