import { useState } from 'react';
import { Paper, Typography, Tabs, Tab, Divider, Box } from '@mui/material';
import BlockStagesList from './blockStages/BlockStagesList';
// import EstimateList from './estimates/EstimateList';

interface Props {
    blockId: number | null;
}

export default function ProjectBlockDetails({ blockId }: Props) {
    const [tabIndex, setTabIndex] = useState(0);

    if (!blockId) {
        return (
            <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
                <Typography color="text.secondary">Блоки отсутствуют</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Блок #{blockId}
            </Typography>

            <Tabs value={tabIndex} onChange={(_, value) => setTabIndex(value)} sx={{ mb: 2 }}>
                <Tab label="Этапы" />
                <Tab label="Сметы" />
            </Tabs>

            <Divider sx={{ mb: 2 }} />

            <Box>
                {tabIndex === 0 && <BlockStagesList blockId={blockId} />}
                {/* {tabIndex === 1 && <EstimateList blockId={blockId} />} */}
            </Box>
        </Paper>
    );
}
