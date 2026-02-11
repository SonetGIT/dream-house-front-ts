import Button from '@mui/material/Button';
import { useAppDispatch } from '@/app/store';
import { logout } from '@/features/auth/authSlice';
import { StyledTooltip } from '../ui/StyledTooltip';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login', { replace: true });
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
