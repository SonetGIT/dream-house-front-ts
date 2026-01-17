import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    IconButton,
    Collapse,
    Checkbox,
    TextField,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchPurchaseOrders } from '../projects/purchaseOrders/purchaseOrdersSlice';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useReference } from '@/features/reference/useReference';
import { compactFieldSx, compactTextFieldSx } from '@/styles/ui_style';
import { receivePurchaseOrderItems } from '../purchaseOrderItems/purchaseOrderItemsSlice';
import toast from 'react-hot-toast';
// В компоненте (WarehousePurchaseOrdersTable.tsx)
type ReceiveItemPayload = {
    purchase_order_item_id: number;
    recieved_quantity: number;
    comment?: string;
};
export default function WarehousePurchaseOrdersTable() {
    const dispatch = useAppDispatch();
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const [deliveredMap, setDeliveredMap] = useState<Record<number, number | ''>>({});
    const [commentMap, setCommentMap] = useState<Record<number, string>>({});
    const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});

    const { lookup: getStatusName } = useReference('2beaaf9c2-b0d1-4c1c-8861-6c3345723b93');
    const { lookup: getSuppliersName } = useReference('7ec0dff6-a9cd-46fe-bc8a-d32f20bcdfbf');
    const { lookup: getMaterialTypeName } = useReference('681635e7-3eff-413f-9a07-990bfe7bc68a');
    const { lookup: getMaterialName } = useReference('7c52acfc-843a-4242-80ba-08f7439a29a7');
    const { lookup: getUnitOfMeasure } = useReference('2198d87a-d834-4c5d-abf8-8925aeed784e');

    const toggleRow = (id: number) => {
        setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    const { data: orders, pagination, loading } = useAppSelector((state) => state.purchaseOrders);
    console.log('ORDERS', orders);
    // 🔥 Загрузка списка при монтировании
    useEffect(() => {
        dispatch(fetchPurchaseOrders({ page: 1, size: 10 }));
    }, [dispatch]);

    if (loading) return <Typography>Загрузка заявок...</Typography>;

    const getRefName = {
        materialTypeName: getMaterialTypeName,
        materialName: getMaterialName,
        unitName: getUnitOfMeasure,
        suppliersName: getSuppliersName,
        statusName: getStatusName,
    };

    const handleReceive = async () => {
        const warehouse_id = 4; // или получите из контекста/состояния
        const validItems: ReceiveItemPayload[] = [];
        let hasError = false;

        // Проходим по всем заказам и их элементам
        orders.forEach((order) => {
            (order.items || []).forEach((item) => {
                if (checkedMap[item.id]) {
                    const rawValue = deliveredMap[item.id];

                    // Проверка: значение указано?
                    if (rawValue === '' || rawValue === undefined) {
                        toast.error(
                            `Укажите количество для "${getRefName.materialName(item.material_id)}"`
                        );
                        hasError = true;
                        return;
                    }

                    const recieved_quantity = Number(rawValue);

                    // Проверка: число и > 0
                    if (isNaN(recieved_quantity) || recieved_quantity <= 0) {
                        toast.error(
                            `Количество должно быть числом > 0 для "${getRefName.materialName(
                                item.material_id
                            )}"`
                        );
                        hasError = true;
                        return;
                    }

                    // Проверка: не превышает заказанное
                    if (recieved_quantity > item.quantity) {
                        toast.error(
                            `Доставлено не может быть больше заказанного (${
                                item.quantity
                            }) для "${getRefName.materialName(item.material_id)}"`
                        );
                        hasError = true;
                        return;
                    }

                    validItems.push({
                        purchase_order_item_id: item.id,
                        recieved_quantity,
                        comment: commentMap[item.id] || undefined,
                    });
                }
            });
        });

        // Если есть ошибки — не отправляем
        if (hasError) {
            return;
        }

        // Если ничего не выбрано
        if (validItems.length === 0) {
            toast.error('Выберите хотя бы один материал для приёмки');
            return;
        }

        try {
            const result = await dispatch(
                receivePurchaseOrderItems({
                    warehouse_id,
                    items: validItems,
                })
            );

            if (receivePurchaseOrderItems.fulfilled.match(result)) {
                toast.success('Приёмка успешно завершена!');

                // 🔥 Сбрасываем UI-состояние
                setCheckedMap({});
                setDeliveredMap({});
                setCommentMap({});

                // ❗ НЕ вызываем fetchPurchaseOrders, потому что:
                // ваш слайс уже обновил state.items = action.payload
                // и UI перерисуется автоматически
            } else {
                // Ошибка от rejectWithValue
                const errorMessage = result.payload as string;
                toast.error(errorMessage || 'Не удалось завершить приёмку');
            }
        } catch (err) {
            console.error('Unexpected error in handleReceive:', err);
            toast.error('Произошла непредвиденная ошибка');
        }
    };

    /****************************************************************************************************************************/
    return (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table className="table">
                <TableBody>
                    {orders?.map((req) => {
                        return (
                            <React.Fragment key={req.id}>
                                {/* HEADER */}
                                <TableRow
                                    hover
                                    onClick={() => toggleRow(req.id)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell padding="checkbox">
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRow(req.id);
                                            }}
                                        >
                                            {openRows[req.id] ? (
                                                <KeyboardArrowUpIcon />
                                            ) : (
                                                <KeyboardArrowDownIcon />
                                            )}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        № заявки: <strong>{req.id}</strong>
                                    </TableCell>
                                    <TableCell>
                                        Дата создание:{' '}
                                        <strong>
                                            {new Date(req.created_at).toLocaleDateString('ru-RU')}
                                        </strong>
                                    </TableCell>
                                    <TableCell>
                                        Поставщик:
                                        <strong>{getRefName.suppliersName(req.supplier_id)}</strong>
                                    </TableCell>
                                    <TableCell>
                                        Статус:
                                        <strong>{getRefName.statusName(req.status)}</strong>
                                    </TableCell>
                                </TableRow>

                                {/* DETAILS */}
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ p: 1 }}>
                                        <Collapse in={openRows[req.id]} unmountOnExit>
                                            <Box>
                                                <Typography fontWeight={600} color="#2c7ecb">
                                                    Список материалов для приемки
                                                </Typography>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>№ заявки</TableCell>
                                                            <TableCell>Тип материала</TableCell>
                                                            <TableCell>Материал</TableCell>
                                                            <TableCell>Кол-во</TableCell>
                                                            <TableCell>Ед.изм</TableCell>
                                                            <TableCell>Цена</TableCell>
                                                            <TableCell>Сумма</TableCell>
                                                            <TableCell>Статус</TableCell>
                                                            <TableCell>Доставлено</TableCell>
                                                            <TableCell>
                                                                Доставленное кол-во
                                                            </TableCell>
                                                            <TableCell>Примечание</TableCell>
                                                            <TableCell>Принять</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {req.items?.map((item) => (
                                                            <TableRow
                                                                key={item.id}
                                                                hover
                                                                sx={{
                                                                    '& td': {
                                                                        textAlign: 'center',
                                                                    },
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    {item.purchase_order_id}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getRefName.materialTypeName(
                                                                        item.material_type
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getRefName.materialName(
                                                                        item.material_id
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.quantity}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getRefName.unitName(
                                                                        item.unit_of_measure
                                                                    )}
                                                                </TableCell>

                                                                <TableCell>
                                                                    {item.price ?? '—'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.summ ?? '—'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getRefName.statusName(
                                                                        item.status
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <TextField
                                                                        type="number"
                                                                        size="small"
                                                                        value={
                                                                            deliveredMap[item.id] ??
                                                                            item.delivered_quantity ??
                                                                            ''
                                                                        }
                                                                        inputProps={{
                                                                            min: 0,
                                                                            max: item.quantity,
                                                                        }}
                                                                        sx={compactTextFieldSx}
                                                                        onChange={(e) => {
                                                                            const value =
                                                                                e.target.value ===
                                                                                ''
                                                                                    ? ''
                                                                                    : Number(
                                                                                          e.target
                                                                                              .value
                                                                                      );

                                                                            setDeliveredMap(
                                                                                (prev) => ({
                                                                                    ...prev,
                                                                                    [item.id]:
                                                                                        value,
                                                                                })
                                                                            );
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <TextField
                                                                        type="number"
                                                                        size="small"
                                                                        value={
                                                                            deliveredMap[item.id] ??
                                                                            item.recieved_quantity ??
                                                                            ''
                                                                        }
                                                                        inputProps={{
                                                                            min: 0,
                                                                            max: item.quantity,
                                                                        }}
                                                                        sx={compactTextFieldSx}
                                                                        onChange={(e) => {
                                                                            const value =
                                                                                e.target.value ===
                                                                                ''
                                                                                    ? ''
                                                                                    : Number(
                                                                                          e.target
                                                                                              .value
                                                                                      );

                                                                            setDeliveredMap(
                                                                                (prev) => ({
                                                                                    ...prev,
                                                                                    [item.id]:
                                                                                        value,
                                                                                })
                                                                            );
                                                                        }}
                                                                    />
                                                                </TableCell>

                                                                <TableCell>
                                                                    <TextField
                                                                        sx={compactFieldSx}
                                                                        value={
                                                                            commentMap[item.id] ??
                                                                            ''
                                                                        }
                                                                        onChange={(e) =>
                                                                            setCommentMap(
                                                                                (prev) => ({
                                                                                    ...prev,
                                                                                    [item.id]:
                                                                                        e.target
                                                                                            .value,
                                                                                })
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>

                                                                <TableCell>
                                                                    <Checkbox
                                                                        checked={
                                                                            checkedMap[item.id] ??
                                                                            false
                                                                        }
                                                                        onChange={(e) =>
                                                                            setCheckedMap(
                                                                                (prev) => ({
                                                                                    ...prev,
                                                                                    [item.id]:
                                                                                        e.target
                                                                                            .checked,
                                                                                })
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
            <Box display="flex" justifyContent="flex-end" p={1}>
                <button className="btn btn-primary" onClick={handleReceive}>
                    Подтвердить
                </button>
            </Box>
        </TableContainer>
    );
}
