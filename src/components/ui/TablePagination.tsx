import { IconButton } from '@mui/material';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { Pagination } from '@/features/users/userSlice';

interface TablePaginationProps {
    pagination?: Pagination | null;
    onNext?: () => void;
    onPrev?: () => void;
}

/***********************************************************************************************************************************/
export function TablePagination({ pagination, onNext, onPrev }: TablePaginationProps) {
    if (!pagination) return null;

    return (
        <div className="table-footer-container">
            <span className="page-count">Всего: {pagination.total}</span>
            <div className="pagination">
                <StyledTooltip title="Предыдущая страница">
                    <span>
                        <IconButton
                            size="small"
                            className="table-page-button"
                            onClick={onPrev}
                            disabled={!pagination.hasPrev}
                        >
                            <MdSkipPrevious />
                        </IconButton>
                    </span>
                </StyledTooltip>

                <span className="page-text">
                    стр. <span className="current-page">{pagination.page}</span> /{' '}
                    {pagination.pages}
                </span>

                <StyledTooltip title="Следующая страница">
                    <span>
                        <IconButton
                            size="small"
                            className="table-page-button"
                            onClick={onNext}
                            disabled={!pagination.hasNext}
                        >
                            <MdSkipNext />
                        </IconButton>
                    </span>
                </StyledTooltip>
            </div>
        </div>
    );
}
