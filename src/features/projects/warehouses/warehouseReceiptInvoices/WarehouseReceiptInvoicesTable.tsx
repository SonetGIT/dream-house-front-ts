import React, { useState } from 'react';
import { Collapse } from '@mui/material';
import { ChevronDown, ChevronRight, ListChecks, Paperclip } from 'lucide-react';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';
import type { Pagination } from '@/features/users/userSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDateTime';
import { TabBtn } from '../../pto/workPerformed/WorkPerformedTable';
import type { WarehouseReceiptInvoice } from './warehouseReceiptInvoicesSlice';
import WarehouseReceiptInvoiceFilesSection from './WarehouseReceiptInvoiceFilesSection';

type WarehouseReceiptInvoiceProps = {
    data: WarehouseReceiptInvoice[];
    loading?: boolean;
    pagination?: Pagination | null;
    onPageChange?: (page: number) => void;
    onSizeChange?: (size: number) => void;
};

type RowTab = 'items' | 'files';

const FALLBACK = '—';

export default function WarehouseReceiptInvoicesTable({
    data = [],
    loading = false,
    pagination = null,
    onPageChange,
    onSizeChange,
}: WarehouseReceiptInvoiceProps) {
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const [rowTabs, setRowTabs] = useState<Record<number, RowTab>>({});

    const projectBlocks = useReference('projectBlocks');
    const users = useReference('users');
    const purchaseOrderItemStatuses = useReference('purchaseOrderItemStatuses');
    const currencies = useReference('currencies');
    const suppliers = useReference('suppliers');
    const unitsOfMeasure = useReference('unitsOfMeasure');

    const toggleRow = (id: number) => {
        setOpenRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const setRowTab = (id: number, tab: RowTab) => {
        setRowTabs((prev) => ({
            ...prev,
            [id]: tab,
        }));
    };

    const getReceiverName = (invoice: WarehouseReceiptInvoice) => {
        const receivedUser = invoice.received_user;
        if (receivedUser) {
            const fullName = [
                receivedUser.last_name,
                receivedUser.first_name,
                receivedUser.middle_name,
            ]
                .filter(Boolean)
                .join(' ')
                .trim();

            return fullName || receivedUser.username || `ID ${receivedUser.id}`;
        }

        return invoice.received_by ? users.lookup(invoice.received_by) : FALLBACK;
    };

    if (loading) {
        return (
            <div className="w-full overflow-hidden rounded-xl border bg-white p-4 text-sm text-gray-500">
                Загрузка...
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="w-full overflow-hidden rounded-xl border bg-white p-4 text-center text-sm text-gray-400">
                Приходные накладные отсутствуют
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="bg-emerald-50 px-1 py-1 text-left" />
                                <th className="bg-emerald-50 px-1 py-1 text-left text-sm font-semibold text-emerald-700">
                                    №
                                </th>
                                <th className="border-l bg-emerald-50 px-1 py-1 text-center">
                                    <div className="text-xs font-semibold uppercase text-emerald-700">
                                        Блок
                                    </div>
                                </th>
                                <th className="border-l bg-emerald-50 px-1 py-1 text-center">
                                    <div className="text-xs font-semibold uppercase text-emerald-700">
                                        Заказ
                                    </div>
                                </th>
                                <th className="border-l bg-emerald-50 px-1 py-1 text-center">
                                    <div className="text-xs font-semibold uppercase text-emerald-700">
                                        Сумма
                                    </div>
                                </th>
                                <th className="border-l bg-emerald-50 px-1 py-1 text-center">
                                    <div className="text-xs font-semibold uppercase text-emerald-700">
                                        Дата приемки
                                    </div>
                                </th>
                                <th className="border-l bg-emerald-50 px-1 py-1 text-center">
                                    <div className="text-xs font-semibold uppercase text-emerald-700">
                                        Принял
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((invoice) => {
                                const activeTab: RowTab = rowTabs[invoice.id] ?? 'items';

                                return (
                                    <React.Fragment key={invoice.id}>
                                        <tr
                                            className="border-b transition-colors hover:bg-gray-50"
                                            onClick={() => toggleRow(invoice.id)}
                                        >
                                            <td className="px-2 py-2">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleRow(invoice.id);
                                                    }}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                >
                                                    {openRows[invoice.id] ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </td>

                                            <td className="px-2 py-2 text-left text-xs font-medium text-gray-700">
                                                {invoice.id}
                                            </td>

                                            <td className="px-2 py-2 text-center text-xs text-gray-900">
                                                {projectBlocks.lookup(invoice.block_id || '')}
                                            </td>

                                            <td className="px-2 py-2 text-center text-xs text-gray-800">
                                                {invoice.purchase_order_id ? (
                                                    <div>
                                                        <div className="font-medium">
                                                            Завка №{invoice.purchase_order_id}
                                                        </div>
                                                        {invoice.purchase_order?.status ? (
                                                            <div className="mt-1 text-[12px] text-emerald-500">
                                                                Статус:{' '}
                                                                {purchaseOrderItemStatuses.lookup(
                                                                    invoice.purchase_order.status,
                                                                )}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    FALLBACK
                                                )}
                                            </td>

                                            <td className="px-2 py-2 text-center text-xs font-semibold text-emerald-700">
                                                {formatCurrency(invoice.total_amount)}
                                            </td>

                                            <td className="px-2 py-2 text-center text-xs text-gray-900">
                                                {formatDateTime(invoice.received_at)}
                                            </td>

                                            <td className="px-2 py-2 text-center text-xs text-gray-900">
                                                {getReceiverName(invoice)}
                                            </td>
                                        </tr>

                                        <tr className="border-b bg-gradient-to-r from-emerald-50/40 to-white">
                                            <td colSpan={9} className="px-3 py-2">
                                                <Collapse in={openRows[invoice.id]} unmountOnExit>
                                                    <div className="px-3 py-2">
                                                        <div className="mb-3 flex items-center gap-0 border-b border-gray-200">
                                                            <TabBtn
                                                                active={activeTab === 'items'}
                                                                icon={
                                                                    <ListChecks className="h-3.5 w-3.5" />
                                                                }
                                                                label="Материалы накладной"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setRowTab(invoice.id, 'items');
                                                                }}
                                                            />
                                                            <TabBtn
                                                                active={activeTab === 'files'}
                                                                icon={<Paperclip className="h-3.5 w-3.5" />}
                                                                label="Файлы"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setRowTab(invoice.id, 'files');
                                                                }}
                                                            />
                                                        </div>

                                                        {activeTab === 'items' ? (
                                                            <div
                                                                onClick={(event) =>
                                                                    event.stopPropagation()
                                                                }
                                                            >
                                                                <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                                                                    <table className="w-full">
                                                                        <thead className="bg-gray-50 text-gray-700">
                                                                            <tr className="border-b">
                                                                                <th className="w-12 px-3 py-3 text-left text-sm font-semibold">
                                                                                    №
                                                                                </th>
                                                                                <th className="px-3 py-2 text-left text-sm">
                                                                                    Материал
                                                                                </th>
                                                                                <th className="w-28 px-3 py-2 text-sm">
                                                                                    Ед. изм
                                                                                </th>
                                                                                <th className="w-28 px-3 py-2 text-sm">
                                                                                    Кол-во
                                                                                </th>
                                                                                <th className="w-32 px-3 py-2 text-sm">
                                                                                    Цена
                                                                                </th>
                                                                                <th className="w-36 px-3 py-2 text-sm">
                                                                                    Сумма
                                                                                </th>
                                                                                <th className="px-3 py-2 text-sm">
                                                                                    Валюта
                                                                                </th>
                                                                                <th className="px-3 py-2 text-center text-sm">
                                                                                    Поставщик
                                                                                </th>
                                                                            </tr>
                                                                        </thead>

                                                                        <tbody>
                                                                            {invoice.items?.map(
                                                                                (item, index) => (
                                                                                    <tr
                                                                                        key={item.id}
                                                                                        className="border-b bg-blue-50/30 hover:bg-gray-50"
                                                                                    >
                                                                                        <td className="px-2 py-2 text-xs font-medium text-gray-600">
                                                                                            {index + 1}
                                                                                        </td>

                                                                                        <td className="px-2 py-2 text-left text-sm text-gray-800">
                                                                                            {item.material
                                                                                                ?.name ||
                                                                                                `Материал ${item.material_id}`}
                                                                                        </td>

                                                                                        <td className="px-2 py-2 text-sm text-gray-700">
                                                                                            {unitsOfMeasure.lookup(
                                                                                                item.unit_of_measure ||
                                                                                                    '',
                                                                                            )}
                                                                                        </td>

                                                                                        <td className="px-2 py-2 font-bold text-green-700">
                                                                                            {item.quantity}
                                                                                        </td>

                                                                                        <td className="px-2 py-2 text-sm text-gray-700">
                                                                                            {item.price}
                                                                                        </td>

                                                                                        <td className="px-2 py-2 text-sm font-semibold text-gray-900">
                                                                                            {
                                                                                                item.total_amount
                                                                                            }
                                                                                        </td>

                                                                                        <td className="px-2 py-2 font-bold text-green-700">
                                                                                            {currencies.lookup(
                                                                                                item.currency ||
                                                                                                    1,
                                                                                            )}
                                                                                        </td>

                                                                                        <td className="px-2 py-2 text-sm text-gray-600">
                                                                                            {suppliers.lookup(
                                                                                                item.supplier_id ||
                                                                                                    '',
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                ),
                                                                            )}

                                                                            {!invoice.items?.length ? (
                                                                                <tr>
                                                                                    <td
                                                                                        colSpan={8}
                                                                                        className="px-3 py-8 text-center text-sm text-gray-400"
                                                                                    >
                                                                                        В накладной пока нет материалов
                                                                                    </td>
                                                                                </tr>
                                                                            ) : null}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <WarehouseReceiptInvoiceFilesSection
                                                                invoiceId={invoice.id}
                                                            />
                                                        )}
                                                    </div>
                                                </Collapse>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {pagination ? (
                    <TablePagination
                        pagination={pagination}
                        onPageChange={(newPage) => {
                            onPageChange?.(newPage);
                        }}
                        onSizeChange={(newSize) => {
                            onSizeChange?.(newSize);
                        }}
                        sizeOptions={[10, 25, 50, 100]}
                        showFirstButton
                        showLastButton
                    />
                ) : null}
            </div>
        </div>
    );
}
