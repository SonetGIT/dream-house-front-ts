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
                    height: 35,
                    display: 'flex',
                    justifyContent: 'center',
                    background:
                        'linear-gradient(to right, #2c7ecb 0%, #fded59 50%, #fded59 50%, #2c7ecb 100%)',
                }}
            >
                <Toolbar
                    sx={{
                        position: 'relative',
                        minHeight: '35px !important',
                        px: 1.5,
                    }}
                >
                    <IconButton edge="start" color="inherit" onClick={props.onMenuClick}>
                        <RiMenu3Fill />
                    </IconButton>

                    <Typography
                        component="div"
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: '#2c7ecb',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        АИС «DREAM HOUSE»
                    </Typography>

                    <Box
                        sx={{
                            top: '50%',
                            right: -17,
                            display: 'flex',
                            alignItems: 'center',
                            position: 'absolute',
                            transform: 'translateY(-50%)',
                            gap: 0.5,
                        }}
                    >
                        <USDRate />
                        <AppBell onClick={handleBellClick} />
                        <UserAvatar />
                        <LogoutButton />
                    </Box>

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
                        <NotificationsTable />
                    </Popover>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
