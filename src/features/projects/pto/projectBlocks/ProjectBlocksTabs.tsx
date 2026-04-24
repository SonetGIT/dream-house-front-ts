import { Divider, Paper, Tab, Tabs } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function ProjectBlocksTabs() {
    const navigate = useNavigate();
    const location = useLocation();

    const getTab = () => {
        if (location.pathname.includes('materialRequests')) return 1;
        if (location.pathname.includes('purchaseOrders')) return 2;
        if (location.pathname.includes('workPerformed')) return 3;
        return 0;
    };

    return (
        <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
            <Tabs
                value={getTab()}
                onChange={(_, value) => {
                    // 👇 Добавляем { replace: true } — табы не засоряют историю
                    if (value === 0) navigate('', { replace: true });
                    if (value === 1) navigate('materialRequests', { replace: true });
                    if (value === 2) navigate('purchaseOrders', { replace: true });
                    if (value === 3) navigate('workPerformed', { replace: true });
                }}
                sx={{ mb: 1 }}
            >
                <Tab label="Смета на материалы" />
                <Tab label="Заявка на материалы" />
                <Tab label="Заявка на закуп" />
                <Tab label="АВР" />
            </Tabs>

            <Divider sx={{ mb: 2 }} />

            <Outlet />
        </Paper>
    );
}
