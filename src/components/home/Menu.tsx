import React, { useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { useLocation, useNavigate } from 'react-router-dom';
import { VscReferences } from 'react-icons/vsc';
import { UserRound, Building2, UsersRound, HardHat, Handshake } from 'lucide-react';

interface SubItem {
    label: string;
    path: string;
}

interface DrawerItem {
    label: string;
    icon: ReactNode;
    path?: string; // ← добавлено
    subItems?: SubItem[];
}

interface DrawerProps {
    open: boolean;
    onClose: () => void;
}

const drawerItems: DrawerItem[] = [
    {
        label: 'Пользователи',
        path: '/users',
        icon: <UserRound />,
    },
    {
        label: 'Объекты',
        path: '/projects',
        icon: <Building2 />,
    },
    { label: 'Поставщики', path: '/suppliers', icon: <UsersRound /> },
    { label: 'Подрядчики', path: '/contractors', icon: <HardHat /> },
    { label: 'Отдел продаж', path: '/sales', icon: <Handshake /> },
    {
        label: 'Справочники',
        icon: <VscReferences />,
        subItems: [
            { label: 'Материалы', path: '/materials' },
            { label: 'Презентации', path: '/materials' },
        ],
    },
];

/****************************************************************************************************************************/
export default function Menu({ open, onClose }: DrawerProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

    const handleItemClick = (item: DrawerItem) => {
        if (item.subItems?.length) {
            setOpenSubmenus((prev) => ({
                ...prev,
                [item.label]: !prev[item.label],
            }));
        } else if (item.path) {
            onClose();
            navigate(item.path);
        }
    };

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 260,
                    bgcolor: '#f0f7ff',
                    height: '100vh',
                },
            }}
        >
            <Box sx={{ height: '100%' }} role="presentation">
                <List disablePadding>
                    {drawerItems.map((item) => {
                        const isOpen = openSubmenus[item.label] ?? false;
                        const hasSubItems = !!item.subItems?.length;
                        const isActive = item.path && location.pathname === item.path;

                        return (
                            <React.Fragment key={item.label}>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        sx={{
                                            py: 0.9,
                                            pl: 1.9,
                                            my: 0.25,
                                            bgcolor: isActive ? '#b6d3fc' : 'transparent',
                                            color: isActive ? '#032666' : '#1f2937',
                                            '& .MuiListItemIcon-root': {
                                                minWidth: 36,
                                                color: isActive ? '#032666' : '#6b7280',
                                            },
                                            '&:hover': {
                                                bgcolor: isActive ? '#b6d3fc' : '#dee9fa',
                                            },
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleItemClick(item);
                                        }}
                                    >
                                        <ListItemIcon>{item.icon}</ListItemIcon>

                                        <ListItemText
                                            primary={
                                                <span
                                                    className={`text-[14px] font-medium ${
                                                        isActive ? 'text-blue-900' : 'text-gray-800'
                                                    }`}
                                                >
                                                    {item.label}
                                                </span>
                                            }
                                            disableTypography
                                        />

                                        {hasSubItems && (
                                            <ListItemIcon
                                                sx={{ minWidth: 24, justifyContent: 'center' }}
                                            >
                                                {isOpen ? (
                                                    <BiChevronUp size={24} />
                                                ) : (
                                                    <BiChevronDown size={24} />
                                                )}
                                            </ListItemIcon>
                                        )}
                                    </ListItemButton>
                                </ListItem>

                                {hasSubItems && (
                                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                        <List disablePadding>
                                            {item.subItems!.map((subItem) => (
                                                <ListItem key={subItem.label} disablePadding>
                                                    <ListItemButton
                                                        sx={{ py: 0.5, pl: 8 }}
                                                        onClick={() => {
                                                            onClose();
                                                            navigate(subItem.path);
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <span className="text-[12px] text-gray-600">
                                                                    {subItem.label}
                                                                </span>
                                                            }
                                                            disableTypography
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                )}
                            </React.Fragment>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    );
}
