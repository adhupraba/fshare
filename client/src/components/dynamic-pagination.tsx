import { type ReactNode, useCallback } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { useSearchParams, useLocation } from "react-router-dom";
import { PAGE_QUERY_PARAM } from "@/config/constants";

interface IDynamicPaginationProps {
  totalCount: number;
  pageSize: number;
  page: number;
  disabled?: boolean;
}

export const DynamicPagination: React.FC<IDynamicPaginationProps> = ({ pageSize, totalCount, page, disabled }) => {
  const location = useLocation();
  const [searchParams, _] = useSearchParams();

  const pathname = location.pathname;
  const totalPageCount = Math.ceil(totalCount / pageSize);

  const buildLink = useCallback(
    (newPage: number) => {
      if (!searchParams) return `${pathname}?${PAGE_QUERY_PARAM}=${newPage}`;

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set(PAGE_QUERY_PARAM, String(newPage));
      return `${pathname}?${newSearchParams.toString()}`;
    },
    [searchParams, pathname]
  );

  const renderPageNumbers = () => {
    const items: ReactNode[] = [];
    const maxVisiblePages = 5;

    if (totalPageCount <= maxVisiblePages) {
      for (let i = 1; i <= totalPageCount; i++) {
        items.push(
          <PaginationItem key={i} className={disabled ? "pointer-events-none opacity-50" : undefined}>
            <PaginationLink to={buildLink(i)} isActive={page === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1} className={disabled ? "pointer-events-none opacity-50" : undefined}>
          <PaginationLink to={buildLink(1)} isActive={page === 1}>
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-start" className={disabled ? "pointer-events-none opacity-50" : undefined}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPageCount - 1, page + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i} className={disabled ? "pointer-events-none opacity-50" : undefined}>
            <PaginationLink to={buildLink(i)} isActive={page === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < totalPageCount - 2) {
        items.push(
          <PaginationItem key="ellipsis-end" className={disabled ? "pointer-events-none opacity-50" : undefined}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPageCount} className={disabled ? "pointer-events-none opacity-50" : undefined}>
          <PaginationLink to={buildLink(totalPageCount)} isActive={page === totalPageCount}>
            {totalPageCount}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 w-full">
      <Pagination className="justify-end">
        <PaginationContent className="max-sm:gap-0">
          <PaginationItem>
            <PaginationPrevious
              to={buildLink(Math.max(page - 1, 1))}
              aria-disabled={page === 1 || disabled}
              tabIndex={page === 1 ? -1 : undefined}
              className={page === 1 || disabled ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem>
            <PaginationNext
              to={buildLink(Math.min(page + 1, totalPageCount))}
              aria-disabled={page === totalPageCount || disabled}
              tabIndex={page === totalPageCount ? -1 : undefined}
              className={page === totalPageCount || disabled ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
