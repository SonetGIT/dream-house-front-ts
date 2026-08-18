import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from './app/store';
import {
    changeOwnPassword,
    fetchProfile,
    logout,
    setAuthChecked,
} from './features/auth/authSlice';

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

        toast.error('Р”Р»СЏ СЃРјРµРЅС‹ РїР°СЂРѕР»СЏ РІРѕР№РґРёС‚Рµ Р·Р°РЅРѕРІРѕ СЃ РІСЂРµРјРµРЅРЅС‹Рј РїР°СЂРѕР»РµРј');
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
            toast.error('Р’РІРµРґРёС‚Рµ РЅРѕРІС‹Р№ РїР°СЂРѕР»СЊ Рё РїРѕРІС‚РѕСЂРёС‚Рµ РµРіРѕ');
            return;
        }

        if (passwords.newPassword !== passwords.repeatPassword) {
            toast.error('РџР°СЂРѕР»Рё РЅРµ СЃРѕРІРїР°РґР°СЋС‚');
            return;
        }

        if (!resetPasswordSource) {
            toast.error('РќРµ СѓРґР°Р»РѕСЃСЊ РѕРїСЂРµРґРµР»РёС‚СЊ РІСЂРµРјРµРЅРЅС‹Р№ РїР°СЂРѕР»СЊ. Р’РѕР№РґРёС‚Рµ Р·Р°РЅРѕРІРѕ.');
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
        <div className="app-container">
            <Header onMenuClick={handleMenuClick} />
            <Menu open={drawerOpen} onClose={handleDrawerClose} />

            <main className="text-center">
                <Outlet />
            </main>
            <Footer />

            <ChangePasswordModal
                open={resetRequired}
                newPassword={passwords.newPassword}
                repeatPassword={passwords.repeatPassword}
                onChange={handlePasswordChange}
                onSave={handlePasswordSave}
                onClose={() => {}}
                loading={loading}
            />
        </div>
    );
}
