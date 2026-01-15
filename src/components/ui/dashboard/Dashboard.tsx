import { Cards } from './Cards';
import { CustomerPreview } from './CustomerPreview';
import { StatusOverview } from './StatusOverview';

export default function Dashboard() {
    const dashboardCards = [
        {
            title: 'Заявка на материалы',
            label: 'Этот месяц',
            value: '34 000 $',
            color: '#22c55e',
            to: 'materialRequests',
        },
        {
            title: 'Заявка на закупку',
            label: 'Этот месяц',
            value: '34 000 $',
            to: 'purchaseRequestCard',
        },
        {
            title: 'Склады',
            label: 'Этот месяц',
            value: '34 000 $',
            color: '#22c55e',
            to: 'warehouses',
        },
        {
            title: 'Заявка на закупку',
            label: 'Этот месяц',
            value: '34 000 $',
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
                    <StatusOverview title="Order Preview" />
                </div>

                <CustomerPreview />
            </div>
        </div>
    );
}
