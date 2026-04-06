import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from './app/store';
import { fetchProfile, setAuthChecked } from './features/auth/authSlice';

import Header from './components/home/Header';
import Footer from './components/home/Footer';
import Menu from './components/home/Menu';

export default function App() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const { user, isAuthChecked } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleMenuClick = () => setDrawerOpen(true);
    const handleDrawerClose = () => setDrawerOpen(false);

    //Восстанавливаем сессию
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            dispatch(fetchProfile());
        } else {
            dispatch(setAuthChecked()); //ВАЖНО
        }
    }, [dispatch]);

    //Редирект ТОЛЬКО после проверки
    useEffect(() => {
        if (!isAuthChecked) return; //ЖДЁМ

        if (!user) {
            navigate('/login');
        }
    }, [user, isAuthChecked, navigate]);

    //Можно показать loader
    if (!isAuthChecked) {
        return <div>Loading...</div>;
    }

    /* RENDER */
    return (
        <div className="app-container">
            <Header onMenuClick={handleMenuClick} />
            <Menu open={drawerOpen} onClose={handleDrawerClose} />

            <main>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
