import { apiRequest } from '@/utils/apiRequest';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@/features/users/userSlice';
import type { WorkPerformed, WorkPerformedItem } from '../workPerformedSlice';

const WORK_PERFORMED_STATUS_SIGNED = 2; // если у вас другой статус "подписан", поменяйте

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
        }

        await apiRequest(`/workPerformed/update/${workPerf.id}`, 'PUT', update);
    } catch (e: any) {
        return rejectWithValue(e.message || 'Ошибка подписания акта выполненных работ');
    }
});
