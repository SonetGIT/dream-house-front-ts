import {
    TablePagination as MuiTablePagination,
    type TablePaginationProps as MuiTablePaginationProps,
    IconButton,
    Typography,
    Box,
} from '@mui/material';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

interface CustomTablePaginationProps extends Omit<MuiTablePaginationProps, 'component'> {
    component?: React.ElementType;
}

/**
 * Расширенная пагинация с:
 * - Кастомными иконками (MdSkipPrevious/MdSkipNext)
 * - Поддержкой всех пропсов MUI TablePagination
 * - Вашей стилизацией через CSS-классы
 */
export default function TablePagination({
    component = 'div',
    count,
    page,
    onPageChange,
    rowsPerPage,
    onRowsPerPageChange,
    rowsPerPageOptions = [5, 10, 25, 50],
    labelRowsPerPage = 'Строк на странице:',
    labelDisplayedRows = ({ from, to, count }) => `${from}-${to} из ${count}`,
    ...props
}: CustomTablePaginationProps) {
    // Обработчики для кастомных кнопок
    const handlePrev = () => {
        if (page > 0) onPageChange(null, page - 1);
    };

    const handleNext = () => {
        if (page < Math.ceil(count / rowsPerPage) - 1) {
            onPageChange(null, page + 1);
        }
    };

    // Вычисляем hasPrev/hasNext
    const hasPrev = page > 0;
    const hasNext = page < Math.ceil(count / rowsPerPage) - 1;

    return (
        <MuiTablePagination
            component={component}
            count={count}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={rowsPerPageOptions}
            labelRowsPerPage={labelRowsPerPage}
            labelDisplayedRows={labelDisplayedRows}
            {...props}
            // Кастомные элементы
            ActionsComponent={() => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StyledTooltip title="Предыдущая страница">
                        <span>
                            <IconButton
                                size="small"
                                className="table-page-button"
                                onClick={handlePrev}
                                disabled={!hasPrev}
                                aria-label="Предыдущая страница"
                            >
                                <MdSkipPrevious />
                            </IconButton>
                        </span>
                    </StyledTooltip>

                    <Typography
                        variant="body2"
                        className="page-text"
                        sx={{
                            minWidth: '80px',
                            textAlign: 'center',
                            color: 'text.primary',
                        }}
                    >
                        стр. <span className="current-page">{page + 1}</span> /{' '}
                        {Math.ceil(count / rowsPerPage)}
                    </Typography>

                    <StyledTooltip title="Следующая страница">
                        <span>
                            <IconButton
                                size="small"
                                className="table-page-button"
                                onClick={handleNext}
                                disabled={!hasNext}
                                aria-label="Следующая страница"
                            >
                                <MdSkipNext />
                            </IconButton>
                        </span>
                    </StyledTooltip>
                </Box>
            )}
            // Стили для совместимости с вашим CSS
            sx={{
                '& .MuiTablePagination-displayedRows': {
                    display: 'none', // Скрываем стандартный текст "1-10 of 100"
                },
                '& .MuiTablePagination-selectLabel': {
                    display: 'none', // Скрываем "Rows per page:"
                },
                '& .MuiTablePagination-select': {
                    display: 'none', // Скрываем select
                },
                '& .MuiTablePagination-input': {
                    display: 'none',
                },
                // Сохраняем вашу структуру
                '& .table-footer-container': {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '16px',
                },
                '& .pagination': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                },
                ...props.sx,
            }}
        />
    );
}
