import { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

type ActionItem<T> = {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: T) => void;
    className?: string;
};

interface RowActionsProps<T> {
    row: T;
    actions: ActionItem<T>[];
}

export function RowActions<T>({ row, actions }: RowActionsProps<T>) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleClick = () => setOpen(false);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="relative px-2 py-2">
            <div className="flex items-center justify-end">
                {/* Кнопка действий */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen((prev) => !prev);
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-400 transition-all duration-150 rounded-md hover:text-gray-600 hover:bg-gray-100"
                    aria-label="Действия"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                {/* Выпадающее меню */}
                {open && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1 z-50 min-w-[11rem] py-1 bg-white border border-gray-200 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                        {actions.map((action, idx) => {
                            const Icon = action.icon;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        action.onClick(row);
                                        setOpen(false);
                                    }}
                                    className={`
                                        w-full text-left px-3 py-2 text-xs 
                                        transition-colors duration-150
                                        flex items-center gap-2.5
                                        ${action.className || 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                                    `}
                                >
                                    {Icon && <Icon className="flex-shrink-0 w-3.5 h-3.5" />}
                                    <span>{action.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
