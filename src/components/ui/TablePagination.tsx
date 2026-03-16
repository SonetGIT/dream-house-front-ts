import type { Pagination } from '@/features/users/userSlice';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { StyledTooltip } from './StyledTooltip';

interface TablePaginationProps {
    // Обязательные пропсы
    pagination: Pagination;
    onPageChange: (newPage: number) => void;

    // Опциональные пропсы
    onSizeChange?: (newSize: number) => void;
    sizeOptions?: number[];
    labelRowsPerPage?: string;
    showFirstButton?: boolean;
    showLastButton?: boolean;
    className?: string;
}

/***********************************************************************************************************************/
export function TablePagination({
    pagination,
    onPageChange,
    onSizeChange,
    sizeOptions = [5, 10, 25, 50],
    labelRowsPerPage = 'Строк на странице:',
    showFirstButton = false,
    showLastButton = false,
    className = '',
}: TablePaginationProps) {
    const { page, size, total, pages, hasNext, hasPrev } = pagination;

    // Вычисления для отображения диапазона
    const from = total === 0 ? 0 : (page - 1) * size + 1;
    const to = Math.min(total, page * size);

    // Обработчики
    const handleFirstPage = () => {
        if (hasPrev) onPageChange(1);
    };

    const handlePrevPage = () => {
        if (hasPrev) onPageChange(page - 1);
    };

    const handleNextPage = () => {
        if (hasNext) onPageChange(page + 1);
    };

    const handleLastPage = () => {
        if (hasNext) onPageChange(pages);
    };

    const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (onSizeChange) {
            onSizeChange(Number(event.target.value));
        }
    };

    // Базовые классы для кнопок
    const buttonClass = `
        inline-flex items-center justify-center
        w-8 h-8 rounded-md
        text-gray-600 hover:text-gray-900
        hover:bg-gray-100
        transition-colors
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
    `;

    // Отображаемый текст диапазона
    const displayedRowsText = `${from}-${to} из ${total}`;

    return (
        <div
            className={`flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white ${className}`}
        >
            {/* Left side: Rows per page selector and displayed rows */}
            <div className="flex items-center gap-4">
                {onSizeChange && sizeOptions.length > 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                            {labelRowsPerPage}
                        </span>
                        <select
                            value={size}
                            onChange={handleSizeChange}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                        >
                            {sizeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Displayed rows */}
                <span className="text-sm font-medium text-gray-600">{displayedRowsText}</span>
            </div>

            {/* Right side: Navigation */}
            <div className="flex items-center gap-3">
                {showFirstButton && (
                    <StyledTooltip title="Первая страница">
                        <span>
                            <button
                                onClick={handleFirstPage}
                                disabled={!hasPrev}
                                className={buttonClass}
                                aria-label="Первая страница"
                            >
                                <MdSkipPrevious className="w-5 h-5" />
                                <MdSkipPrevious className="w-5 h-5 -ml-4" />
                            </button>
                        </span>
                    </StyledTooltip>
                )}

                <StyledTooltip title="Предыдущая страница">
                    <span>
                        <button
                            onClick={handlePrevPage}
                            disabled={!hasPrev}
                            className={buttonClass}
                            aria-label="Предыдущая страница"
                        >
                            <MdSkipPrevious className="w-5 h-5" />
                        </button>
                    </span>
                </StyledTooltip>

                {/* Page info */}
                <span className="text-sm text-gray-600 min-w-[100px] text-center">
                    стр. <span className="font-semibold text-gray-900">{page}</span> -{' '}
                    <span className="text-gray-700">{pages}</span>
                </span>

                <StyledTooltip title="Следующая страница">
                    <span>
                        <button
                            onClick={handleNextPage}
                            disabled={!hasNext}
                            className={buttonClass}
                            aria-label="Следующая страница"
                        >
                            <MdSkipNext className="w-5 h-5" />
                        </button>
                    </span>
                </StyledTooltip>

                {showLastButton && (
                    <StyledTooltip title="Последняя страница">
                        <span>
                            <button
                                onClick={handleLastPage}
                                disabled={!hasNext}
                                className={buttonClass}
                                aria-label="Последняя страница"
                            >
                                <MdSkipNext className="w-5 h-5" />
                                <MdSkipNext className="w-5 h-5 -ml-4" />
                            </button>
                        </span>
                    </StyledTooltip>
                )}
            </div>
        </div>
    );
}
