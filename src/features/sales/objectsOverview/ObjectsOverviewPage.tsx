import { useAppDispatch, useAppSelector } from '@/app/store';
import { useEffect, useState } from 'react';
import { fetchSalesOverview } from '../slices/salesObjOverviewSlice';
import { AlertCircle, Building2, Loader, RefreshCw } from 'lucide-react';

export default function ObjectsOverviewPage() {
    const dispatch = useAppDispatch();
    const { projects, loading, error } = useAppSelector((s) => s.salesObjOverview);
    const [refreshing, setRefreshing] = useState(false);

    const load = () => {
        setRefreshing(true);
        dispatch(fetchSalesOverview()).finally(() => setRefreshing(false));
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Top bar */}
            <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-sm">
                <div className="px-4 mx-auto max-w-7xl sm:px-6">
                    <div className="flex items-center justify-between gap-4 h-14">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                                <Building2 className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold leading-tight text-foreground">
                                    Отдел продаж
                                </p>
                                <p className="text-xs leading-tight text-muted-foreground">
                                    Сводка по объектам, лотам, лидам и клиентам
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={load}
                            disabled={loading || refreshing}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw
                                className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
                            />
                            Обновить
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 mx-auto space-y-6 max-w-7xl sm:px-6">
                {/* KPI summary */}
                {/* {projects.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
                        {projects.map((kpi) => {
                            const Icon = kpi.icon;
                            const val = kpi.value(projects);
                            return (
                                <div
                                    key={kpi.label}
                                    className="px-4 py-3 text-center border rounded-xl border-border bg-card"
                                >
                                    <Icon className={`mx-auto mb-1.5 h-4 w-4 ${kpi.iconCls}`} />
                                    <p
                                        className={`text-2xl font-bold leading-tight ${kpi.valueCls}`}
                                    >
                                        {fmt(val)}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {kpi.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )} */}

                {/* States */}
                {loading && !refreshing && (
                    <div className="flex items-center justify-center py-24">
                        <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center gap-3 py-24">
                        <AlertCircle className="w-10 h-10 text-destructive/50" />
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <button
                            onClick={load}
                            className="px-4 py-2 text-sm transition-colors border rounded-lg border-border hover:bg-muted"
                        >
                            Повторить
                        </button>
                    </div>
                )}

                {/* Projects grid */}
                {!loading && !error && projects.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
                        <Building2 className="w-10 h-10 opacity-30" />
                        <p className="text-sm">Объекты не найдены</p>
                    </div>
                )}

                {projects.length > 0 && (
                    <div>
                        <div className="flex items-baseline justify-between mb-4">
                            <h2 className="text-foreground">Объекты продаж</h2>
                            <span className="text-sm text-muted-foreground">
                                {projects.length}{' '}
                                {projects.length === 1
                                    ? 'объект'
                                    : projects.length < 5
                                      ? 'объекта'
                                      : 'объектов'}
                            </span>
                        </div>

                        <div className="overflow-hidden border shadow-sm rounded-xl border-border bg-card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40">
                                            <th className="px-4 py-3 text-xs font-medium tracking-wide text-left uppercase text-muted-foreground">
                                                Объект
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wide text-center uppercase text-muted-foreground">
                                                Всего
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wide text-center uppercase text-muted-foreground">
                                                Типы
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide min-w-[140px]">
                                                Распределение
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wide text-center uppercase text-emerald-600">
                                                Свободно
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wide text-center uppercase text-amber-600">
                                                Бронь
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wide text-center uppercase text-sky-600">
                                                Продано
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wide text-center uppercase text-muted-foreground">
                                                Вне продаж
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wide text-center uppercase text-muted-foreground">
                                                Лиды / Кл.
                                            </th>
                                            <th className="px-4 py-3 text-xs font-medium tracking-wide text-right uppercase text-muted-foreground">
                                                Стоимость
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        пока пусто
                                        {/* {projects.map((p) => (
                                            <ProjectRow key={p.id} project={p} />
                                        ))} */}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
