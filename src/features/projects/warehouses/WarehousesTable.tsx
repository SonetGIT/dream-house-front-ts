import { RiArrowRightUpBoxFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { Warehouse } from './warehousesSlice';
import type { Pagination } from '../../users/userSlice';
import { MdAdsClick } from 'react-icons/md';
import { TablePagination } from '@/components/ui/TablePagination';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { Pencil, Phone, Trash2 } from 'lucide-react';
import { formatPhoneDisplay } from '@/utils/formatPhoneNumber';

interface WarehousesTablePropsType {
    data: Warehouse[];
    refs: Record<string, ReferenceResult>;
}

/*******************************************************************************************************************************/
export default function WarehousesTable({ data, refs }: WarehousesTablePropsType) {
    const navigate = useNavigate();
    const handleRowClick = (warehouse: Warehouse) => {
        navigate(`${warehouse.id}`, { state: { warehouse } });
    };

    /*******************************************************************************************************************************/
    return (
        <div className="space-y-4">
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="px-4 py-3 text-left bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Название склада
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Код
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Адрес
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-left text-blue-700 uppercase">
                                        Телефон
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold uppercase text-violet-700">
                                        Кол-во позиций
                                    </div>
                                </th>
                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((whs) => (
                                <tr
                                    key={whs.id}
                                    className="transition-colors hover:bg-sky-50/50 group"
                                    // onClick={() => handlePrjBlocksRowClick(block)}
                                >
                                    <td className="px-3 py-2 ">
                                        <div className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                            {whs.name}
                                        </div>
                                    </td>

                                    <td className="px-3 py-2 text-center border-l">
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-sky-700 bg-sky-100 border border-sky-200 rounded">
                                            {whs.code}
                                        </span>
                                    </td>

                                    <td className="px-3 py-2 text-sm text-center border-l">
                                        {whs.address}
                                    </td>

                                    <td className="px-3 py-2 text-center border-l">
                                        <div className="space-y-1 text-sm">
                                            {whs.phone && (
                                                <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    {formatPhoneDisplay(whs.phone)}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td
                                        className="px-3 py-2 font-medium text-center border-l border-gray-200 text-violet-800"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {whs.items?.length || 0} поз.
                                    </td>

                                    {/* Действия */}
                                    <td className="px-3 py-2 border-l">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <StyledTooltip title="Редактировать">
                                                <button
                                                    // onClick={(e) => {
                                                    //     e.stopPropagation();
                                                    //     onEdit(whs);
                                                    // }}
                                                    className="
                                                    p-1.5
                                                    text-gray-400
                                                    hover:text-blue-600
                                                    hover:bg-blue-50
                                                    rounded
                                                    transition-colors
                                                "
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                            </StyledTooltip>
                                            <StyledTooltip title="Удалить">
                                                <button
                                                    // onClick={(e) => {
                                                    //     e.stopPropagation();
                                                    //     onDelete(whs.id);
                                                    // }}
                                                    className="
                                                    p-1.5
                                                    text-gray-400
                                                    hover:text-red-600
                                                    hover:bg-red-50
                                                    rounded
                                                    transition-colors
                                                "
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </StyledTooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
