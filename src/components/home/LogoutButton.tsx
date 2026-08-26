import { useAppDispatch } from '@/app/store';
import { logout } from '@/features/auth/authSlice';
import { StyledTooltip } from '../ui/StyledTooltip';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login', { replace: true });
    };

    return (
        <StyledTooltip title="Выйти">
            <IconButton
                size="medium"
                color="inherit"
                onClick={handleLogout}
                sx={{
                    p: 0.5,
                    right: -25,
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.12)',
                    },
                }}
            >
                <LogOut size={18} />
            </IconButton>
        </StyledTooltip>
    );
}
