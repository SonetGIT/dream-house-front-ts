import { Toaster } from 'react-hot-toast';
import { MdCheckCircle, MdError } from 'react-icons/md';

export const CustomToaster = () => {
    return (
        <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
                className: 'toast',
                success: { icon: <MdCheckCircle color="#4caf50" size={20} /> },
                error: { icon: <MdError color="#f44336" size={20} /> },
            }}
        />
    );
};
