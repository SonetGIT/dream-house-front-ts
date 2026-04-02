import { useReference } from '@/features/reference/useReference';
import { useMemo, useState } from 'react';

interface Props {
    items: any[];
    // onSubmit: (items: any[]) => void;
}

export default function PurchaseItemsSelector({ items }: Props) {
    const suppliers = useReference('suppliers').data ?? [];

    const availableItems = useMemo(() => {
        return items.filter((i) => i.status === 2 && i.remaining_quantity > 0);
    }, [items]);

    const [selected, setSelected] = useState<Record<number, boolean>>({});
    const [edited, setEdited] = useState<Record<number, any>>({});

    const toggle = (id: number) => {
        setSelected((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const update = (id: number, field: string, value: any) => {
        setEdited((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    const getRow = (item: any) => {
        const e = edited[item.id] || {};

        const quantity = Math.min(e.quantity ?? item.remaining_quantity, item.remaining_quantity);

        const price = e.price ?? item.price ?? 0;
        const rate = e.currency_rate ?? item.currency_rate ?? 1;

        return {
            ...item,
            ...e,
            quantity,
            price,
            currency_rate: rate,
            summ: quantity * price * rate,
        };
    };

    const selectedRows = availableItems.filter((i) => selected[i.id]).map(getRow);

    return (
        <div className="bg-white border rounded-xl">
            <table className="w-full text-sm">
                <thead className="text-gray-600 bg-gray-50">
                    <tr>
                        <th></th>
                        <th>Материал</th>
                        <th>Остаток</th>
                        <th>Кол-во</th>
                        <th>Цена</th>
                        <th>Курс</th>
                        <th>Сумма</th>
                        <th>Поставщик</th>
                    </tr>
                </thead>

                <tbody>
                    {availableItems.map((item) => {
                        const row = getRow(item);

                        return (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                {/* select */}
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!!selected[item.id]}
                                        onChange={() => toggle(item.id)}
                                    />
                                </td>

                                <td className="font-medium">{item.material?.name}</td>

                                <td className="text-gray-500">{item.remaining_quantity}</td>

                                {/* quantity */}
                                <td>
                                    <input
                                        type="number"
                                        value={row.quantity}
                                        max={item.remaining_quantity}
                                        onChange={(e) =>
                                            update(item.id, 'quantity', Number(e.target.value))
                                        }
                                        className="w-20 px-2 py-1 border rounded"
                                    />
                                </td>

                                {/* price */}
                                <td>
                                    <input
                                        type="number"
                                        value={row.price}
                                        onChange={(e) =>
                                            update(item.id, 'price', Number(e.target.value))
                                        }
                                        className="w-24 px-2 py-1 border rounded"
                                    />
                                </td>

                                {/* rate */}
                                <td>
                                    <input
                                        type="number"
                                        value={row.currency_rate}
                                        onChange={(e) =>
                                            update(item.id, 'currency_rate', Number(e.target.value))
                                        }
                                        className="w-20 px-2 py-1 border rounded"
                                    />
                                </td>

                                {/* sum */}
                                <td className="font-semibold text-green-600">
                                    {row.summ.toFixed(2)}
                                </td>

                                {/* supplier */}
                                <td>
                                    <select
                                        value={row.supplier_id || ''}
                                        onChange={(e) =>
                                            update(item.id, 'supplier_id', Number(e.target.value))
                                        }
                                        className="px-2 py-1 border rounded"
                                    >
                                        <option value="">Выбрать</option>
                                        {suppliers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* ACTION */}
            <div className="flex justify-end p-3">
                <button
                    disabled={selectedRows.length === 0}
                    // onClick={() => onSubmit(selectedRows)}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    Создать заявку
                </button>
            </div>
        </div>
    );
}
