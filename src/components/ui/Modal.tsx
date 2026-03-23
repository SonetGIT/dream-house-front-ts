import { useEffect } from 'react';
import { X } from 'lucide-react';
import { MdDomainAdd } from 'react-icons/md';
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: ModalSize;
}
const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw]',
};

export default function Modal({ isOpen, onClose, title, children, size = 'xl' }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    /******************************************************************************************************************************/
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className={`
                relative w-full
                ${sizeClasses[size]}
                bg-white rounded-xl shadow-2xl
                max-h-[90vh] flex flex-col
            `}
                style={{ animation: 'slideUp 0.3s ease-out' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-sky-600">
                            <MdDomainAdd className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-base font-semibold text-sky-900">{title}</h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="
                            p-1.5 -mr-1.5
                            text-gray-400
                            hover:text-gray-600
                            hover:bg-gray-100
                            rounded-lg
                            transition-colors
                        "
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-4 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
