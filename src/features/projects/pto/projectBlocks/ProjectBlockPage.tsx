import { useState } from 'react';
import { Paper, Typography, Tabs, Tab, Divider, Box } from '@mui/material';
import type { ProjectBlock } from './projectBlocksSlice';
import { CheckCircle2, Clock, DollarSign, Home, Ruler, TrendingUp } from 'lucide-react';
import EstimatesPage from './estimatess/EstimatesPage';
import BlockStagesPage from './blockStages/BlockStagesPage';

interface Props {
    blockId: number | null;
    blockName?: string;
    currentBlock: ProjectBlock | null;
}

/*ЭТАПЫ-СМЕТЫ*******************************************************************************************************************************/
export default function ProjectBlockPage({ blockId, blockName, currentBlock }: Props) {
    console.log();
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
            {/* <PrjBreadcrumbs /> */}

            <Box
                sx={{
                    mt: 1,
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
                    {currentBlock && (
                        <div key={currentBlock.id}>
                            {/* Основная информация о блоке */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-3 px-4 py-2 bg-white border shadow-sm rounded-xl">
                                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Общая стоимость</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {currentBlock.planned_budget}
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
                                            {currentBlock.total_area}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 px-4 py-2 bg-white border shadow-sm rounded-xl">
                                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                                        <Home className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">
                                            Продаваемая площадь
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {currentBlock.sale_area}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Статистика выполнения */}
                            <div className="flex items-center gap-6 ml-12 text-sx">
                                {/* ВЫПОЛНЕННЫЙ ОБЪЕМ УСЛУГИ*/}
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span className="text-gray-600">Выполнено:</span>
                                    <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 bg-green-600 text-white text-xs font-semibold rounded-full">
                                        {currentBlock.done_volume.toFixed(1)}
                                    </span>
                                </div>

                                {/* ОСТАТОЧНЫЙ ОБЪЕМ */}
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    <span className="text-gray-600">Осталось:</span>
                                    <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 bg-orange-600 text-white text-xs font-semibold rounded-full">
                                        {currentBlock.remaining_volume.toFixed(1)}
                                    </span>
                                </div>

                                {/* ПРОЦЕНТ ВЫПОЛНЕНИЯ */}
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                    <span className="text-gray-600">Прогресс:</span>
                                    <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 bg-purple-600 text-white text-xs font-semibold rounded-full">
                                        {currentBlock.progress_percent.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
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
