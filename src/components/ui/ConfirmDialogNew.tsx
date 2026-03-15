import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export function ConfirmDialogNew({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Подтвердить',
    cancelText = 'Отмена',
    variant = 'danger',
    loading = false,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const variantClasses = {
        danger: {
            icon: 'text-red-600',
            iconBg: 'bg-red-100',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        },
        warning: {
            icon: 'text-yellow-600',
            iconBg: 'bg-yellow-100',
            button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        },
        info: {
            icon: 'text-blue-600',
            iconBg: 'bg-blue-100',
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        },
    };

    const styles = variantClasses[variant];

    /*************************************************************************************************************/
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Dialog */}
            <div
                className="relative w-full max-w-md bg-white shadow-2xl rounded-xl"
                style={{ animation: 'slideUp 0.3s ease-out' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    {/* Icon */}
                    <div
                        className={`
                        w-12 h-12 rounded-full ${styles.iconBg}
                        flex items-center justify-center
                        mb-4
                    `}
                    >
                        <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
                    <p className="mb-6 text-sm text-gray-600">{message}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`
                            flex-1 flex items-center justify-center gap-2
                            px-4 py-2.5
                            text-sm font-medium text-white
                            ${styles.button}
                            rounded-lg
                            transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed
                            focus:outline-none focus:ring-2 focus:ring-offset-2
                        `}
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {confirmText}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="
                            flex-1
                            px-4 py-2.5
                            text-sm font-medium text-gray-700
                            bg-white
                            border border-gray-300
                            hover:bg-gray-50
                            rounded-lg
                            transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
