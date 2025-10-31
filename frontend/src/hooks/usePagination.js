import { useState, useCallback } from "react";

/**
 * Custom hook for pagination
 */
const usePagination = (initialPage = 1, initialPageSize = 12) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const handlePageChange = useCallback(
    (page, size) => {
      setCurrentPage(page);
      if (size && size !== pageSize) {
        setPageSize(size);
      }
    },
    [pageSize]
  );

  const handlePageSizeChange = useCallback((current, size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setTotal(0);
  }, [initialPage, initialPageSize]);

  return {
    currentPage,
    pageSize,
    total,
    setTotal,
    handlePageChange,
    handlePageSizeChange,
    reset,
  };
};

export default usePagination;
