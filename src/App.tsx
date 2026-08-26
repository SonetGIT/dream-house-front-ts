import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from './app/store';
import { changeOwnPassword, fetchProfile, logout, setAuthChecked } from './features/auth/authSlice';

import Header from './components/home/Header';
import Footer from './components/home/Footer';
import Menu from './components/home/Menu';
import ChangePasswordModal from './components/ui/ChangePasswordModal';

const RESET_PASSWORD_SOURCE_KEY = 'resetPasswordSource';

export default function App() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [passwords, setPasswords] = useState({
        newPassword: '',
        repeatPassword: '',
    });

    const { user, isAuthChecked, resetRequired, loading } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const resetPasswordSource =
        typeof window !== 'undefined' ? sessionStorage.getItem(RESET_PASSWORD_SOURCE_KEY) : null;

    const handleMenuClick = () => setDrawerOpen(true);
    const handleDrawerClose = () => setDrawerOpen(false);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            dispatch(fetchProfile());
        } else {
            dispatch(setAuthChecked());
        }
    }, [dispatch]);

    useEffect(() => {
        if (!isAuthChecked) return;

        if (!user) {
            navigate('/login');
        }
    }, [user, isAuthChecked, navigate]);

    useEffect(() => {
        if (!resetRequired && typeof window !== 'undefined') {
            sessionStorage.removeItem(RESET_PASSWORD_SOURCE_KEY);
        }
    }, [resetRequired]);

    useEffect(() => {
        if (!isAuthChecked || !user || !resetRequired || resetPasswordSource) return;
        toast.error('Для смены пароля войдите заново с временным паролем');

        dispatch(logout());
        navigate('/login');
    }, [dispatch, isAuthChecked, navigate, resetPasswordSource, resetRequired, user]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords((prev) => ({
            ...prev,
            [e.target.id]: e.target.value,
        }));
    };

    const handlePasswordSave = () => {
        if (!passwords.newPassword || !passwords.repeatPassword) {
            toast.error('Введите новый пароль и повторите его');
            return;
        }

        if (passwords.newPassword !== passwords.repeatPassword) {
            toast.error('Пароли не совпадают');
            return;
        }

        if (!resetPasswordSource) {
            toast.error('Не удалось определить временный пароль. Войдите заново.');
            dispatch(logout());
            navigate('/login');
            return;
        }

        dispatch(
            changeOwnPassword({
                oldPassword: resetPasswordSource,
                newPassword: passwords.newPassword,
            }),
        )
            .unwrap()
            .then((res) => {
                toast.success(res.message);
                sessionStorage.removeItem(RESET_PASSWORD_SOURCE_KEY);
                setPasswords({ newPassword: '', repeatPassword: '' });
            })
            .catch((err: string) => toast.error(err));
    };

    if (!isAuthChecked) {
        return <div>Loading...</div>;
    }
    return (
        <div className="flex flex-col min-h-screen">
            <Header onMenuClick={handleMenuClick} />
            <Menu open={drawerOpen} onClose={handleDrawerClose} />

            <main className="flex-1">
                <Outlet />
            </main>
            <ChangePasswordModal
                open={resetRequired}
                newPassword={passwords.newPassword}
                repeatPassword={passwords.repeatPassword}
                onChange={handlePasswordChange}
                onSave={handlePasswordSave}
                onClose={() => {}}
                loading={loading}
            />
            <Footer />
        </div>
    );

    // return (
    //     // <div className="app-container">
    //     <div>
    //         <Header onMenuClick={handleMenuClick} />
    //         <Menu open={drawerOpen} onClose={handleDrawerClose} />

    //         {/* <main className="text-center"> */}
    //         <main>
    //             <Outlet />
    //         </main>
    //         <Footer />

    //         <ChangePasswordModal
    //             open={resetRequired}
    //             newPassword={passwords.newPassword}
    //             repeatPassword={passwords.repeatPassword}
    //             onChange={handlePasswordChange}
    //             onSave={handlePasswordSave}
    //             onClose={() => {}}
    //             loading={loading}
    //         />
    //     </div>
    // );
}
