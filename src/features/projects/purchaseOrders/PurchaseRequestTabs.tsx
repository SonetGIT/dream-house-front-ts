import { useState } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import MaterialRequestItems from '../material_request_items/MaterialRequestItems';
import PurchaseOrdersTable from './PurchaseOrdersTable';

export default function PurchaseRequestTabs() {
    const [tab, setTab] = useState(0);

    return (
        <Paper>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="✏️ Формирование" />
                <Tab label="✔️ Сформированные" />
                <Tab label="🚀 Отправленные" />
            </Tabs>

            <Box>
                {tab === 0 && <MaterialRequestItems />}
                {/* {tab === 1 && <PurchaseOrdersTable />} */}
                {/* {tab === 2 && <SentPurchaseRequestsTab />} */}
            </Box>
        </Paper>
    );
}
