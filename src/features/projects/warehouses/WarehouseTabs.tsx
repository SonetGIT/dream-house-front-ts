import type { WarehouseTabType } from './WarehouseRow';

interface WarehouseTabsProps {
    activeTab: WarehouseTabType;
    onChange: (tab: WarehouseTabType) => void;
}

const tabs: { key: WarehouseTabType; label: string }[] = [
    { key: 'materials', label: 'Материалы' },
    { key: 'movements', label: 'Движение материалов' },
    { key: 'writeOffAvr', label: 'Списание по АВР' },
    { key: 'writeOffMbp', label: 'Списание МБП' },
    { key: 'writeOffprocess', label: 'Переработка' },
    { key: 'warehouseTransfers', label: 'Наклданые' },
];

/*******************************************************************************************************/
export default function WarehouseTabs({ activeTab, onChange }: WarehouseTabsProps) {
    return (
        <div className="flex gap-2">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChange(tab.key)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab.key
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
