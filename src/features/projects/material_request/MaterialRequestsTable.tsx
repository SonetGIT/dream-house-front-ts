import React, { useState } from 'react';
import { Collapse, Box, Typography, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { signMaterialRequest, type MaterialRequest } from './materialRequestsSlice';
import { formatDateTime } from '@/utils/formatDateTime';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { User } from '@/features/users/userSlice';
import { Check, ChevronDown, ChevronRight, Clock, Pencil, Trash2, X } from 'lucide-react';
import { formatDate } from '@/utils/formatData';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { RowActions } from '@/components/ui/RowActions';
import { TablePagination } from '@/components/ui/TablePagination';
import { fetchMaterialRequestItems } from '../material_request_items/materialRequestItemsSlice';

interface PropsType {
    data: MaterialRequest[];
    refs: Record<string, ReferenceResult>;
}

const matReqItemStatuses: Record<number, { label: string; className: string }> = {
    1: {
        label: 'Создан',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
    },
    2: {
        label: 'Одобрено',
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    3: {
        label: 'Частично заказано',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    4: {
        label: 'Полностью заказано',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    5: {
        label: 'Отменено',
        className: 'bg-red-100 text-red-800 border-red-200',
    },
};

/*************************************************************************************************************************/
export default function MaterialRequestsTable(props: PropsType) {
    const dispatch = useAppDispatch();
    const {
        items: matReqItems,
        loading: matReqItemsLoading,
        pagination: matReqItemsPagination,
    } = useAppSelector((state) => state.materialRequestItems);
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const currentUser = useAppSelector((state) => state.auth.user);
    const [currentPage, setCurrentPage] = useState(1);
    const toggleRow = (id: number) => {
        setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const ApprovalDot = ({ value }: { value: boolean | null }) => {
        const config =
            value === true
                ? { color: 'bg-green-500', icon: <Check size={10} /> }
                : value === false
                  ? { color: 'bg-red-500', icon: <X size={10} /> }
                  : { color: 'bg-yellow-400', icon: <Clock size={10} /> };

        return (
            <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-white ${config.color}`}
            >
                {config.icon}
            </div>
        );
    };
    const getStatusConfig = (statusId: number) => {
        return (
            matReqItemStatuses[statusId] || {
                label: 'Неизвестно',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
            }
        );
    };

    // Проверка, может ли текущий пользователь подписать заявку
    const canSign = (req: MaterialRequest, user?: User) => {
        if (!user) return false;

        const userId = Number(user.id);
        const roleId = Number(user.role_id);

        // Временная проверка для admin (например, роль = 1)
        if (roleId === 1) {
            // 1 = admin
            return true; // admin может подписывать всё
        }
        switch (roleId) {
            case 4: // Прораб
                return (
                    req.approved_by_foreman !== true &&
                    (!req.foreman_user_id || Number(req.foreman_user_id) === userId)
                );

            case 7: // Снабженец
                return (
                    req.approved_by_purchasing_agent !== true &&
                    (!req.purchasing_agent_user_id ||
                        Number(req.purchasing_agent_user_id) === userId)
                );

            case 9: // Нач. участка
                return (
                    req.approved_by_site_manager !== true &&
                    (!req.site_manager_user_id || Number(req.site_manager_user_id) === userId)
                );

            case 10: // Инженер ПТО
                return (
                    req.approved_by_planning_engineer !== true &&
                    (!req.planning_engineer_user_id ||
                        Number(req.planning_engineer_user_id) === userId)
                );

            case 11: // Гл. инженер
                return (
                    req.approved_by_main_engineer !== true &&
                    (!req.main_engineer_user_id || Number(req.main_engineer_user_id) === userId)
                );

            default:
                return false;
        }
    };

    const handleSign = (req: MaterialRequest) => {
        if (!currentUser || !canSign(req, currentUser)) return;

        dispatch(
            signMaterialRequest({
                id: req.id,
                role_id: currentUser.role_id,
                userId: currentUser.id,
            }),
        );
    };

    /********************************************************************************************************************************/
    return (
        <div className="space-y-4">
            {/* Table - MATERIALREQ*/}
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* MATERIALREQ- HEADER */}
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="w-12 px-4 py-3 text-left bg-blue-50"></th>
                                <th className="w-12 px-3 py-3 text-sm font-semibold text-center text-blue-700 bg-blue-50">
                                    №
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Статус
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Дата создание
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Этап согласования
                                    </div>
                                </th>
                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.data?.map((req, index) => {
                                const signatures = [
                                    {
                                        label: 'Прораб',
                                        approved: req.approved_by_foreman,
                                        userId: req.foreman_user_id,
                                        approvedTime: req.approved_by_foreman_time,
                                    },
                                    {
                                        label: 'Нач. участка',
                                        approved: req.approved_by_site_manager,
                                        userId: req.site_manager_user_id,
                                        approvedTime: req.approved_by_site_manager_time,
                                    },
                                    {
                                        label: 'Снабженец',
                                        approved: req.approved_by_purchasing_agent,
                                        userId: req.purchasing_agent_user_id,
                                        approvedTime: req.approved_by_purchasing_agent_time,
                                    },
                                    {
                                        label: 'Инженер ПТО',
                                        approved: req.approved_by_planning_engineer,
                                        userId: req.planning_engineer_user_id,
                                        approvedTime: req.approved_by_planning_engineer_time,
                                    },
                                    {
                                        label: 'Гл. инженер',
                                        approved: req.approved_by_main_engineer,
                                        userId: req.main_engineer_user_id,
                                        approvedTime: req.approved_by_main_engineer_time,
                                    },
                                ];

                                return (
                                    <React.Fragment key={req.id}>
                                        {/* MATERIALREQEST_TABBLE */}
                                        <tr
                                            className="transition-colors border-b hover:bg-gray-50"
                                            onClick={() => toggleRow(req.id)}
                                        >
                                            {/* toggle */}
                                            <td className="px-2 py-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(req.id);
                                                    }}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                >
                                                    {openRows[req.id] ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-700 bg-blue-40/20">
                                                {req.id}
                                            </td>
                                            {/* статус */}
                                            <td className="px-2 py-2 text-center text-gray-900 border-l">
                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-sky-700 bg-sky-100 border border-sky-200 rounded">
                                                    {req.status != null
                                                        ? props.refs.materialRequestStatuses.lookup(
                                                              req.status,
                                                          )
                                                        : '—'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2 text-sm text-center text-gray-900 border-l ">
                                                {formatDate(req.created_at)}
                                            </td>
                                            <td className="px-2 py-2 text-left text-gray-900 border-l ">
                                                <span className="inline-flex items-center gap-3 px-2 py-0.5 text-xs font-semibold">
                                                    {signatures.map((s) => (
                                                        <ApprovalDot
                                                            key={s.label}
                                                            value={s.approved}
                                                        />
                                                    ))}
                                                </span>
                                            </td>
                                            {/* Действия */}
                                            <td className="px-3 py-2 border-l bg-gray-50">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <StyledTooltip title="Редактировать">
                                                        <button
                                                            // onClick={(e) => {
                                                            //     e.stopPropagation();
                                                            //     onEdit(contractor);
                                                            // }}
                                                            className="
                                                                p-1.5
                                                                text-gray-400
                                                                hover:text-blue-600
                                                                hover:bg-blue-50
                                                                rounded
                                                                transition-colors
                                                            "
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    </StyledTooltip>
                                                    <StyledTooltip title="Удалить">
                                                        <button
                                                            // onClick={(e) => {
                                                            //     e.stopPropagation();
                                                            //     onDelete(contractor);
                                                            // }}
                                                            className="
                                                                p-1.5
                                                                text-gray-400
                                                                hover:text-red-600
                                                                hover:bg-red-50
                                                                rounded
                                                                transition-colors
                                                            "
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </StyledTooltip>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* MATERIALREQESTITEMS*/}
                                        <tr className="border-b bg-gradient-to-r to-blue-50/50">
                                            <td colSpan={8} className="px-3 py-2">
                                                <Collapse in={openRows[req.id]} unmountOnExit>
                                                    <div>
                                                        <p
                                                            className={`px-4 py-2 text-sm font-medium transition-colors text-blue-600 border-b-2 border-blue-600`}
                                                        >
                                                            Материалы
                                                        </p>
                                                    </div>
                                                    <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
                                                        <table className="w-full">
                                                            <thead className="text-gray-700 bg-gray-50">
                                                                <tr className="border-b">
                                                                    <th className="w-12 px-3 py-3 text-sm font-semibold text-left">
                                                                        №
                                                                    </th>
                                                                    <th className="px-3 py-2 text-sm text-left">
                                                                        Тип
                                                                    </th>
                                                                    <th className="px-3 py-2 text-sm text-left">
                                                                        Материал
                                                                    </th>
                                                                    <th className="px-3 py-2 text-sm text-left">
                                                                        Ед. изм
                                                                    </th>
                                                                    <th className="px-3 py-2 text-sm text-right">
                                                                        Кол-во
                                                                    </th>
                                                                    <th className="px-3 py-2 text-sm text-right">
                                                                        Валюта
                                                                    </th>
                                                                    <th className="px-3 py-2 text-sm text-right">
                                                                        Курс
                                                                    </th>
                                                                    <th className="px-3 py-2 text-sm text-right">
                                                                        Цена
                                                                    </th>
                                                                    <th className="px-3 py-2 text-sm text-right">
                                                                        Сумма
                                                                    </th>
                                                                    <th className="px-3 py-2 text-sm text-right">
                                                                        Примечание
                                                                    </th>
                                                                    <th className="px-3 py-2 text-sm text-center">
                                                                        Статус
                                                                    </th>
                                                                    <th className="px-3 py-2 text-sm text-center">
                                                                        Действия
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {req.items?.map((item, index) => {
                                                                    const statusInfo =
                                                                        getStatusConfig(
                                                                            item.status,
                                                                        );
                                                                    return (
                                                                        <tr key={item.id}>
                                                                            {/* Номер */}
                                                                            <td className="px-2 py-2 text-xs font-medium text-gray-700">
                                                                                {index + 1}
                                                                            </td>
                                                                            <td className="px-2 py-2 text-sm text-gray-600">
                                                                                {props.refs.materialTypes.lookup(
                                                                                    item.material_type,
                                                                                )}
                                                                            </td>
                                                                            <td className="px-2 py-2 text-sm text-gray-600">
                                                                                {props.refs.materials.lookup(
                                                                                    item.material_id,
                                                                                )}
                                                                            </td>
                                                                            <td className="px-2 py-2 text-sm text-gray-600">
                                                                                {props.refs.unitsOfMeasure.lookup(
                                                                                    item.unit_of_measure,
                                                                                )}
                                                                            </td>
                                                                            {/* Количество */}
                                                                            <td className="px-2 py-2 text-sm text-right text-gray-900">
                                                                                {item.quantity}
                                                                            </td>

                                                                            {/* Валюта */}
                                                                            <td className="px-2 py-2 text-sm text-right text-blue-700">
                                                                                {item.currency !=
                                                                                null
                                                                                    ? props.refs.currencies.lookup(
                                                                                          item.currency,
                                                                                      )
                                                                                    : '—'}
                                                                            </td>

                                                                            {/* Курс */}
                                                                            <td className="px-2 py-2 font-medium text-right">
                                                                                {item.currency_rate}
                                                                            </td>

                                                                            {/* Цена */}
                                                                            <td className="px-2 py-2 font-medium text-right">
                                                                                {item.price}
                                                                            </td>

                                                                            {/* Сумма */}
                                                                            <td className="px-2 py-2 font-medium text-right text-green-600">
                                                                                {/* {calcRowTotal({
                                                                                    ...item,
                                                                                    ...data,
                                                                                })} */}
                                                                            </td>

                                                                            {/* Примечание */}
                                                                            <td className="px-2 py-2 text-xs text-center text-gray-600">
                                                                                {item.comment ||
                                                                                    '—'}
                                                                            </td>

                                                                            <td className="px-3 py-2.5">
                                                                                <span
                                                                                    className={`
                                                                                    inline-flex text-center  px-2 py-0.5
                                                                                    text-xs font-semibold border rounded-full
                                                                                    ${statusInfo.className}
                                                                                `}
                                                                                >
                                                                                    {props.refs.materialRequestItemStatuses.lookup(
                                                                                        req.status,
                                                                                    )}
                                                                                </span>
                                                                            </td>
                                                                            {/* Действия */}
                                                                            <td className="px-2 py-2">
                                                                                <div className="flex items-center justify-center gap-1.5">
                                                                                    <RowActions
                                                                                        row={item}
                                                                                        actions={[
                                                                                            {
                                                                                                label: 'Редактировать',
                                                                                                icon: Pencil,
                                                                                                // onClick: onEdit,
                                                                                                onClick:
                                                                                                    () =>
                                                                                                        alert(),
                                                                                                className:
                                                                                                    'text-blue-500 hover:bg-blue-50',
                                                                                            },
                                                                                            {
                                                                                                label: 'Удалить',
                                                                                                icon: Trash2,
                                                                                                // onClick: onDelete,
                                                                                                onClick:
                                                                                                    () =>
                                                                                                        alert(),
                                                                                                className:
                                                                                                    'text-red-600 hover:bg-red-50',
                                                                                            },
                                                                                        ]}
                                                                                    />
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                            {/* Пагинация */}
                                                            {matReqItemsPagination && (
                                                                <TablePagination
                                                                    pagination={
                                                                        matReqItemsPagination
                                                                    }
                                                                    onPageChange={(newPage) => {
                                                                        setCurrentPage(newPage);

                                                                        dispatch(
                                                                            fetchMaterialRequestItems(
                                                                                {
                                                                                    page: newPage,
                                                                                    size: matReqItemsPagination.size,
                                                                                },
                                                                            ),
                                                                        );
                                                                    }}
                                                                    onSizeChange={(newSize) => {
                                                                        setCurrentPage(newSize);

                                                                        dispatch(
                                                                            fetchMaterialRequestItems(
                                                                                {
                                                                                    page: 1,
                                                                                    size: newSize,
                                                                                },
                                                                            ),
                                                                        );
                                                                    }}
                                                                    sizeOptions={[10, 25, 50, 100]}
                                                                    showFirstButton
                                                                    showLastButton
                                                                />
                                                            )}
                                                        </table>

                                                        {/* SIGNATURES */}
                                                        <Box
                                                            display="flex"
                                                            // gap={2}
                                                            mt={5}
                                                            mb={2}
                                                            flexWrap="wrap"
                                                            justifyContent="space-between"
                                                            sx={{ backgroundColor: '#fff' }}
                                                        >
                                                            {signatures.map((s) => (
                                                                <Box
                                                                    key={s.label}
                                                                    sx={{
                                                                        // border: '1px solid #d9eff6',
                                                                        textAlign: 'center',
                                                                        minWidth: 200,
                                                                    }}
                                                                >
                                                                    <Typography fontWeight={600}>
                                                                        {s.label}
                                                                    </Typography>
                                                                    <Typography
                                                                        fontSize="0.85rem"
                                                                        color="text.secondary"
                                                                        fontStyle="italic"
                                                                    >
                                                                        {s.userId
                                                                            ? props.refs.users.lookup(
                                                                                  s.userId,
                                                                              )
                                                                            : '—'}
                                                                    </Typography>
                                                                    <Typography
                                                                        fontSize="0.85rem"
                                                                        mt={0.5}
                                                                        color={
                                                                            s.approved
                                                                                ? 'success.main'
                                                                                : 'text.disabled'
                                                                        }
                                                                    >
                                                                        {s.approved === true
                                                                            ? `Подписано (${formatDateTime(
                                                                                  s.approvedTime,
                                                                              )})`
                                                                            : s.approved === false
                                                                              ? `Отклонено (${formatDateTime(
                                                                                    s.approvedTime,
                                                                                )})`
                                                                              : 'Ожидает'}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>

                                                        {/* UNIVERSAL SIGN BUTTON */}
                                                        {currentUser &&
                                                            canSign(req, currentUser) && (
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    sx={{
                                                                        mt: 2,
                                                                        mx: 'auto',
                                                                        display: 'block',
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSign(req);
                                                                    }}
                                                                >
                                                                    Подписать
                                                                </Button>
                                                            )}
                                                    </div>
                                                </Collapse>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
