import { useState } from 'react';
import {
    Box,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    Tabs,
    Tab,
    Divider,
    Button,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import type { ProjectOutletContext } from '../material_request/MaterialRequests';
import { useOutletContext } from 'react-router-dom';

/* TYPES */

interface Stage {
    id: number;
    name: string;
    status: string;
}

interface Estimate {
    id: number;
    name: string;
    total: number;
}

interface Block {
    id: number;
    name: string;
    stages: Stage[];
    estimates: Estimate[];
}

/* MOCK DATA */
const mockBlocks: Block[] = [
    {
        id: 1,
        name: 'Блок 1 — Фундамент',
        stages: [
            { id: 1, name: 'Подготовка участка', status: 'В работе' },
            { id: 2, name: 'Заливка фундамента', status: 'Не начат' },
        ],
        estimates: [
            { id: 1, name: 'Материалы', total: 250000 },
            { id: 2, name: 'Работы', total: 180000 },
        ],
    },
    {
        id: 2,
        name: 'Блок 2 — Каркас',
        stages: [{ id: 3, name: 'Монтаж конструкций', status: 'Не начат' }],
        estimates: [{ id: 3, name: 'Металлоконструкции', total: 320000 }],
    },
];

/* COMPONENT */
export default function BlocksManagercopytsxtsx() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const [blocks] = useState<Block[]>(mockBlocks);
    const [selectedBlockId, setSelectedBlockId] = useState<number>(mockBlocks[0]?.id ?? 0);
    const [tabIndex, setTabIndex] = useState(0);

    const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

    return (
        <Box sx={{ display: 'flex', height: '100%', gap: 2, p: 2 }}>
            {/* LEFT PANEL */}
            <Paper
                sx={{
                    width: 280,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                }}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Блоки проекта
                </Typography>

                <List disablePadding sx={{ flex: 1 }}>
                    {blocks.map((block) => (
                        <ListItemButton
                            key={block.id}
                            selected={block.id === selectedBlockId}
                            onClick={() => setSelectedBlockId(block.id)}
                            sx={{
                                borderRadius: 2,
                                mb: 1,
                            }}
                        >
                            <ListItemText
                                primary={block.name}
                                secondary={`Этапов: ${block.stages.length}`}
                            />
                        </ListItemButton>
                    ))}
                </List>

                <Button variant="outlined" startIcon={<Add />} sx={{ mt: 2 }}>
                    Добавить блок
                </Button>
            </Paper>

            {/* RIGHT PANEL */}
            <Paper
                sx={{
                    flex: 1,
                    p: 3,
                    borderRadius: 3,
                }}
            >
                {!selectedBlock ? (
                    <Typography>Блокил отсутствуют</Typography>
                ) : (
                    <>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            {selectedBlock.name}
                        </Typography>

                        <Tabs
                            value={tabIndex}
                            onChange={(_, value) => setTabIndex(value)}
                            sx={{ mb: 2 }}
                        >
                            <Tab label="Этапы" />
                            <Tab label="Сметы" />
                        </Tabs>

                        <Divider sx={{ mb: 2 }} />

                        {/* ЭТАПЫ */}
                        {tabIndex === 0 && (
                            <Box>
                                {selectedBlock.stages.length === 0 ? (
                                    <Typography color="text.secondary">
                                        Этапы отсутствуют
                                    </Typography>
                                ) : (
                                    selectedBlock.stages.map((stage) => (
                                        <Paper
                                            key={stage.id}
                                            sx={{
                                                p: 2,
                                                mb: 1,
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Typography fontWeight={600}>{stage.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Статус: {stage.status}
                                            </Typography>
                                        </Paper>
                                    ))
                                )}

                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Add />}
                                    sx={{ mt: 2 }}
                                >
                                    Добавить этап
                                </Button>
                            </Box>
                        )}

                        {/* СМЕТЫ */}
                        {tabIndex === 1 && (
                            <Box>
                                {selectedBlock.estimates.length === 0 ? (
                                    <Typography color="text.secondary">
                                        Сметы отсутствуют
                                    </Typography>
                                ) : (
                                    selectedBlock.estimates.map((estimate) => (
                                        <Paper
                                            key={estimate.id}
                                            sx={{
                                                p: 2,
                                                mb: 1,
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Typography fontWeight={600}>
                                                {estimate.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Сумма: {estimate.total.toLocaleString()} ₽
                                            </Typography>
                                        </Paper>
                                    ))
                                )}

                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Add />}
                                    sx={{ mt: 2 }}
                                >
                                    Добавить смету
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Paper>
        </Box>
    );
}
