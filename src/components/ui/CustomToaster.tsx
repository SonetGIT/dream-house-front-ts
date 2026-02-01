import { Toaster } from 'react-hot-toast';
import { MdCheckCircle, MdError } from 'react-icons/md';

export const CustomToaster = () => {
    return (
        <Toaster
            position="top-right"
            gutter={12}
            containerStyle={{ top: 24, right: 24 }}
            toastOptions={{
                duration: 5000, //задержка до 5 секунд
                style: {
                    background: '#ffffff',
                    color: '#1e293b',
                    borderRadius: '11px',
                    padding: '12px 16px',
                    minWidth: '300px',
                    maxWidth: '400px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '1.4',
                    whiteSpace: 'nowrap', // ← запрещаем переносы
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                },

                // Иконки по типам
                success: {
                    icon: <MdCheckCircle size={20} color="#10b981" />,
                    style: {
                        borderLeft: '5px double #10b981',
                    },
                },
                error: {
                    icon: <MdError size={20} color="#ef4444" />,
                    style: {
                        borderLeft: '5px double #ef4444',
                    },
                },
            }}
        />
    );
};
