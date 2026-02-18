import { IconButton, Menu, MenuItem, ListItemIcon, Typography } from '@mui/material';
import { MdMoreVert } from 'react-icons/md';
import { useState, type MouseEvent } from 'react';

export interface TableAction {
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: 'default' | 'error';
    hidden?: boolean;
    disabled?: boolean;
}

interface Props {
    actions: TableAction[];
    disabled?: boolean;
}

/*******************************************************************************************************************************/
export function TableRowActions({ actions, disabled = false }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const visibleActions = actions.filter((a) => !a.hidden);

    if (visibleActions.length === 0) return null;

    return (
        <>
            <IconButton size="small" onClick={handleOpen} disabled={disabled}>
                <MdMoreVert size={18} />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={(e) => e.stopPropagation()}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: {
                        minWidth: 160,
                        borderRadius: 1.5,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        mt: 0.5,
                    },
                }}
            >
                {visibleActions.map((action) => (
                    <MenuItem
                        key={action.key}
                        onClick={() => {
                            action.onClick();
                            handleClose();
                        }}
                        disabled={action.disabled}
                        sx={{
                            color: action.color === 'error' ? '#c96161' : 'inherit',
                            '&:hover':
                                action.color === 'error' ? { bgcolor: 'error.lighter' } : undefined,
                        }}
                    >
                        <ListItemIcon>{action.icon}</ListItemIcon>
                        <Typography variant="body2">{action.label}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
