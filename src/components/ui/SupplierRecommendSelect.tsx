import { useState, useRef, useEffect } from 'react';
import Rating from '@/components/ui/Rating';

export interface SupplierRecommend {
    id: number;
    name: string;
    best_price: number | null;
    avg_rating: number;
}

interface SupplierSelectProps {
    suppliers: SupplierRecommend[];
    value?: number | null;
    disabled?: boolean;
    onChange: (supplier: SupplierRecommend) => void;
}

export default function SupplierRecommendSelect({
    suppliers,
    value,
    disabled,
    onChange,
}: SupplierSelectProps) {
    console.log('disabled', disabled);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = suppliers.find((s) => s.id === value);

    // закрытие при клике вне
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <div
                className={`w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !disabled && setOpen((prev) => !prev)}
            >
                {selected ? (
                    <div className="flex items-center justify-between">
                        <span className="truncate">{selected.name}</span>
                        <Rating value={selected.avg_rating} size="sm" />
                    </div>
                ) : (
                    <span className="text-gray-400">Выбрать</span>
                )}
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-20 w-full mt-1 overflow-auto bg-white border rounded shadow max-h-60">
                    {suppliers.map((s) => (
                        <div
                            key={s.id}
                            className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                                onChange(s);
                                setOpen(false);
                            }}
                        >
                            <div className="flex flex-col">
                                <span className="text-sm">{s.name}</span>
                                {s.best_price != null && (
                                    <span className="text-xs font-medium text-green-600">
                                        {s.best_price}
                                    </span>
                                )}
                            </div>

                            <Rating value={s.avg_rating} size="sm" />
                        </div>
                    ))}

                    {!suppliers.length && (
                        <div className="px-2 py-2 text-sm text-center text-gray-400">
                            Нет данных
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
