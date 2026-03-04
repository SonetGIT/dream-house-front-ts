import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

interface MaterialRow {
    id: string;
    materialType: string;
    material: string;
    unit: string;
    quantity: number;
    coefficient: number;
    currency: string;
    price: number;
    note: string;
}

interface BulkMaterialFormProps {
    isOpen: boolean;
    onClose: () => void;
    // onSubmit: (materials: MaterialRow[]) => void;
}

export default function EstimateItemsCreate({ isOpen, onClose }: BulkMaterialFormProps) {
    const [materials, setMaterials] = useState<MaterialRow[]>([createEmptyRow()]);

    function createEmptyRow(): MaterialRow {
        return {
            id: Math.random().toString(36).substr(2, 9),
            materialType: '',
            material: '',
            unit: 'шт',
            quantity: 1,
            coefficient: 1,
            currency: 'Сом',
            price: 0,
            note: '',
        };
    }

    const materialTypes = [
        'Строительные материалы',
        'Отделочные материалы',
        'Кирпичные материалы',
        'Бетон и цемент',
        'Металлоконструкции',
        'Электрооборудование',
        'Сантехника',
        'Другое',
    ];

    const units = ['шт', 'куб', 'кв.м', 'погонный метр', 'кг', 'тонна', 'упак', 'комплект'];

    const currencies = ['Сом', 'USD', 'EUR', 'RUB'];

    const addRow = () => {
        setMaterials([...materials, createEmptyRow()]);
    };

    const removeRow = (id: string) => {
        if (materials.length > 1) {
            setMaterials(materials.filter((m) => m.id !== id));
        }
    };

    const duplicateRow = (id: string) => {
        const rowToDuplicate = materials.find((m) => m.id === id);
        if (rowToDuplicate) {
            const newRow = { ...rowToDuplicate, id: Math.random().toString(36).substr(2, 9) };
            const index = materials.findIndex((m) => m.id === id);
            const newMaterials = [...materials];
            newMaterials.splice(index + 1, 0, newRow);
            setMaterials(newMaterials);
        }
    };

    const updateRow = (id: string, field: keyof MaterialRow, value: string | number) => {
        setMaterials(materials.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
    };

    const calculateRowSum = (row: MaterialRow) => {
        return row.quantity * row.coefficient * row.price;
    };

    const calculateTotalSum = () => {
        return materials.reduce((sum, row) => sum + calculateRowSum(row), 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Фильтруем только заполненные строки
        const validMaterials = materials.filter((m) => m.materialType && m.material);

        if (validMaterials.length === 0) {
            alert('Добавьте хотя бы один материал');
            return;
        }

        // onSubmit(validMaterials);
        setMaterials([createEmptyRow()]);
        onClose();
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b rounded-t-lg">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Массовое добавление материалов
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Добавьте несколько материалов за раз
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 p-6 overflow-x-auto overflow-y-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-10 bg-gray-50">
                                <tr>
                                    <th className="w-8 px-3 py-3 text-xs font-semibold text-left text-gray-700 border bg-gray-50">
                                        #
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border bg-gray-50 min-w-[180px]">
                                        Тип материала <span className="text-red-500">*</span>
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border bg-gray-50 min-w-[200px]">
                                        Материал <span className="text-red-500">*</span>
                                    </th>
                                    <th className="w-24 px-3 py-3 text-xs font-semibold text-left text-gray-700 border bg-gray-50">
                                        Ед. изм
                                    </th>
                                    <th className="w-24 px-3 py-3 text-xs font-semibold text-right text-gray-700 border bg-gray-50">
                                        Кол-во
                                    </th>
                                    <th className="w-24 px-3 py-3 text-xs font-semibold text-right text-gray-700 border bg-gray-50">
                                        Коэфф.
                                    </th>
                                    <th className="w-20 px-3 py-3 text-xs font-semibold text-left text-gray-700 border bg-gray-50">
                                        Валюта
                                    </th>
                                    <th className="w-32 px-3 py-3 text-xs font-semibold text-right text-gray-700 border bg-gray-50">
                                        Цена
                                    </th>
                                    <th className="w-32 px-3 py-3 text-xs font-semibold text-right text-green-700 border bg-green-50">
                                        Сумма
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border bg-gray-50 min-w-[150px]">
                                        Примечание
                                    </th>
                                    <th className="w-24 px-3 py-3 text-xs font-semibold text-center text-gray-700 border bg-gray-50">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((row, index) => (
                                    <tr key={row.id} className="transition-colors hover:bg-gray-50">
                                        <td className="px-3 py-2 text-sm text-center text-gray-600 border">
                                            {index + 1}
                                        </td>
                                        <td className="px-3 py-2 border">
                                            <select
                                                value={row.materialType}
                                                onChange={(e) =>
                                                    updateRow(
                                                        row.id,
                                                        'materialType',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                <option value="">Выберите тип</option>
                                                {materialTypes.map((type) => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 border">
                                            <input
                                                type="text"
                                                value={row.material}
                                                onChange={(e) =>
                                                    updateRow(row.id, 'material', e.target.value)
                                                }
                                                placeholder="Название материала"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </td>
                                        <td className="px-3 py-2 border">
                                            <select
                                                value={row.unit}
                                                onChange={(e) =>
                                                    updateRow(row.id, 'unit', e.target.value)
                                                }
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                {units.map((unit) => (
                                                    <option key={unit} value={unit}>
                                                        {unit}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 border">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={row.quantity}
                                                onChange={(e) =>
                                                    updateRow(
                                                        row.id,
                                                        'quantity',
                                                        parseFloat(e.target.value) || 0,
                                                    )
                                                }
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-right"
                                            />
                                        </td>
                                        <td className="px-3 py-2 border">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={row.coefficient}
                                                onChange={(e) =>
                                                    updateRow(
                                                        row.id,
                                                        'coefficient',
                                                        parseFloat(e.target.value) || 0,
                                                    )
                                                }
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-right"
                                            />
                                        </td>
                                        <td className="px-3 py-2 border">
                                            <select
                                                value={row.currency}
                                                onChange={(e) =>
                                                    updateRow(row.id, 'currency', e.target.value)
                                                }
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                {currencies.map((curr) => (
                                                    <option key={curr} value={curr}>
                                                        {curr}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 border">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={row.price}
                                                onChange={(e) =>
                                                    updateRow(
                                                        row.id,
                                                        'price',
                                                        parseFloat(e.target.value) || 0,
                                                    )
                                                }
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-right"
                                            />
                                        </td>
                                        <td className="px-3 py-2 border bg-green-50">
                                            <div className="text-sm font-bold text-right text-green-700">
                                                {formatNumber(calculateRowSum(row))}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 border">
                                            <input
                                                type="text"
                                                value={row.note}
                                                onChange={(e) =>
                                                    updateRow(row.id, 'note', e.target.value)
                                                }
                                                placeholder="Примечание"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </td>
                                        <td className="px-3 py-2 border">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => duplicateRow(row.id)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Дублировать строку"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(row.id)}
                                                    disabled={materials.length === 1}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Удалить строку"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="sticky bottom-0 bg-white">
                                <tr>
                                    <td colSpan={11} className="px-3 py-3 border-t-2">
                                        <button
                                            type="button"
                                            onClick={addRow}
                                            className="flex items-center justify-center w-full gap-2 py-2 font-medium text-blue-600 transition-colors border-2 border-blue-300 border-dashed rounded-lg hover:bg-blue-50"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Добавить строку
                                        </button>
                                    </td>
                                </tr>
                                <tr className="bg-gradient-to-r from-green-50 to-green-100">
                                    <td
                                        colSpan={8}
                                        className="px-3 py-4 font-bold text-right text-gray-900 border"
                                    >
                                        ИТОГО:
                                    </td>
                                    <td className="px-3 py-4 text-lg font-bold text-right text-green-700 border">
                                        {formatNumber(calculateTotalSum())}
                                    </td>
                                    <td colSpan={2} className="border"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t rounded-b-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">{materials.length}</span>{' '}
                                {materials.length === 1 ? 'строка' : 'строк(и)'} •
                                <span className="ml-1 font-medium">
                                    {materials.filter((m) => m.material).length}
                                </span>{' '}
                                заполнено
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Сохранить все материалы
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
