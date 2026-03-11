export const STAGE_STATUS = {
    DRAFT: 1,
    SIGNED: 2,
    REJECTED: 3,
    ARCHIVED: 4,
} as const;

export const STAGE_STATUS_LABELS: Record<number, string> = {
    [STAGE_STATUS.DRAFT]: 'Черновик',
    [STAGE_STATUS.SIGNED]: 'Подписан',
    [STAGE_STATUS.REJECTED]: 'Отклонен',
    [STAGE_STATUS.ARCHIVED]: 'Архив',
};

export const STAGE_STATUS_COLORS: Record<number, string> = {
    [STAGE_STATUS.DRAFT]: 'bg-yellow-100 text-yellow-800',
    [STAGE_STATUS.SIGNED]: 'bg-green-100 text-green-800',
    [STAGE_STATUS.REJECTED]: 'bg-red-100 text-red-800',
    [STAGE_STATUS.ARCHIVED]: 'bg-blue-100 text-blue-800',
};
