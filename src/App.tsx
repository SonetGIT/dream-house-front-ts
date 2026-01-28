import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppSelector } from './app/store';
import Header from './components/home/Header';
import Footer from './components/home/Footer';
import Menu from './components/home/Menu';

export default function App() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { user } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();

    const handleMenuClick = () => setDrawerOpen(true);
    const handleDrawerClose = () => setDrawerOpen(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    /*RENDER*************************************************************************************************************************/
    return (
        <div className="app-container">
            <Header onMenuClick={handleMenuClick} />
            <Menu open={drawerOpen} onClose={handleDrawerClose} />
            <main>
                <Outlet />
                {/* <div className="main-content">
                </div> */}
            </main>
            <Footer />
        </div>
    );
}
