import { apiRequest } from '@/utils/apiRequest';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@/features/users/userSlice';
import type { WorkPerformed, WorkPerformedItem } from '../workPerformedSlice';

const WORK_PERFORMED_STATUS_SIGNED = 2;
const SERVICE_ITEM_TYPE = 2;
const ADDITIONAL_ENTRY_TYPE = 2;

type EstimateSearchItem = {
    id: number;
    block_id: number;
};

type EstimateItemCreateResponse = {
    id: number;
    material_estimate_id: number;
};

export const submitWorkPerformedFlow = createAsyncThunk<
    void,
    {
        workPerf: WorkPerformed;
        items: WorkPerformedItem[];
        currentUser: User;
    },
    { rejectValue: string }
>('workPerformed/submitFlow', async ({ workPerf, items, currentUser }, { rejectWithValue }) => {
    try {
        if (!items.length) {
            throw new Error('Нет позиций для подписания');
        }

        const invalidItem = items.some(
            (item) =>
                !item.quantity ||
                !item.price ||
                !item.currency ||
                (Number(item.currency) !== 1 && !item.currency_rate),
        );

        if (invalidItem) {
            throw new Error('Заполните количество, цену, валюту и курс');
        }

        for (const item of items) {
            await apiRequest(`/workPerformedItems/update/${item.id}`, 'PUT', {
                service_type: item.service_type,
                service_id: item.service_id,
                stage_id: item.stage_id,
                subsection_id: item.subsection_id,
                item_type: item.item_type,
                unit_of_measure: item.unit_of_measure,
                quantity: item.quantity,
                currency: item.currency,
                currency_rate: item.currency_rate ?? 1,
                price: item.price,
                material_estimate_item_id: item.material_estimate_item_id,
            });
        }

        const now = new Date().toISOString();
        const roleId = Number(currentUser.role_id);
        const update: Partial<WorkPerformed> = {};

        switch (roleId) {
            case 4:
                if (workPerf.signed_by_foreman) {
                    throw new Error('Прораб уже подписал акт');
                }

                update.foreman_user_id = currentUser.id;
                update.signed_by_foreman = true;
                update.signed_by_foreman_time = now;
                break;

            case 10:
                if (workPerf.signed_by_planning_engineer) {
                    throw new Error('Инженер ПТО уже подписал акт');
                }

                update.planning_engineer_user_id = currentUser.id;
                update.signed_by_planning_engineer = true;
                update.signed_by_planning_engineer_time = now;
                break;

            case 11:
                if (workPerf.signed_by_main_engineer) {
                    throw new Error('Главный инженер уже подписал акт');
                }

                update.main_engineer_user_id = currentUser.id;
                update.signed_by_main_engineer = true;
                update.signed_by_main_engineer_time = now;
                break;

            case 1:
                Object.assign(update, {
                    foreman_user_id: currentUser.id,
                    signed_by_foreman: true,
                    signed_by_foreman_time: now,

                    planning_engineer_user_id: currentUser.id,
                    signed_by_planning_engineer: true,
                    signed_by_planning_engineer_time: now,

                    main_engineer_user_id: currentUser.id,
                    signed_by_main_engineer: true,
                    signed_by_main_engineer_time: now,
                });
                break;

            default:
                throw new Error('У пользователя нет прав на подписание акта');
        }

        const willBeFullySigned =
            update.signed_by_foreman === true || workPerf.signed_by_foreman
                ? update.signed_by_planning_engineer === true ||
                  workPerf.signed_by_planning_engineer
                    ? update.signed_by_main_engineer === true || workPerf.signed_by_main_engineer
                    : false
                : false;

        if (willBeFullySigned) {
            update.status = WORK_PERFORMED_STATUS_SIGNED;

            const manualItems = items.filter(
                (item) =>
                    !item.material_estimate_item_id &&
                    Number(item.item_type) === SERVICE_ITEM_TYPE &&
                    Number(item.service_id) > 0,
            );

            if (manualItems.length > 0) {
                const estimateResponse = await apiRequest<EstimateSearchItem[]>(
                    '/materialEstimates/search',
                    'POST',
                    {
                        block_id: workPerf.block_id,
                        page: 1,
                        size: 10,
                    },
                );

                const estimates = Array.isArray(estimateResponse.data)
                    ? estimateResponse.data
                    : [];
                const targetEstimate = estimates.find(
                    (estimate) => Number(estimate.block_id) === Number(workPerf.block_id),
                );

                if (targetEstimate) {
                    const createdEstimateItemsResponse = await apiRequest<
                        EstimateItemCreateResponse[]
                    >(
                        '/materialEstimateItems/create',
                        'POST',
                        manualItems.map((item) => ({
                            material_estimate_id: targetEstimate.id,
                            stage_id: item.stage_id,
                            subsection_id: item.subsection_id,
                            item_type: SERVICE_ITEM_TYPE,
                            entry_type: ADDITIONAL_ENTRY_TYPE,
                            service_type: item.service_type,
                            service_id: item.service_id,
                            unit_of_measure: item.unit_of_measure,
                            quantity_planned: item.quantity,
                            coefficient: 1,
                            currency: item.currency,
                            currency_rate: item.currency_rate ?? 1,
                            price: item.price,
                            comment: '',
                        })),
                    );

                    const createdEstimateItems = Array.isArray(createdEstimateItemsResponse.data)
                        ? createdEstimateItemsResponse.data
                        : [];

                    for (const [index, item] of manualItems.entries()) {
                        const createdEstimateItem = createdEstimateItems[index];

                        if (!createdEstimateItem?.id) continue;

                        await apiRequest(`/workPerformedItems/update/${item.id}`, 'PUT', {
                            service_type: item.service_type,
                            service_id: item.service_id,
                            stage_id: item.stage_id,
                            subsection_id: item.subsection_id,
                            item_type: item.item_type,
                            unit_of_measure: item.unit_of_measure,
                            quantity: item.quantity,
                            currency: item.currency,
                            currency_rate: item.currency_rate ?? 1,
                            price: item.price,
                            material_estimate_item_id: createdEstimateItem.id,
                        });
                    }
                }
            }
        }

        await apiRequest(`/workPerformed/update/${workPerf.id}`, 'PUT', update);
    } catch (e: any) {
        return rejectWithValue(e.message || 'Ошибка подписания акта выполненных работ');
    }
});
