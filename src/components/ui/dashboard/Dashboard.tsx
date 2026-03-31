import { MdWarehouse } from 'react-icons/md';
import { Cards } from './Cards';
import { CustomerPreview } from './CustomerPreview';
import { StatusOverview } from './StatusOverview';
import { IoDocumentsSharp } from 'react-icons/io5';
import WidgetsIcon from '@mui/icons-material/Widgets';

export default function Dashboard() {
    const dashboardCards = [
        {
            title: 'Документы (юр.)',
            label: 'Инфо',
            value: '',
            color: '#06789e',
            to: 'documentStages',
            icon: <IoDocumentsSharp />,
        },
        {
            title: 'ПТО',
            color: '#e11d48',
            label: '',
            value: '',
            to: 'pto',
            icon: <WidgetsIcon />,
        },
        {
            title: 'Склады',
            label: 'Этот месяц',
            value: '34 000 $',
            color: '#f59e0b',
            to: 'warehouses',
            icon: <MdWarehouse />,
        },
    ];

    return (
        <div className="dashboard-grid">
            <div className="dashboard-summary">
                {dashboardCards.map((card) => (
                    <Cards key={card.to} {...card} />
                ))}
            </div>

            <div className="dashboard-main">
                <div className="status-grid">
                    <StatusOverview title="Lead Preview" />
                    <StatusOverview title="Quote Preview" />
                </div>

                <CustomerPreview />
            </div>
        </div>
    );
}
