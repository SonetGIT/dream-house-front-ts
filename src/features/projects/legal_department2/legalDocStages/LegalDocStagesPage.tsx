import { useEffect } from 'react';
import { Search, Filter, Layers, FileText, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import toast from 'react-hot-toast';
import { Input } from '@mui/material';
import LegalDocStagesTable from './LegalDocStagesTable';
import { fetchLegalDocStages } from './legalDocStageSlice';

export default function LegalDocStagesPage() {
    const dispatch = useAppDispatch();
    const { data: stages, loading, error } = useAppSelector((state) => state.legalDocStages);
    const { items } = useAppSelector((state) => state.legalDocuments);

    useEffect(() => {
        dispatch(fetchLegalDocStages());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleRefresh = () => {
        dispatch(fetchLegalDocStages());
        toast.success('Данные обновлены');
    };

    const totalDocuments = items.filter((doc) => !doc.deleted).length;
    const signedDocuments = items.filter((doc) => doc.status === 3 && !doc.deleted).length;
    const totalValue = items
        .filter((doc) => !doc.deleted)
        .reduce((sum, doc) => sum + (doc.price || 0), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30">
            <div className="max-w-[1600px] mx-auto p-8 space-y-6">
                {/* Шапка */}
                <div className="p-8 bg-white border border-gray-200 shadow-sm rounded-2xl">
                    {/* <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="mb-2 text-4xl font-bold text-gray-900">
                                Этапы юридических документов
                            </h1>
                            <p className="text-lg text-gray-600">
                                Управление этапами и юридических документами
                            </p>
                        </div>
                    </div> */}

                    {/* Поиск и фильтры */}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
                            <Input
                                type="text"
                                placeholder="Поиск по названию этапа или документа..."
                                className="h-12 pl-12 text-base"
                            />
                        </div>
                        <button className="gap-2">
                            <Filter className="w-4 h-4" />
                            Фильтры
                        </button>
                    </div>
                </div>

                {/* Статистика */}
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Всего этапов:</span>
                            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded-full">
                                {stages.length}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700">
                                Всего документов:
                            </span>
                            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-white bg-indigo-500 rounded-full">
                                {totalDocuments}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Подписано:</span>
                            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-full">
                                {signedDocuments}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-purple-600">₽</span>
                            <span className="text-sm font-medium text-gray-700">
                                Общая стоимость:
                            </span>
                            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-white bg-purple-500 rounded-full">
                                {new Intl.NumberFormat('ru-KG', {
                                    style: 'currency',
                                    currency: 'KGS',
                                    minimumFractionDigits: 0,
                                }).format(totalValue)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Таблица этапов с вложенными документами */}
                <div>
                    <LegalDocStagesTable stages={stages} loading={loading} />
                </div>
            </div>
        </div>
    );
}
