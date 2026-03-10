import { useEffect, useState } from 'react';
import { fetchCurrencyRatesByDate, type CurrencyRate } from './fetchCurrencyRate';

export function useCurrencyRates() {
    const [rates, setRates] = useState<CurrencyRate[]>([]);

    useEffect(() => {
        const loadRates = async () => {
            const today = new Date().toISOString().split('T')[0];
            const res = await fetchCurrencyRatesByDate(today);
            setRates(res);
        };

        loadRates();
    }, []);

    return rates;
}
