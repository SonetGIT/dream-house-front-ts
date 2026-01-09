import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import UserAvatar from './UserAvatar';
import LogoutButton from './LogoutButton';
import USDRate from '../ui/USDRate';

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header(props: HeaderProps) {
    return (
        <Box>
            <AppBar
                position="static"
                sx={{
                    height: 35,
                    display: 'flex',
                    justifyContent: 'center',
                    background: `linear-gradient(to right, #2c7ecb 0%, #fded59 50%, #fded59 50%, #2c7ecb 100%)`,
                }}
            >
                <Toolbar
                    sx={{
                        position: 'relative',
                    }}
                >
                    <IconButton edge="start" color="inherit" onClick={props.onMenuClick}>
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        component="div"
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: '#2c7ecb',
                        }}
                    >
                        АИС «Dream House»
                    </Typography>

                    <Box
                        sx={{
                            top: '50%',
                            right: -17,
                            display: 'flex',
                            alignItems: 'center',
                            position: 'absolute',
                            transform: 'translateY(-50%)',
                        }}
                    >
                        {' '}
                        <USDRate />
                        <UserAvatar />
                        <LogoutButton />
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
