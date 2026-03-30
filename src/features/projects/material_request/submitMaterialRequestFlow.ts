import { apiRequest } from '@/utils/apiRequest';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { MaterialRequest } from './materialRequestsSlice';
import type { MaterialRequestItem } from '../material_request_items/materialRequestItemsSlice';
import type { User } from '@/features/users/userSlice';

export const submitMaterialRequestFlow = createAsyncThunk<
    void,
    {
        req: MaterialRequest;
        items: MaterialRequestItem[];
        currentUser: User;
    },
    { rejectValue: string }
>('materialRequests/submitFlow', async ({ req, items, currentUser }, { rejectWithValue }) => {
    try {
        /*ITEMS*/
        const manualItems = items.filter((i) => Number(i.item_type) === 2);

        /*LAST APPROVAL*/
        const approvalFlow: (keyof MaterialRequest)[] = [
            'approved_by_foreman',
            'approved_by_purchasing_agent',
            'approved_by_site_manager',
            'approved_by_planning_engineer',
            'approved_by_main_engineer',
        ];

        const notApproved = approvalFlow.filter((field) => !req[field]);
        const realIsLast = notApproved.length === 1;

        const isAdmin = currentUser.role_id === 1;
        const isLast = realIsLast || isAdmin;

        /*VALIDATION (ПТО)*/
        const isPTO = currentUser.role_id === 10;

        if (isPTO && manualItems.length > 0) {
            const invalid = manualItems.some(
                (i) =>
                    !i.quantity ||
                    !i.coefficient ||
                    !i.price ||
                    !i.currency ||
                    ((i.currency ?? 1) !== 1 && !i.currency_rate),
            );

            if (invalid) {
                throw new Error('Заполните цену, валюту и курс');
            }
        }

        /*UPDATE ITEMS*/
        for (const item of items) {
            await apiRequest(`/materialRequestItems/update/${item.id}`, 'PUT', {
                quantity: item.quantity,
                price: item.price,
                coefficient: item.coefficient,
                currency: item.currency,
                currency_rate: item.currency_rate,
            });
        }

        /*ПОЛУЧАЕМ СМЕТУ ПО BLOCK*/
        const estimateRes = await apiRequest(`/materialEstimates/search`, 'POST', {
            block_id: req.block_id,
            page: 1,
            size: 1,
        });

        const material_estimate_id = estimateRes.data?.[0]?.id;

        if (!material_estimate_id) {
            throw new Error('Смета не найдена для блока');
        }

        /*CREATE + LINK*/
        if (isLast && manualItems.length > 0) {
            for (const item of manualItems) {
                const res = await apiRequest('/materialEstimateItems/create', 'POST', [
                    {
                        material_estimate_id, // ✅ правильный ID
                        stage_id: item.stage_id,
                        subsection_id: item.subsection_id,
                        item_type: 1,
                        entry_type: 2,
                        material_type: item.material_type,
                        material_id: item.material_id,
                        unit_of_measure: item.unit_of_measure,
                        quantity_planned: item.quantity,
                        coefficient: item.coefficient,
                        currency: item.currency,
                        currency_rate: item.currency_rate ?? 1,
                        price: item.price,
                        comment: item.comment || '',
                    },
                ]);

                const createdId = res.data?.[0]?.id;

                if (!createdId) {
                    throw new Error('Ошибка создания элемента сметы');
                }

                /* LINK */
                await apiRequest(`/materialRequestItems/update/${item.id}`, 'PUT', {
                    material_estimate_item_id: createdId,
                    price: item.price,
                    coefficient: item.coefficient,
                    currency: item.currency,
                    currency_rate: item.currency_rate ?? 1,
                });
            }
        }

        /*SIGN*/
        const now = new Date().toISOString();
        const update: any = {};

        switch (currentUser.role_id) {
            case 4:
                update.foreman_user_id = currentUser.id;
                update.approved_by_foreman = true;
                update.approved_by_foreman_time = now;
                break;

            case 7:
                update.purchasing_agent_user_id = currentUser.id;
                update.approved_by_purchasing_agent = true;
                update.approved_by_purchasing_agent_time = now;
                break;

            case 9:
                update.site_manager_user_id = currentUser.id;
                update.approved_by_site_manager = true;
                update.approved_by_site_manager_time = now;
                break;

            case 10:
                update.planning_engineer_user_id = currentUser.id;
                update.approved_by_planning_engineer = true;
                update.approved_by_planning_engineer_time = now;
                break;

            case 11:
                update.main_engineer_user_id = currentUser.id;
                update.approved_by_main_engineer = true;
                update.approved_by_main_engineer_time = now;
                break;

            case 1:
                Object.assign(update, {
                    foreman_user_id: currentUser.id,
                    approved_by_foreman: true,
                    purchasing_agent_user_id: currentUser.id,
                    approved_by_purchasing_agent: true,
                    site_manager_user_id: currentUser.id,
                    approved_by_site_manager: true,
                    planning_engineer_user_id: currentUser.id,
                    approved_by_planning_engineer: true,
                    main_engineer_user_id: currentUser.id,
                    approved_by_main_engineer: true,
                });
                break;

            default:
                throw new Error('Неизвестная роль');
        }

        await apiRequest(`/materialRequests/update/${req.id}`, 'PUT', update);
    } catch (e: any) {
        return rejectWithValue(e.message || 'Ошибка submit flow');
    }
});
