import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { RiMenu3Fill } from 'react-icons/ri';
import UserAvatar from './UserAvatar';
import LogoutButton from './LogoutButton';
import USDRate from '../ui/USDRate';
import AppBell from './AppBell';
import NotificationsTable from '@/features/notification/NotificationsTable';

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header(props: HeaderProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <Box>
            <AppBar
                position="static"
                sx={{
                    height: 42,
                    minHeight: 42,
                    background:
                        'linear-gradient(to right, #2c7ecb 0%, #fded59 50%, #fded59 50%, #2c7ecb 100%)',
                    boxShadow: 'none',
                }}
            >
                <Toolbar
                    sx={{
                        position: 'relative',
                        minHeight: '42px !important',
                        height: 42,
                        pl: 1.5,
                        pr: 0,
                        display: 'grid',
                        gridTemplateColumns: 'auto minmax(0, 1fr) auto auto',
                        alignItems: 'center',
                        columnGap: 1,
                    }}
                >
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={props.onMenuClick}
                        sx={{
                            width: 36,
                            height: 36,
                            p: 0.5,
                        }}
                    >
                        <RiMenu3Fill size={24} />
                    </IconButton>

                    <Typography
                        component="div"
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: '#2c7ecb',
                            fontWeight: 600,
                            fontSize: 17,
                            lineHeight: 1,
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            px: 1,
                            display: {
                                xs: 'none',
                                md: 'block',
                            },
                        }}
                    >
                        Система управления строительным объектом «DREAM HOUSE»
                    </Typography>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifySelf: 'end',
                        }}
                    >
                        <USDRate />
                        <AppBell onClick={handleBellClick} />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifySelf: 'end',
                            gap: 1,
                        }}
                    >
                        <UserAvatar />
                        <LogoutButton />
                    </div>
                </Toolbar>
            </AppBar>

            {/* открывает таблицу уведомлений */}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        borderRadius: 2,
                        width: {
                            xs: '96vw',
                            sm: 760,
                        },
                        maxWidth: '96vw',
                        maxHeight: '80vh',
                        overflow: 'auto',
                    },
                }}
            >
                <NotificationsTable onNavigate={handleClose} />
            </Popover>
        </Box>
    );
}
