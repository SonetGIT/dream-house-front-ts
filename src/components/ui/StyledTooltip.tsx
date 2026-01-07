import { Tooltip, tooltipClasses, type TooltipProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#fdf395 ',
        color: '#2c7ecb',
        fontWeight: 500,
        borderRadius: '5px',
        maxWidth: 200,
        fontSize: '0.8125rem',
        // padding: '4px 10px',
        // boxShadow: theme.shadows[4], // или оставить как есть
        // lineHeight: 1.4,
        // [`& .${tooltipClasses.arrow}`]: {
        //     color: theme.palette.grey[900],
        // },
    },
}));

export { StyledTooltip };
