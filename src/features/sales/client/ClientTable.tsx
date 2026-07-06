import { FolderOpen, Loader2, Mail, Pencil, Phone } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { SalesClient } from '../slices/salesClientsSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatArea } from '@/utils/formatNumber';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { formatDateTime } from '@/utils/formatDateTime';
import { lotTypeMap } from './ClientPage';

interface ClientTableProps {
    clients: SalesClient[];
    refs: Record<string, ReferenceResult>;
    loading?: boolean;
    selectedId?: number | null;
    setModal: (
        modal:
            | { type: 'detail'; client: SalesClient }
            | { type: 'edit'; client: SalesClient }
            | null,
    ) => void;
    // onView: (client: SalesClient) => void;
    // onEdit: (client: SalesClient) => void;
    // onDelete: (client: SalesClient) => void;
}

function UnitStatusBadge({ status }: { status: { name: string; color: string } }) {
    return (
        <span
            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
            style={{
                backgroundColor: status.color + '18',
                color: status.color,
                borderColor: status.color + '40',
            }}
        >
            {status.name}
        </span>
    );
}

/*****************************************************************************************************************************************************/
export default function ClientTable({
    clients,
    refs,
    loading = false,
    selectedId = null,
    // onView,
    // onEdit,
    // onDelete,
    setModal,
}: ClientTableProps) {
    // void onDelete;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                    <p className="text-sm text-gray-500">Загрузка клиентов...</p>
                </div>
            </div>
        );
    }

    if (!loading && clients.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="mb-1 text-base font-medium text-gray-900">Клиенты не найдены</h3>
                <p className="text-sm text-gray-500">
                    Добавьте клиента или измените параметры поиска
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="border-b">
                        <th className="px-3 py-3 text-sm font-semibold text-center text-blue-700 w-18 bg-blue-50">
                            №п/п
                        </th>
                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">ФИО</div>
                        </th>
                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">ПИН</div>
                        </th>
                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">
                                Контактные данные
                            </div>
                        </th>

                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">
                                Объект / Блок
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">Лот</div>
                        </th>
                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">
                                Ответственный
                            </div>
                        </th>
                        <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                            <div className="text-xs text-gray-600 uppercase">Действия</div>
                        </th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => {
                        const unit = client.sales_unit;
                        return (
                            <tr
                                key={client.id}
                                onClick={() => setModal({ type: 'detail', client })}
                                className={`border-b border-border/60 cursor-pointer transition-colors hover:bg-muted/40 ${selectedId === client.id ? 'bg-muted/60' : ''}`}
                            >
                                <td className="px-3 py-3 text-xs font-medium text-center text-gray-600">
                                    {client.id}
                                </td>

                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                                        {client.full_name || '—'}
                                    </div>
                                </td>
                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-semibold text-slate-800">
                                        {client.pin || '—'}
                                    </div>

                                    <div className="mt-1 text-[11px] text-pink-600">
                                        № паспорта:{' '}
                                        <span className="text-xs text-slate-800">
                                            {client.passport_number || '—'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-2.5">
                                    <div className="space-y-1 text-xs">
                                        {client.phone && (
                                            <div className="flex items-center gap-1.5 text-gray-700 text-xs">
                                                <Phone className="w-3.5 h-3.5 text-blue-500" />
                                                {client.phone}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-gray-700">
                                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="truncate max-w-[200px]">
                                                {client.email ? (
                                                    <a
                                                        href={`mailto:${client.email}`}
                                                        className="text-xs font-medium text-sky-600 hover:underline truncate max-w-[160px] block"
                                                    >
                                                        {client.email}
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-2.5">
                                    <div className="text-xs text-muted-foreground space-y-0.5">
                                        {client.sales_project && (
                                            <div className="font-medium text-foreground">
                                                {client.sales_project.name}
                                            </div>
                                        )}
                                        {client.sales_block && <div>{client.sales_block.name}</div>}
                                    </div>
                                </td>
                                <td className="px-3 py-2.5">
                                    {unit ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-medium text-slate-800">
                                                    {lotTypeMap[unit.lot_type] ?? unit.lot_type} №
                                                    {unit.unit_number}
                                                </span>

                                                {unit.status && (
                                                    <UnitStatusBadge status={unit.status} />
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                                                {client.sales_floor && (
                                                    <span>
                                                        {client.sales_floor.floor_number} эт.
                                                    </span>
                                                )}

                                                <span>·</span>

                                                <span>
                                                    {unit.rooms === 0
                                                        ? 'Студия'
                                                        : `${unit.rooms} комн.`}
                                                </span>

                                                <span>·</span>

                                                <span>{formatArea(unit.area_total)}</span>

                                                <span className="font-medium text-lime-800">
                                                    {formatCurrency(unit.price_total)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                </td>
                                {/* Ответственный */}
                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                    {client.manager_user_id
                                        ? refs.users.lookup(Number(client.manager_user_id))
                                        : '—'}
                                    <div className="mt-1 text-[11px] text-slate-500">
                                        Назначен:{' '}
                                        <span className="text-xs text-slate-800">
                                            {formatDateTime(client.assigned_at) || '—'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-3 border-l">
                                    <div
                                        className="flex items-center justify-center gap-1.5"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <StyledTooltip title="WhatsApp">
                                            <a
                                                href={
                                                    client.phone
                                                        ? `https://wa.me/${client.phone}`
                                                        : undefined
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => !client.phone && e.preventDefault()}
                                                className="flex items-center justify-center text-green-600 transition border-green-600 rounded-lg hover:bg-green-50 hover:text-green-700"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                </svg>
                                            </a>
                                        </StyledTooltip>
                                        <StyledTooltip title="Редактировать">
                                            <button
                                                type="button"
                                                onClick={() => setModal({ type: 'edit', client })}
                                                className="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        </StyledTooltip>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
