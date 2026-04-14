import React, { useCallback, useState } from 'react';
import { Button, Collapse } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { formatDateTime } from '@/utils/formatDateTime';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { fetchWorkPerformed, type WorkPerformed } from './workPerformedSlice';
import { formatDate } from '@/utils/formatData';
import WorkPerformedItemsTable from './workPerformedItems/WorkPerformedItemsTable';
import { generalStatuses } from '@/utils/getStatusColor';
import { fetchWorkPerformedItems } from './workPerformedItems/workPerformedItemsSlice';
import toast from 'react-hot-toast';
import type { User } from '@/features/users/userSlice';
import { submitWorkPerformedFlow } from './submitWorkPerformedFlow';

interface PropsType {
    blockId: number;
    data: WorkPerformed[];
    refs: Record<string, ReferenceResult>;
    onDeleteWorkPerformedId: (id: number) => void;
    onDeleteWorkPerformedItemId: (id: number) => void;
}

/*************************************************************************************************************************/
export default function WorkPerformedTable(props: PropsType) {
    const dispatch = useAppDispatch();
    const { pagination } = useAppSelector((state) => state.workPerformedItems);
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const currentUser = useAppSelector((state) => state.auth.user);
    const [itemsMap, setItemsMap] = useState<Record<number, any[]>>({});

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    /*TOGGLE*/
    const toggleRow = (id: number) => {
        const isOpening = !openRows[id];

        // 1. сначала обновляем state
        setOpenRows((prev) => ({
            ...prev,
            [id]: isOpening,
        }));

        // 2. потом dispatch
        if (isOpening) {
            dispatch(
                fetchWorkPerformedItems({
                    work_performed_id: id,
                    page,
                    size,
                }),
            );
        }
    };

    /*STATUS*/
    const getStatusConfig = (statusId: number) => {
        return (
            generalStatuses[statusId] || {
                label: 'Неизвестно',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
            }
        );
    };

    const handleItemsChange = useCallback((reqId: number, updatedItems: any[]) => {
        setItemsMap((prev) => {
            if (prev[reqId] === updatedItems) return prev;

            return {
                ...prev,
                [reqId]: updatedItems,
            };
        });
    }, []);

    /*PERMISSIONS*/
    const canSign = (workPerf: WorkPerformed, user?: User) => {
        if (!user) return false;

        const userId = Number(user.id);
        const roleId = Number(user.role_id);

        if (roleId === 1) return true;

        switch (roleId) {
            case 4:
                return (
                    !workPerf.signed_by_foreman &&
                    (!workPerf.foreman_user_id || Number(workPerf.foreman_user_id) === userId)
                );

            case 10:
                return (
                    !workPerf.signed_by_planning_engineer &&
                    (!workPerf.planning_engineer_user_id ||
                        Number(workPerf.planning_engineer_user_id) === userId)
                );

            case 11:
                return (
                    !workPerf.signed_by_main_engineer &&
                    (!workPerf.main_engineer_user_id ||
                        Number(workPerf.main_engineer_user_id) === userId)
                );

            default:
                return false;
        }
    };

    /*SIGN*/
    const handleSign = (workPerf: WorkPerformed) => {
        const openedId = workPerf.id;

        if (!currentUser || !canSign(workPerf, currentUser)) return;

        const items = itemsMap[workPerf.id] ?? workPerf.items ?? [];
        // const items = (itemsMap[workPerf.id]?.length ? itemsMap[workPerf.id] : workPerf.items) ?? [];
        // console.log('   items для отправки', items);

        if (!items.length) {
            toast.error('Нет материалов');
            return;
        }

        dispatch(
            submitWorkPerformedFlow({
                workPerf,
                items,
                currentUser,
            }),
        )
            .unwrap()
            .then(() => {
                // очистка локальных изменений
                setItemsMap((prev) => {
                    const copy = { ...prev };
                    delete copy[workPerf.id];
                    return copy;
                });

                // обновляем список заявок
                return dispatch(
                    fetchWorkPerformed({
                        project_id: workPerf.project_id,
                        block_id: props.blockId,
                        page,
                        size,
                    }),
                ).unwrap();
            })
            .then(() => {
                // открываем строку
                setOpenRows((prev) => ({
                    ...prev,
                    [openedId]: true,
                }));

                //  ВАЖНО: заново загружаем items
                dispatch(
                    fetchWorkPerformedItems({
                        work_performed_id: openedId,
                        page,
                        size,
                    }),
                );
            })
            .catch((e) => {
                toast.error(e || 'Ошибка');
            });
    };

    const isFullyApproved = (workPerf: WorkPerformed): boolean => {
        return (
            !!workPerf.signed_by_foreman &&
            !!workPerf.signed_by_main_engineer &&
            !!workPerf.signed_by_planning_engineer
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
                                <th className="px-4 py-3 text-left bg-blue-50"></th>
                                <th className="w-20 px-3 py-3 text-sm font-semibold text-left text-blue-700 bg-blue-50">
                                    Акт №
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Статус
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Блок
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Дата создание
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Исполнитель работ
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Предоплата
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50 w-[900px]">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Этап подписи
                                    </div>
                                </th>
                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.data?.map((workPerf) => {
                                const signatures = [
                                    {
                                        label: 'Прораб',
                                        userId: workPerf.foreman_user_id,
                                        approved: workPerf.signed_by_foreman,
                                        approvedTime: workPerf.signed_by_foreman_time,
                                    },
                                    {
                                        label: 'Инженер ПТО',
                                        userId: workPerf.planning_engineer_user_id,
                                        approved: workPerf.signed_by_planning_engineer,
                                        approvedTime: workPerf.signed_by_planning_engineer_time,
                                    },
                                    {
                                        label: 'Гл. инженер',
                                        userId: workPerf.main_engineer_user_id,
                                        approved: workPerf.signed_by_main_engineer,
                                        approvedTime: workPerf.signed_by_main_engineer_time,
                                    },
                                ];
                                const statusInfo = getStatusConfig(workPerf.status);

                                return (
                                    <React.Fragment key={workPerf.id}>
                                        {/* WorkPerformedTable */}
                                        <tr
                                            className="transition-colors border-b hover:bg-gray-50"
                                            onClick={() => toggleRow(workPerf.id)}
                                        >
                                            {/* toggle */}
                                            <td className="px-2 py-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(workPerf.id);
                                                    }}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                >
                                                    {openRows[workPerf.id] ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-2 py-2 text-xs font-medium text-left text-gray-700 bg-blue-40/20">
                                                {workPerf.id}
                                            </td>

                                            {/* статус */}
                                            <td className="px-2 py-2 text-center text-gray-900 ">
                                                <span
                                                    className={`
                                                    inline-flex text-center px-2 py-0.5
                                                    text-xs font-semibold border rounded-full
                                                    ${statusInfo.className}
                                                `}
                                                >
                                                    {workPerf.status != null
                                                        ? props.refs.generalStatuses.lookup(
                                                              Number(workPerf.status),
                                                          )
                                                        : '—'}
                                                </span>
                                            </td>

                                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-700 bg-blue-40/20">
                                                {workPerf.block_id
                                                    ? props.refs.prjBlocks.lookup(workPerf.block_id)
                                                    : '—'}
                                            </td>
                                            <td className="px-2 py-2 text-xs text-center text-gray-900 ">
                                                {formatDate(workPerf.created_at)}
                                            </td>
                                            <td className="px-2 py-2 text-xs text-center text-gray-900 ">
                                                {workPerf.performed_person_name}
                                            </td>
                                            <td className="px-2 py-2 text-xs text-center text-gray-900 ">
                                                {workPerf.advance_payment}
                                            </td>

                                            {/*ЭТАП ПОДПИСИ  */}
                                            <td className="px-2 py-2 pl-8 text-sm text-center text-gray-900 ">
                                                <div className="grid grid-cols-3 gap-4 text-xs items-left">
                                                    {signatures.map((s) => (
                                                        <div
                                                            key={s.label}
                                                            className="space-y-0.5 text-left"
                                                        >
                                                            {/* ROLE */}
                                                            <div className="flex items-center gap-1 pl-1 font-medium text-gray-700">
                                                                <span className="space-y-0.5 text-left min-w-0 text-xs">
                                                                    {s.label}
                                                                </span>
                                                            </div>

                                                            {/* USER */}
                                                            <div className="text-[0.75rem] text-gray-500 italic truncate pl-1">
                                                                {s.userId}
                                                                {s.userId
                                                                    ? props.refs.users.lookup(
                                                                          s.userId,
                                                                      )
                                                                    : '—'}
                                                            </div>

                                                            {/* STATUS */}
                                                            <div
                                                                className={`text-[0.75rem] pl-1 whitespace-nowrap ${
                                                                    s.approved
                                                                        ? 'text-green-600'
                                                                        : s.approved === false
                                                                          ? 'text-red-500'
                                                                          : 'text-gray-400'
                                                                }`}
                                                            >
                                                                {s.approved === true
                                                                    ? `✔ ${formatDateTime(s.approvedTime)}`
                                                                    : s.approved === false
                                                                      ? `✖ ${formatDateTime(s.approvedTime)}`
                                                                      : '⏳ Ожидает'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            {/* Действия */}
                                            <td className="px-3 py-2 border-l bg-gray-50">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <StyledTooltip title="Удалить">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                props.onDeleteWorkPerformedId(
                                                                    workPerf.id,
                                                                );
                                                            }}
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

                                        {/* WorkPerformedItemsTable*/}
                                        <tr className="border-b bg-gradient-to-r to-blue-50/50">
                                            <td colSpan={9} className="px-3 py-2">
                                                <Collapse in={openRows[workPerf.id]} unmountOnExit>
                                                    <div className="px-3 py-2">
                                                        <p className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                                                            Услуги
                                                        </p>
                                                        <WorkPerformedItemsTable
                                                            workPerformedId={workPerf.id}
                                                            refs={props.refs}
                                                            currentUser={currentUser}
                                                            onDelete={props.onDeleteWorkPerformedId}
                                                            items={
                                                                itemsMap[workPerf.id] ??
                                                                workPerf.items ??
                                                                []
                                                            }
                                                            onChange={(updatedItems) =>
                                                                handleItemsChange(
                                                                    workPerf.id,
                                                                    updatedItems,
                                                                )
                                                            }
                                                            pagination={pagination}
                                                        />

                                                        {/* КНОПКА ПОДПИСАТЬ */}
                                                        {currentUser &&
                                                            canSign(workPerf, currentUser) && (
                                                                <div className="flex justify-center p-3">
                                                                    <Button
                                                                        size="small"
                                                                        variant="contained"
                                                                        disabled={isFullyApproved(
                                                                            workPerf,
                                                                        )} //вот это
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSign(workPerf);
                                                                        }}
                                                                    >
                                                                        Подписать
                                                                    </Button>
                                                                </div>
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
