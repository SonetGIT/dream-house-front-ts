import { useState } from 'react';
import { ChevronRight, ChevronDown, Pencil, Trash2, Plus, Check, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubStage {
    id: number;
    name: string;
}

interface Stage {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    subStages: SubStage[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_STAGES: Stage[] = [
    {
        id: 1,
        name: 'Каркас монолитный 3',
        startDate: '2026-02-01T00:00',
        endDate: '2026-04-06T00:00',
        subStages: [],
    },
    {
        id: 2,
        name: 'Кирпичная кладка',
        startDate: '',
        endDate: '',
        subStages: [
            { id: 1, name: 'пап' },
            { id: 2, name: 'Кирпичная кладка пол этап тест' },
        ],
    },
    {
        id: 3,
        name: 'Каркас монолитный',
        startDate: '2026-03-03T00:00',
        endDate: '2026-03-06T00:00',
        subStages: [],
    },
    {
        id: 4,
        name: 'Каркас монолитный',
        startDate: '2026-03-03T00:00',
        endDate: '2026-03-06T00:00',
        subStages: [],
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
    if (!iso) return '';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}.${yyyy} - ${hh}:${min}`;
}

function calcDays(start: string, end: string): number | null {
    if (!start || !end) return null;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
}

// ─── Stage Row ────────────────────────────────────────────────────────────────

function StageRow({ stage }: { stage: Stage }) {
    const [expanded, setExpanded] = useState(false);
    const [isAddingSubstage, setIsAddingSubstage] = useState(false);
    const [newSubstageName, setNewSubstageName] = useState('');
    const days = calcDays(stage.startDate, stage.endDate);

    const handleAddSubstage = () => {
        if (newSubstageName.trim()) {
            // TODO: dispatch Redux action to add substage
            console.log('Adding substage:', newSubstageName);
            setNewSubstageName('');
            setIsAddingSubstage(false);
        }
    };

    const handleCancelAdd = () => {
        setNewSubstageName('');
        setIsAddingSubstage(false);
    };

    return (
        <>
            {/* Stage row */}
            <tr
                className="transition-colors bg-white cursor-pointer group hover:bg-blue-50/30"
                onClick={() => setExpanded((v) => !v)}
            >
                {/* Chevron */}
                <td className="w-9 text-center text-gray-400 border-b border-gray-200 pl-2 pr-1 py-2.5">
                    {expanded ? (
                        <ChevronDown className="w-3.5 h-3.5 inline" />
                    ) : (
                        <ChevronRight className="w-3.5 h-3.5 inline" />
                    )}
                </td>

                {/* Name */}
                <td className="text-[13px] text-gray-900 border-b border-gray-200 pl-2 pr-3 py-2.5">
                    {stage.name}
                </td>

                {/* Start */}
                <td className="w-[200px] text-[13px] text-gray-700 border-b border-gray-200 px-3 py-2.5">
                    {fmtDate(stage.startDate)}
                </td>

                {/* End */}
                <td className="w-[200px] text-[13px] text-gray-700 border-b border-gray-200 px-3 py-2.5">
                    {fmtDate(stage.endDate)}
                </td>

                {/* Duration */}
                <td
                    className="w-[180px] text-[13px] text-red-500 font-medium text-center border-b border-gray-200 px-3 py-2.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {days !== null ? `${days} дн.` : <span className="text-red-300">дн.</span>}
                </td>

                {/* Actions */}
                <td
                    className="w-[72px] text-center border-b border-gray-200 px-3 py-2.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            className="text-gray-400 transition-colors hover:text-indigo-600"
                            title="Редактировать"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            className="text-gray-400 transition-colors hover:text-red-500"
                            title="Удалить"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Expanded substages section */}
            {expanded && (
                <tr className="bg-gray-50">
                    <td className="border-b border-gray-200 w-9" />
                    <td
                        colSpan={5}
                        className="px-5 py-4 border-b border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="ml-3">
                            {/* Substages header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                    Подэтапы
                                </div>
                                {!isAddingSubstage && (
                                    <button
                                        onClick={() => setIsAddingSubstage(true)}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md border border-indigo-200 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Добавить подэтап
                                    </button>
                                )}
                            </div>

                            {/* Substages list */}
                            <div className="flex flex-col gap-2">
                                {stage.subStages.map((sub, idx) => (
                                    <div
                                        key={sub.id}
                                        className="group/substage flex items-center justify-between px-3.5 py-2.5 bg-white rounded-md border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all text-[13px]"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold">
                                                {idx + 1}
                                            </span>
                                            <span className="text-gray-700">{sub.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 transition-opacity opacity-0 group-hover/substage:opacity-100">
                                            <button
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                title="Редактировать"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Удалить"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Empty state */}
                                {stage.subStages.length === 0 && !isAddingSubstage && (
                                    <div className="py-5 text-center text-gray-400 text-[13px] italic">
                                        Нет подэтапов
                                    </div>
                                )}

                                {/* Add substage form */}
                                {isAddingSubstage && (
                                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-md border-2 border-indigo-300 shadow-sm text-[13px]">
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold flex-shrink-0">
                                            {stage.subStages.length + 1}
                                        </span>
                                        <input
                                            type="text"
                                            value={newSubstageName}
                                            onChange={(e) => setNewSubstageName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddSubstage();
                                                if (e.key === 'Escape') handleCancelAdd();
                                            }}
                                            placeholder="Введите название подэтапа..."
                                            autoFocus
                                            className="flex-1 border-none outline-none text-[13px] text-gray-700 placeholder:text-gray-400"
                                        />
                                        <div className="flex flex-shrink-0 gap-1">
                                            <button
                                                onClick={handleAddSubstage}
                                                className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                                                title="Сохранить"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={handleCancelAdd}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                title="Отменить"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
    return (
        <div className="min-h-screen bg-[#F1F4F9] p-8">
            <div className="max-w-[1200px] mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                    {/* ── Header ── */}
                    <thead>
                        <tr>
                            {/* Chevron col */}
                            <th className="bg-blue-600 border-b border-blue-600 w-9" />

                            {/* Name */}
                            <th className="bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-2.5 text-left border-b border-blue-600 border-r border-blue-600">
                                Название этапа
                            </th>

                            {/* Start */}
                            <th className="w-[200px] bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-2.5 text-left border-b border-blue-600 border-r border-blue-600">
                                Дата начала
                            </th>

                            {/* End */}
                            <th className="w-[200px] bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-2.5 text-left border-b border-blue-600 border-r border-red-300">
                                Дата окончания
                            </th>

                            {/* Duration — pink accent */}
                            <th className="w-[180px] bg-rose-200 text-rose-700 text-[11px] font-bold tracking-wider uppercase px-3 py-2.5 text-center border-b border-rose-300 border-r border-gray-200">
                                Продолжительность (дни)
                            </th>

                            {/* Actions */}
                            <th className="w-[72px] bg-gray-50 text-gray-400 text-[11px] font-bold tracking-wider uppercase px-3 py-2.5 text-center border-b border-gray-200">
                                Действия
                            </th>
                        </tr>
                    </thead>

                    {/* ── Body ── */}
                    <tbody>
                        {MOCK_STAGES.map((stage) => (
                            <StageRow key={stage.id} stage={stage} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
