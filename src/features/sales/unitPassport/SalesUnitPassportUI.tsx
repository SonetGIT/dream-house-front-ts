import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

export function HeaderIconAction({
    title,
    icon,
    className,
    onClick,
    disabled = false,
}: {
    title: string;
    icon: ReactNode;
    className: string;
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <StyledTooltip title={title}>
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={`flex h-6 w-6 items-center justify-center rounded-lg text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            >
                {icon}
            </button>
        </StyledTooltip>
    );
}

export const ModalWrapper = ({
    title,
    subtitle,
    onClose,
    children,
    maxWidth = 'max-w-xl',
}: any) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
        <div
            className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
        >
            <div className="shrink-0 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-white px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate">{title}</h3>
                        {subtitle ? (
                            <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
                        ) : null}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
            <div className="flex-1 px-4 py-3 overflow-y-auto bg-white">
                <div className="space-y-3">{children}</div>
            </div>
        </div>
    </div>
);

export const ModalSection = ({ children, className = '' }: any) => (
    <div className={`rounded-xl ${className}`}>{children}</div>
);

export const ModalActions = ({ children, className = '' }: any) => (
    <div
        className={`flex items-center justify-end gap-2 border-t border-gray-100 bg-white pt-3 ${className}`}
    >
        {children}
    </div>
);

export const InlineHint = ({ children, tone = 'slate', className = '' }: any) => {
    const toneClass =
        tone === 'amber'
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-slate-200 bg-slate-50 text-slate-600';

    return (
        <div className={`rounded-xl border px-3 py-2 text-xs ${toneClass} ${className}`}>
            {children}
        </div>
    );
};

export const PrimaryButton = ({
    children,
    onClick,
    disabled,
    type = 'button',
    className = '',
}: any) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex h-10 items-center justify-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
        {children}
    </button>
);

export const SecondaryButton = ({ children, onClick, disabled, className = '' }: any) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
        {children}
    </button>
);

export const InputField = ({ label, ...props }: any) => (
    <div>
        {label && (
            <label className="block mb-1 text-sm font-semibold text-left text-sky-800">
                {label}
            </label>
        )}
        <input
            className="w-full px-3 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg outline-none h-9 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-sky-400"
            {...props}
        />
    </div>
);

export const SelectField = ({ label, children, ...props }: any) => (
    <div>
        {label && (
            <label className="mb-1.5 block text-left text-sm font-semibold text-sky-800">
                {label}
            </label>
        )}
        <select
            className="w-full px-3 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg outline-none h-9 focus:border-transparent focus:ring-2 focus:ring-sky-400"
            {...props}
        >
            {children}
        </select>
    </div>
);

export const TextareaField = ({ label, className = '', ...props }: any) => (
    <div>
        {label && (
            <label className="mb-1.5 block text-sm font-semibold text-sky-800">{label}</label>
        )}
        <textarea
            className={` w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-sky-400 ${className}`}
            {...props}
        />
    </div>
);
