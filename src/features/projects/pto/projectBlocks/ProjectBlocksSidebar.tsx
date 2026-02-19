import {
    Paper,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    CircularProgress,
    Button,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import type { ProjectBlock } from './projectBlocksSlice';
import { Add, MoreVert } from '@mui/icons-material';
import { useState } from 'react';

interface Props {
    blocks: ProjectBlock[];
    selectedBlockId: number | null;
    onSelect: (id: number) => void;
    onCreate: () => void;
    onEdit: (block: ProjectBlock) => void;
    onDelete: (id: number) => void;
    loading: boolean;
}

/*БЛОКИ***************************************************************************************************************************/
export default function ProjectBlocksSidebar({
    blocks,
    selectedBlockId,
    onSelect,
    onCreate,
    onEdit,
    onDelete,
    loading,
}: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeBlock, setActiveBlock] = useState<ProjectBlock | null>(null);

    const openMenu = (event: React.MouseEvent<HTMLElement>, block: ProjectBlock) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setActiveBlock(block);
    };

    const closeMenu = () => {
        setAnchorEl(null);
        setActiveBlock(null);
    };

    return (
        <Paper
            sx={{
                width: 280,
                p: 2,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography variant="h6" sx={{ mb: 2 }}>
                Блоки проекта
            </Typography>

            {loading && <CircularProgress size={24} />}

            <List disablePadding sx={{ flex: 1 }}>
                {blocks.map((block) => (
                    <ListItemButton
                        key={block.id}
                        selected={block.id === selectedBlockId}
                        onClick={() => onSelect(block.id)}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <ListItemText primary={block.name} />

                        <IconButton size="small" onClick={(e) => openMenu(e, block)}>
                            <MoreVert fontSize="small" />
                        </IconButton>
                    </ListItemButton>
                ))}
            </List>

            <Button variant="outlined" startIcon={<Add />} sx={{ mt: 2 }} onClick={onCreate}>
                Добавить блок
            </Button>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
                <MenuItem
                    onClick={() => {
                        if (activeBlock) onEdit(activeBlock);
                        closeMenu();
                    }}
                >
                    Редактировать
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        if (activeBlock) onDelete(activeBlock.id);
                        closeMenu();
                    }}
                    sx={{ color: 'error.main' }}
                >
                    Удалить
                </MenuItem>
            </Menu>
        </Paper>
    );
}
