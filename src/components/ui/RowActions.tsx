import { useState, useEffect, useRef } from 'react';
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
    const ref = useRef<HTMLDivElement>(null);

    // ✅ правильный outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div ref={ref} className="relative px-2 py-2">
            <div className="flex items-center justify-end">
                {/* Кнопка */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); //важно
                        setOpen((prev) => !prev);
                    }}
                    aria-label="Действия"
                    aria-expanded={open}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-400 transition-all duration-150 rounded-md hover:text-gray-600 hover:bg-gray-100"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown */}
                {open && (
                    <div
                        onClick={(e) => e.stopPropagation()} //защита от закрытия строки
                        className="
                            absolute right-0 top-full mt-1 z-50
                            min-w-[11rem]
                            py-1
                            bg-white border border-gray-200
                            rounded-lg shadow-xl
                            animate-in fade-in slide-in-from-top-1 duration-150
                        "
                    >
                        {actions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <button
                                    key={action.label} // ✅ стабильный key
                                    onClick={(e) => {
                                        e.stopPropagation(); //фикс collapse бага
                                        action.onClick(row);
                                        setOpen(false);
                                    }}
                                    className={`
                                        w-full text-left px-3 py-2 text-xs
                                        flex items-center gap-2.5
                                        transition-colors duration-150
                                        ${
                                            action.className ||
                                            'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }
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
