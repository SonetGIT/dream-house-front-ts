import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination2({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            {/* Info */}
            <div className="text-sm text-gray-600">
                Показано <span className="font-medium text-gray-900">{startItem}</span> -{' '}
                <span className="font-medium text-gray-900">{endItem}</span> из{' '}
                <span className="font-medium text-gray-900">{totalItems}</span> записей
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1">
                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={!canGoPrev}
                    className={`
            p-1.5 border rounded-md transition-colors
            ${
                canGoPrev
                    ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
            }
          `}
                    title="Первая страница"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!canGoPrev}
                    className={`
            p-1.5 border rounded-md transition-colors
            ${
                canGoPrev
                    ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
            }
          `}
                    title="Предыдущая"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-2 text-sm text-gray-400"
                                >
                                    ...
                                </span>
                            );
                        }

                        const pageNum = page as number;
                        const isActive = pageNum === currentPage;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`
                  px-3 py-1.5 min-w-[36px] text-sm font-medium
                  border rounded-md transition-colors
                  ${
                      isActive
                          ? 'text-white bg-blue-600 border-blue-600'
                          : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                  }
                `}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                {/* Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!canGoNext}
                    className={`
            p-1.5 border rounded-md transition-colors
            ${
                canGoNext
                    ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
            }
          `}
                    title="Следующая"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={!canGoNext}
                    className={`
            p-1.5 border rounded-md transition-colors
            ${
                canGoNext
                    ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
            }
          `}
                    title="Последняя страница"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
