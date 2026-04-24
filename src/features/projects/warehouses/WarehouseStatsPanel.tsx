import React from 'react';

interface WarehouseStatsProps {
    warehouse: {
        material_records_count?: number;
        transfer_count?: number;
        avr_write_off_count?: number;
        mbp_write_off_count?: number;
        processing_write_off_count?: number;
        operation_counts?: {
            '+': number;
            '-': number;
            '=': number;
        };
    };
}

export const WarehouseStatsPanel: React.FC<WarehouseStatsProps> = ({ warehouse }) => {
    if (!warehouse) return null;

    const stats = [
        {
            label: 'Материалы',
            value: warehouse.material_records_count,
            color: 'text-blue-600',
        },
        {
            label: 'Приход',
            value: warehouse?.operation_counts?.['+'] ?? 0,
            color: 'text-green-600',
        },
        {
            label: 'Расход',
            value: warehouse?.operation_counts?.['-'] ?? 0,
            color: 'text-red-500',
        },
        {
            label: 'Перемещения',
            value: warehouse?.operation_counts?.['='] ?? 0,
            color: 'text-rose-700',
        },
        {
            label: 'АВР',
            value: warehouse.avr_write_off_count,
            color: 'text-violet-600',
        },
        {
            label: 'МБП',
            value: warehouse.mbp_write_off_count,
            color: 'text-rose-500',
        },
        {
            label: 'Трансферы',
            value: warehouse.transfer_count,
            color: 'text-orange-800',
        },
    ];

    return (
        <div className="flex flex-wrap items-center gap-4 pb-2">
            {stats.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs">
                    <span className="text-sm">{item.label}:</span>
                    <span className={item.color}>{item.value}</span>
                </div>
            ))}
        </div>
    );
};
