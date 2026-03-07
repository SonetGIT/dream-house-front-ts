import { useState } from 'react';
import { Paper, Typography, Tabs, Tab, Divider, Box } from '@mui/material';
import PrjBreadcrumbs from '../PrjBreadcrumbs';
import type { ProjectBlock } from './projectBlocksSlice';
import { DollarSign, Home, Ruler } from 'lucide-react';
import EstimatesPage from './estimatess/EstimatesPage';
import { useAppSelector } from '@/app/store';
import BlockStagesPage from './blockStages/BlockStagesPage';

interface Props {
    blockId: number | null;
    blockName?: string;
    blocks: ProjectBlock[];
}

/*ЭТАПЫ-СМЕТЫ*******************************************************************************************************************************/
export default function ProjectBlockPage({ blockId, blockName, blocks }: Props) {
    const blockStages = useAppSelector((state) =>
        state.blockStages.data.filter((stage) => stage.block_id === blockId),
    );
    console.log('blockStagesPAGE', blockStages);

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
            <PrjBreadcrumbs />

            <Box
                sx={{
                    mt: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 3,
                    flexWrap: 'wrap',
                }}
            >
                {/* Левая часть — название */}
                <Typography variant="h5" fontWeight={400}>
                    {blockName}
                </Typography>

                {/* Правая часть — карточки */}
                <div className="flex flex-wrap items-center gap-4">
                    {blocks.map((block) => (
                        <div key={block.id} className="flex items-center gap-4">
                            <div className="flex items-center gap-3 px-4 py-2 bg-white border shadow-sm rounded-xl">
                                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Общая стоимость</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {block.planned_budget}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-4 py-2 bg-white border shadow-sm rounded-xl">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                    <Ruler className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Общая площадь</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {block.total_area}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-4 py-2 bg-white border shadow-sm rounded-xl">
                                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                                    <Home className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Продаваемая площадь</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {block.sale_area}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Box>
            <Tabs value={tabIndex} onChange={(_, value) => setTabIndex(value)} sx={{ mb: 1 }}>
                <Tab label="Этапы" />
                <Tab label="Сметы" />
            </Tabs>

            <Divider sx={{ mb: 2 }} />
            <Box>
                {tabIndex === 0 && <BlockStagesPage blockId={blockId} />}
                {tabIndex === 1 && <EstimatesPage blockId={blockId} />}
            </Box>
        </Paper>
    );
}
