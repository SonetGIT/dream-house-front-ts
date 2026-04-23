// Импорт иконок
import { CirclePlus, MinusCircle, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { Button } from '@mui/material';
import { StyledTooltip } from './StyledTooltip';

//Вспомогательный компонент (внутри файла)
interface ActionButtonProps {
    icon: React.ReactNode;
    tooltip: string;
    onClick: () => void;
    colors: { main: string; dark: string; bg: string };
}

export const ActionButton = ({ icon, tooltip, onClick, colors }: ActionButtonProps) => (
    <StyledTooltip title={tooltip}>
        <Button
            variant="outlined"
            onClick={onClick}
            sx={{
                minWidth: 28,
                width: 28,
                height: 28,
                p: 0,
                color: colors.main,
                borderColor: colors.main,
                '&:hover': {
                    borderColor: colors.dark,
                    backgroundColor: colors.bg,
                },
            }}
        >
            {icon}
        </Button>
    </StyledTooltip>
);

//Конфигурация кнопок
export const ACTIONS = [
    {
        key: 'receive',
        tooltip: 'Приемка товара',
        icon: <CirclePlus size={18} />,
        colors: { main: '#2e7d32', dark: '#1b5e20', bg: 'rgba(46, 125, 50, 0.1)' },
    },
    {
        key: 'writeOffAvr',
        tooltip: 'Списание по АВР',
        icon: <MinusCircle size={18} />,
        colors: { main: '#7c3aed', dark: '#5b21b6', bg: 'rgba(124, 58, 237, 0.1)' },
    },
    {
        key: 'writeOffMbp',
        tooltip: 'Списание по МБП',
        icon: <MinusCircle size={18} />,
        colors: { main: '#C54550', dark: '#A3323C', bg: 'rgba(197, 69, 80, 0.1)' },
    },
    {
        key: 'processing',
        tooltip: 'Переработка',
        icon: <RefreshCw size={18} />,
        colors: { main: '#0ea5e9', dark: '#0284c7', bg: 'rgba(14, 165, 233, 0.1)' },
    },
    {
        key: 'transfer',
        tooltip: 'Перемещение',
        icon: <ArrowLeftRight size={18} />,
        colors: { main: '#0e24e9', dark: '#0f02c7', bg: 'rgba(55, 68, 124, 0.1)' },
    },
] as const;
