import { useEffect, useState } from 'react';
import { StyledTooltip } from './StyledTooltip';
import { apiRequest } from '@/utils/apiRequest';

interface CurrencyRate {
    id: number;
    currency_id: number;
    rate: number;
    date: string;
}

interface USDRateProps {
    date?: string;
}

/*********************************************************************************************************/
export default function USDRate({ date }: USDRateProps) {
    const [usdRate, setUsdRate] = useState<number | null>(null);

    useEffect(() => {
        const fetchUSD = async () => {
            try {
                const selectedDate = date ?? new Date().toISOString().split('T')[0];

                const res = await apiRequest<CurrencyRate[]>(
                    `/currencyRates/getByDate/${selectedDate}`,
                    'GET',
                );

                const usd = res.data.find((r) => r.currency_id === 2);

                setUsdRate(usd?.rate ?? null);
            } catch (err) {
                console.error('Ошибка при получении курса USD:', err);
                setUsdRate(null);
            }
        };

        fetchUSD();
    }, [date]);

    return (
        <StyledTooltip title="Курс $ на сегодня">
            <p style={{ marginRight: 45, color: '#d9ff00', fontWeight: 'bold' }}>
                USD: {usdRate !== null ? usdRate.toFixed(2) : '—'}
            </p>
        </StyledTooltip>
    );
}
