import { apiRequest } from './apiRequest';

export interface SupplierRecommend {
    id: number;
    name: string;

    best_price: number | null;
    avg_rating: number;
    ratings_count: number;
}

export const fetchRecommendSuppliers = async (
    material_id: number,
    currency: number,
): Promise<SupplierRecommend[]> => {
    const res = await apiRequest<SupplierRecommend[]>(
        `/suppliers/recommend/${material_id}/${currency}`,
        'GET',
    );
    console.log('res', res);
    return res.data;
};
