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
import SwitchAccountSharpIcon from '@mui/icons-material/SwitchAccountSharp';
import SupervisedUserCircleSharpIcon from '@mui/icons-material/SupervisedUserCircleSharp';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { VscReferences } from 'react-icons/vsc';

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
        icon: <SwitchAccountSharpIcon />,
    },
    {
        label: 'Проекты',
        path: '/projects',
        icon: <AssessmentOutlinedIcon />,
    },
    { label: 'Поставщики', path: '/suppliers', icon: <SupervisedUserCircleSharpIcon /> },
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
        <Drawer anchor="left" open={open} onClose={onClose}>
            <Box sx={{ width: 240 }} role="presentation">
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
                                            // py: 0.9,
                                            // pl: 1.9,
                                            bgcolor: isActive ? 'action.selected' : 'inherit',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleItemClick(item);
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <span className="text-[13px] text-gray-800 font-medium">
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
