import { MdWarehouse } from 'react-icons/md';
import { Cards } from './Cards';
import { CustomerPreview } from './CustomerPreview';
import { StatusOverview } from './StatusOverview';
import { IoDocumentsSharp } from 'react-icons/io5';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { FaTasks } from 'react-icons/fa';

export default function Dashboard() {
    const dashboardCards = [
        {
            title: 'Документы (юр.)',
            label: 'Инфо',
            value: '',
            color: '#189e06',
            bgColor: '#cae7cc',
            to: 'documentStages',
            icon: <IoDocumentsSharp />,
        },
        {
            title: 'ПТО',
            color: '#e11d48',
            bgColor: '#ef9a9a',
            label: '',
            value: '',
            to: 'pto',
            icon: <WidgetsIcon />,
        },
        {
            title: 'Задачи',
            label: '',
            value: '',
            color: '#0b78f5',
            bgColor: '#e3f2fd',
            to: 'tasks',
            icon: <FaTasks />,
        },
        {
            title: 'Склады',
            label: '',
            value: '',
            color: '#ab0bf5',
            bgColor: '#e1bee7',
            to: 'warehouses',
            icon: <MdWarehouse />,
        },
        {
            title: 'Отчеты',
            label: '',
            value: '',
            color: '#0bdaf5',
            bgColor: '#e1bee7',
            to: 'reports',
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
