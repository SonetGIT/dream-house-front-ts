import { Button, type ButtonProps } from '@mui/material';

type AppButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';

type AppButtonProps = ButtonProps & {
    variantType?: AppButtonVariant;
};

const variantStyles: Record<AppButtonVariant, any> = {
    primary: {
        bgcolor: 'var(--primary)',
        color: '#fff',
        '&:hover': {
            bgcolor: '#1f6fb5',
        },
    },
    secondary: {
        bgcolor: 'var(--secondary)',
        color: '#fff',
        '&:hover': {
            bgcolor: '#5b9bd5',
        },
    },
    success: {
        bgcolor: 'var(--success)',
        color: '#fff',
        '&:hover': {
            bgcolor: '#24965f',
        },
    },
    danger: {
        bgcolor: '#ef4444',
        color: '#fff',
        '&:hover': {
            bgcolor: '#dc2626',
        },
    },
    outline: {
        bgcolor: 'transparent',
        color: 'var(--primary)',
        border: '1px solid var(--primary)',
        '&:hover': {
            bgcolor: 'rgba(52, 129, 201, 0.1)',
        },
    },
};

export function AppButton({ variantType = 'outline', sx, ...props }: AppButtonProps) {
    return (
        <Button
            {...props}
            sx={{
                // width: 'auto',
                // maxHeight: '43px',
                m: '0.385rem',
                px: 2,
                py: 0.75,
                borderRadius: 2,
                fontSize: '0.975rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                textTransform: 'none',
                transition: '0.2s ease',
                ...variantStyles[variantType],
                ...sx, // Любые пропсы sx будут переопределять стили
            }}
        />
    );
}
