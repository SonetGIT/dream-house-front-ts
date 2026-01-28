import { useAppSelector } from '@/app/store';
import type { Users } from '@/features/users/userSlice';
import Avatar from '@mui/material/Avatar';
import { StyledTooltip } from '../ui/StyledTooltip';

const getInitials = (user: Users | null): string => {
    if (!user) return 'esc';
    const { first_name = '', last_name = '', username = '' } = user;
    const firstNm = first_name.trim();
    const lastNm = last_name.trim();
    if (firstNm && lastNm) {
        return (firstNm[0] + lastNm[0]).toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
};

/***********************************************************************************************************************/
export default function UserAvatar() {
    const user = useAppSelector((state) => state.auth.user);
    const initial = getInitials(user);
    const tooltipTxt = user ? `${user.first_name} ${user.last_name}` : 'No user';

    return (
        <StyledTooltip title={tooltipTxt}>
            <Avatar
                sx={{
                    width: 30,
                    height: 30,
                    color: '#2c7ecb',
                    bgcolor: '#ffffff',
                    fontSize: 14,
                    marginRight: 2,
                    fontWeight: 600,
                    cursor: 'default',
                    lineHeight: '28px',
                    border: '1px solid rgba(74, 144, 226, 0.25)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                }}
            >
                {initial}
            </Avatar>
        </StyledTooltip>
    );
}
