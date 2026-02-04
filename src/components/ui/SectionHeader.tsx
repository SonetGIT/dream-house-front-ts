import { Box, Typography, Chip } from '@mui/material';

interface SectionHeaderProps {
    title: string;
    count?: number;
    size?: 'small' | 'medium';
}

/**
 * Минималистичный заголовок секции
 * - Без иконок
 * - Единый цвет для всех элементов
 * - Поддержка счетчика
 */
export function SectionHeader({ title, count, size = 'medium' }: SectionHeaderProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: -0.85,
            }}
        >
            {/* Заголовок */}
            <Typography
                variant={size === 'small' ? 'subtitle2' : 'h6'}
                fontWeight={600}
                color="#2c7ecb"
                sx={{
                    fontSize: '1rem',
                }}
            >
                {title}
            </Typography>

            {/* Счетчик */}
            {count !== undefined && (
                <Chip
                    label={count}
                    size="small"
                    sx={{
                        height: size === 'small' ? 20 : 24,
                        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
                        fontWeight: 600,
                        bgcolor: '#f3f4f6',
                        color: '#4b5563',
                        borderRadius: '6px',
                    }}
                />
            )}
        </Box>
    );
}
