import { useEffect, useState } from 'react';
import { Paper, Typography, Tabs, Tab, Divider, Box } from '@mui/material';
import { CheckCircle2, Clock, DollarSign, Home, Ruler, TrendingUp } from 'lucide-react';
import EstimatesPage from './estimatess/EstimatesPage';
import BlockStagesPage from './blockStages/BlockStagesPage';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchProjectBlocks } from './projectBlocksSlice';

/*ЭТАПЫ-СМЕТЫ*******************************************************************************************************************************/
export default function EstimatesStagePage() {
    const dispatch = useAppDispatch();
    const { projectId, prjBlockId } = useParams();
    const blockId = prjBlockId ? Number(prjBlockId) : null;

    const { data: blocks } = useAppSelector((state) => state.projectBlocks);

    const currentBlock = blocks.find((b) => b.id === blockId) ?? null;

    const blockName = currentBlock?.name || '';

    useEffect(() => {
        if (Number(projectId)) {
            dispatch(
                fetchProjectBlocks({
                    page: 1,
                    size: 10,
                    project_id: Number(projectId),
                }),
            );
        }
    }, [dispatch, Number(projectId)]);

    if (blockId === null) {
        return (
            <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
                <Typography color="text.secondary">Блоки отсутствуют</Typography>
            </Paper>
        );
    }
    console.log(prjBlockId);
    console.log(blockId);

    const [tabIndex, setTabIndex] = useState(0);

    return (
        <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
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
                                        {Number(currentBlock.done_volume ?? 0).toFixed(1)}
                                    </span>
                                </div>

                                {/* ОСТАТОЧНЫЙ ОБЪЕМ */}
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    <span className="text-gray-600">Осталось:</span>
                                    <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 bg-orange-600 text-white text-xs font-semibold rounded-full">
                                        {Number(currentBlock.remaining_volume ?? 0).toFixed(1)}
                                    </span>
                                </div>

                                {/* ПРОЦЕНТ ВЫПОЛНЕНИЯ */}
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                    <span className="text-gray-600">Прогресс:</span>
                                    <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 bg-purple-600 text-white text-xs font-semibold rounded-full">
                                        {Number(currentBlock.progress_percent ?? 0).toFixed(1)}%
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
                {tabIndex === 1 && <EstimatesPage blockId={blockId} blockName={blockName} />}
            </Box>
        </Paper>
    );
}
