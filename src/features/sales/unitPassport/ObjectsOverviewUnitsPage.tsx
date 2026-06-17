// src/components/ui/UnitDetails/ModalWrapper.tsx
import { X } from 'lucide-react';
export const ModalWrapper = ({ title, onClose, children, maxWidth = 'max-w-lg' }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div
            className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh]`}
        >
            <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-slate-50 shrink-0">
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                    <X size={18} />
                </button>
            </div>
            <div className="flex-1 p-5 overflow-y-auto">{children}</div>
        </div>
    </div>
);

// src/components/ui/UnitDetails/Buttons.tsx
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
        className={`inline-flex items-center justify-center text-sm font-medium text-white transition bg-blue-600 rounded-lg h-9 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

export const SecondaryButton = ({ children, onClick, disabled, className = '' }: any) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center text-sm font-medium text-slate-700 transition bg-white border border-stone-300 rounded-lg h-9 px-4 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

// src/components/ui/UnitDetails/Inputs.tsx
export const InputField = ({ label, ...props }: any) => (
    <div>
        {label && (
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        )}
        <input
            className="w-full px-3 py-2 text-sm transition-all border rounded-lg outline-none border-stone-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...props}
        />
    </div>
);

export const SelectField = ({ label, children, ...props }: any) => (
    <div>
        {label && (
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        )}
        <select
            className="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none border-stone-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...props}
        >
            {children}
        </select>
    </div>
);
