import {
    Paper,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    CircularProgress,
    IconButton,
    Menu,
} from '@mui/material';
import type { ProjectBlock } from './projectBlocksSlice';
import { MoreVert } from '@mui/icons-material';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
                // display: 'flex',
                flexDirection: 'column',
            }}
            title="ProjectBlocksSidebar.tsx"
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

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
                <button
                    onClick={() => {
                        if (activeBlock) onEdit(activeBlock);
                        closeMenu();
                    }}
                >
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                    </button>
                </button>

                <button
                    onClick={() => {
                        if (activeBlock) onDelete(activeBlock.id);
                        closeMenu();
                    }}
                >
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </button>
            </Menu>

            <button
                onClick={onCreate}
                className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
                <Plus className="w-4 h-4" />
                <span className="text-sm">ДОБАВИТЬ БЛОК</span>
            </button>
        </Paper>
    );
}
