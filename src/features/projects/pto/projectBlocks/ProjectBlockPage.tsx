import { useState } from 'react';
import { Paper, Typography, Tabs, Tab, Divider, Box } from '@mui/material';
import BlockStagesList from './blockStages/BlockStagesList';
import MaterialEstimatesList from './estimates/MaterialEstimatesPage';
import PrjBreadcrumbs from '../pto_ui/PrjBreadcrumbs';
import type { ProjectBlock } from './projectBlocksSlice';
import { DollarSign, Home, Ruler } from 'lucide-react';

interface Props {
    blockId: number | null;
    blockName?: string;
    blocks: ProjectBlock[];
}

/*ЭТАПЫ-СМЕТЫ*******************************************************************************************************************************/
export default function ProjectBlockPage({ blockId, blockName, blocks }: Props) {
    const [tabIndex, setTabIndex] = useState(0);
    if (!blockId) {
        return (
            <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
                <Typography color="text.secondary">Блоки отсутствуют</Typography>
            </Paper>
        );
    }
    return (
        <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }} title="ProjectBlockDetails.tsx">
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
                <Typography variant="h5">{blockName}</Typography>

                {/* Правая часть — карточки */}
                <div className="flex items-center gap-4 flex-wrap">
                    {blocks.map((block) => (
                        <div key={block.id} className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Общая стоимость</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {block.planned_budget}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Ruler className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Общая площадь</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {block.total_area}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
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
                <Tab label="Сметыопт" />
            </Tabs>

            <Divider sx={{ mb: 2 }} />
            <Box>
                {tabIndex === 0 && <BlockStagesList blockId={blockId} />}
                {tabIndex === 1 && <MaterialEstimatesList blockId={blockId} />}
                {/* {tabIndex === 2 && <BlockDetail blockId={blockId} />} */}
            </Box>
        </Paper>
    );
}
