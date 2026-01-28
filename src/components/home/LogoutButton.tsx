import Button from '@mui/material/Button';
import { useAppDispatch } from '@/app/store';
import { logout } from '@/features/auth/authSlice';
import { StyledTooltip } from '../ui/StyledTooltip';

export default function LogoutButton() {
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = '/login';
    };

    return (
        <StyledTooltip title="выйти">
            <Button
                size="small"
                color="inherit"
                style={{ fontSize: '13px' }}
                onClick={handleLogout}
            >
                esc
            </Button>
        </StyledTooltip>
    );
}
