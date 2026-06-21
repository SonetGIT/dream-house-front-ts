import { X } from 'lucide-react';
export const ModalWrapper = ({
    title,
    subtitle,
    onClose,
    children,
    maxWidth = 'max-w-xl',
}: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[3px]">
        <div
            className={`flex max-h-[88vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]`}
        >
            <div className="shrink-0 border-b border-stone-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-900">{title}</h3>
                        {subtitle ? (
                            <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
                        ) : null}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={17} />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white p-4">
                <div className="space-y-3">{children}</div>
            </div>
        </div>
    </div>
);

export const ModalSection = ({ children, className = '' }: any) => (
    <div className={`rounded-2xl border border-stone-200 bg-slate-50/80 p-3 ${className}`}>
        {children}
    </div>
);

export const ModalActions = ({ children, className = '' }: any) => (
    <div
        className={`flex items-center justify-end gap-2 border-t border-stone-200 pt-3 ${className}`}
    >
        {children}
    </div>
);

export const InlineHint = ({ children, tone = 'slate', className = '' }: any) => {
    const toneClass =
        tone === 'amber'
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-slate-200 bg-slate-50 text-slate-600';

    return <div className={`rounded-xl border px-3 py-2 text-xs ${toneClass} ${className}`}>{children}</div>;
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
        className={`inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
        {children}
    </button>
);

export const SecondaryButton = ({ children, onClick, disabled, className = '' }: any) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex h-10 items-center justify-center rounded-xl border border-stone-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
        {children}
    </button>
);

export const InputField = ({ label, ...props }: any) => (
    <div>
        {label && (
            <label className="mb-1.5 block text-[12px] font-medium text-slate-600">{label}</label>
        )}
        <input
            className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            {...props}
        />
    </div>
);

export const SelectField = ({ label, children, ...props }: any) => (
    <div>
        {label && (
            <label className="mb-1.5 block text-[12px] font-medium text-slate-600">{label}</label>
        )}
        <select
            className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            {...props}
        >
            {children}
        </select>
    </div>
);

export const TextareaField = ({ label, className = '', ...props }: any) => (
    <div>
        {label && (
            <label className="mb-1.5 block text-[12px] font-medium text-slate-600">{label}</label>
        )}
        <textarea
            className={`min-h-[88px] w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${className}`}
            {...props}
        />
    </div>
);
