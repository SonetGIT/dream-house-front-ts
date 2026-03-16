import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { Pencil, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Supplier } from './suppliersSlice';
import { formatPhone } from '@/utils/formatPhone';
import Rating from '@/components/ui/Rating';

interface SuppliersTableProps {
    suppliers: Supplier[];
    onEdit: (suppliers: Supplier) => void;
    onDelete: (suppliers: Supplier) => void;
    loading?: boolean;
}

/************************************************************************************************************/
export default function SuppliersTable({
    suppliers,
    onEdit,
    onDelete,
    loading,
}: SuppliersTableProps) {
    const navigate = useNavigate();
    const handleRowClick = (supplier: Supplier) => {
        navigate(`/suppliers/${supplier.id}`, { state: { supplier } });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-gray-500">Загрузка список поставщика...</p>
                </div>
            </div>
        );
    }

    if (suppliers.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="mb-1 text-base font-medium text-gray-900">Нет подрядчиков</h3>
                <p className="text-sm text-gray-500">
                    Добавьте подрядчиков, нажав на кнопку "+ Создать"
                </p>
            </div>
        );
    }

    /*************************************************************************************************************************/
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1400px]">
                <thead>
                    <tr className="text-white bg-gradient-to-r from-sky-600 to-sky-600">
                        <th className="w-12 px-3 py-3 text-xs font-semibold text-left">№</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold w-[140px]">
                            Поставщик
                        </th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">ИНН</th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">КПП</th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">ОГРН</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold w-[120px]">
                            Адрес
                        </th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">Телефон</th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">email</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold w-[120px]">
                            Контактное лицо
                        </th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">Рейтинг</th>
                        <th className="w-20 px-3 py-3 text-xs font-semibold text-center">
                            Действия
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {suppliers.map((supplier, index) => {
                        return (
                            <tr
                                key={supplier.id}
                                className="transition-colors hover:bg-blue-50/50 group"
                            >
                                {/* Номер */}
                                <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">
                                    {index + 1}
                                </td>

                                {/* Название */}
                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-900 truncate max-w-[140px]">
                                        {supplier.name}
                                    </div>
                                </td>

                                {/* ИНН */}
                                <td className="px-3 py-2.5">
                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded">
                                        {supplier.inn}
                                    </span>
                                </td>
                                {/* КПП */}
                                <td className="px-3 py-2.5">
                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded">
                                        {supplier.kpp?.trim() ? supplier.kpp : '-'}
                                    </span>
                                </td>
                                {/* ОГРН */}
                                <td className="px-3 py-2.5">
                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded">
                                        {supplier.ogrn}
                                    </span>
                                </td>
                                {/* Адрес */}
                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                        {supplier.address}
                                    </div>
                                </td>

                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                        {formatPhone(supplier.phone)}
                                    </div>
                                </td>

                                {/* email */}
                                <td className="px-3 py-2.5">
                                    {supplier.email ? (
                                        <a
                                            href={`mailto:${supplier.email}`}
                                            className="text-xs font-medium text-sky-600 hover:underline truncate max-w-[160px] block"
                                        >
                                            {supplier.email}
                                        </a>
                                    ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                    )}
                                </td>

                                {/* Контактное лицо */}
                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                        {supplier.name}
                                    </div>
                                </td>
                                {/* Рейтинг */}
                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                        <Rating value={supplier.avg_rating} size="sm" showValue />
                                    </div>
                                </td>

                                {/* Действия */}
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <StyledTooltip title="Редактировать подрядч">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(supplier);
                                                }}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(supplier);
                                                }}
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
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
