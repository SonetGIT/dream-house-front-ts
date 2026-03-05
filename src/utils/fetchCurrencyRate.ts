import { apiRequest } from './apiRequest';

export interface CurrencyRate {
    id: number;
    currency_id: number;
    rate: number;
    date: string;
}

export const fetchCurrencyRatesByDate = async (date: string): Promise<CurrencyRate[]> => {
    const res = await apiRequest<CurrencyRate[]>(`/currencyRates/getByDate/${date}`, 'GET');

    return res.data;
};

export const fetchCurrencyRate = async (currencyId: number): Promise<number> => {
    const today = new Date().toISOString().split('T')[0];

    const rates = await fetchCurrencyRatesByDate(today);

    const rate = rates.find((r) => Number(r.currency_id) === Number(currencyId));

    return rate?.rate ?? 1;
};
