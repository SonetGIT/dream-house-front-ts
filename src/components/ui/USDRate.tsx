import { useEffect, useState } from 'react';
import { StyledTooltip } from './StyledTooltip';
import { apiRequestNew } from '@/utils/apiRequestNew';

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

                const res = await apiRequestNew<CurrencyRate[]>(
                    `/currencyRates/getByDate/${selectedDate}`,
                    'GET'
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
        <StyledTooltip title="Курс на сегодня">
            <p style={{ marginRight: 15, color: '#e1ff00' }}>
                USD: {usdRate !== null ? usdRate.toFixed(2) : '—'}
            </p>
        </StyledTooltip>
    );
}
