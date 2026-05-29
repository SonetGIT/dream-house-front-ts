import { Divider, Paper, Tab, Tabs } from '@mui/material';
import { Building2, Home, UserRoundPlus, Users, WalletCards } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function SalesPageTabs() {
    const navigate = useNavigate();
    const location = useLocation();

    const getTab = () => {
        if (location.pathname.includes('units')) return 1;
        if (location.pathname.includes('leads')) return 2;
        if (location.pathname.includes('clients')) return 3;
        if (location.pathname.includes('paymentSchedules')) return 4;
        return 0;
    };

    return (
        <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
            <Tabs
                value={getTab()}
                onChange={(_, value) => {
                    // 👇 Добавляем { replace: true } — табы не засоряют историю
                    if (value === 0) navigate('', { replace: true });
                    if (value === 1) navigate('units', { replace: true });
                    if (value === 2) navigate('leads', { replace: true });
                    if (value === 3) navigate('clients', { replace: true });
                    if (value === 4) navigate('paymentSchedules', { replace: true });
                }}
                sx={{ mb: 1 }}
            >
                <Tab label="Объекты" icon={<Building2 size={18} />} />

                <Tab label="Лоты" icon={<Home size={18} />} />

                <Tab label="Лиды" icon={<UserRoundPlus size={18} />} />

                <Tab label="Клиенты" icon={<Users size={18} />} />

                <Tab label="Графики оплат" icon={<WalletCards size={18} />} />
            </Tabs>

            <Divider sx={{ mb: 2 }} />

            <Outlet />
        </Paper>
    );
}
