import { Tooltip, tooltipClasses, type TooltipProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#2c7ecb',
        color: '#ffffff',
        fontWeight: 500,
        borderRadius: '6px',
        maxWidth: 220,
        fontSize: '0.8125rem',
        padding: '6px 10px',
        lineHeight: 1.35,
        boxShadow: '0 4px 14px rgba(44, 126, 203, 0.22)',
        border: '2px solid rgba(253, 237, 89, 0.45)',
    },
    [`& .${tooltipClasses.arrow}`]: {
        color: '#2c7ecb',
    },
}));
export { StyledTooltip };
