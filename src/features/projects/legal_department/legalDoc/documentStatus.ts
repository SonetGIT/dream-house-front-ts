import type { ChipProps } from '@mui/material';

export const DOCUMENT_STATUS = {
    DRAFT: 1,
    UNDER_REVIEW: 2,
    APPROVED: 3,
    SIGNED: 4,
    REJECTED: 5,
    ARCHIVED: 6,
} as const;

export const DOCUMENT_STATUS_COLOR: Record<number, ChipProps['color']> = {
    1: 'default',
    2: 'warning', // На проверке
    3: 'info',
    4: 'success',
    5: 'error',
    6: 'secondary', // Архив
};
