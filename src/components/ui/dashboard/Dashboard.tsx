import { MdAssignment, MdShoppingCart, MdWarehouse } from 'react-icons/md';
import { Cards } from './Cards';
import { CustomerPreview } from './CustomerPreview';
import { StatusOverview } from './StatusOverview';

export default function Dashboard() {
    const dashboardCards = [
        {
            title: 'Заявка на материалы',
            label: 'Этот месяц',
            value: '34 000 $',
            color: '#22c55e', // зеленая иконка
            to: 'materialRequests',
            icon: <MdAssignment />,
        },
        {
            title: 'Заявка на закупку',
            label: 'Этот месяц',
            value: '34 000 $',
            color: '#2c7ecb', // синий
            to: 'purchaseRequestCard',
            icon: <MdShoppingCart />,
        },
        {
            title: 'Склады',
            label: 'Этот месяц',
            value: '34 000 $',
            color: '#f59e0b', // оранжевый
            to: 'warehouses',
            icon: <MdWarehouse />,
        },
        {
            title: 'Заявка на закупку',
            label: 'Этот месяц',
            value: '34 000 $',
            color: '#e11d48', // красный
            to: 'materialRequestItems1',
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
