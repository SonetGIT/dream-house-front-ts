import React, { useState, useMemo } from 'react';
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
import { type PurchaseOrder } from '../purchaseOrders/purchaseOrdersSlice';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { compactFieldSx, compactTextFieldSx } from '@/styles/ui_style';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/app/store';
import {
    receivePurchaseOrderItems,
    type ReceiveItemPayload,
} from '../purchaseOrderItems/purchaseOrderItemsSlice';
import { formatDateTime } from '@/utils/formatDateTime';
import { AppButton } from '@/components/ui/AppButton';

interface PropsType {
    orders: PurchaseOrder[];
    warehouseId: string | undefined;
    getRefName: {
        materialTypeName: (id: number) => string;
        materialName: (id: number) => string;
        unitName: (id: number) => string;
        suppliersName: (id: number) => string;
        statusName: (id: number) => string;
        statusItemName: (id: number) => string;
    };
}

export default function WarehousePurchaseOrdersTable({
    orders,
    warehouseId,
    getRefName,
}: PropsType) {
    const dispatch = useAppDispatch();
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const [receivedMap, setReceivedMap] = useState<Record<number, number | ''>>({});
    const [commentMap, setCommentMap] = useState<Record<number, string>>({});
    const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});

    const getAvailableToReceive = (item: any) => {
        const delivered = item.delivered_quantity || 0;
        const total = item.quantity || 0;
        return Math.max(0, total - delivered);
    };

    const isFullyReceived = (item: any) => getAvailableToReceive(item) === 0;

    const toggleRow = (id: number) => {
        setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const allSelectableItems = useMemo(() => {
        return orders.flatMap((order) =>
            (order.items || []).filter((item) => !isFullyReceived(item)),
        );
    }, [orders]);

    const allSelected =
        allSelectableItems.length > 0 && allSelectableItems.every((item) => checkedMap[item.id]);

    const toggleAll = () => {
        const newChecked = !allSelected;
        const newCheckedMap = { ...checkedMap };
        allSelectableItems.forEach((item) => {
            newCheckedMap[item.id] = newChecked;
            if (newChecked) {
                // При выборе "всех" — устанавливаем available
                const available = getAvailableToReceive(item);
                setReceivedMap((prev) => ({ ...prev, [item.id]: available }));
            }
        });
        setCheckedMap(newCheckedMap);
    };

    const toggleOne = (item: any) => {
        const id = item.id;
        const newChecked = !checkedMap[id];
        setCheckedMap((prev) => ({ ...prev, [id]: newChecked }));

        if (newChecked) {
            const available = getAvailableToReceive(item);
            setReceivedMap((prev) => ({ ...prev, [id]: available }));
        } else {
            setReceivedMap((prev) => {
                const newMap = { ...prev };
                delete newMap[id];
                return newMap;
            });
            setCommentMap((prev) => {
                const newMap = { ...prev };
                delete newMap[id];
                return newMap;
            });
        }
    };

    const handleReceive = async () => {
        if (!warehouseId) {
            toast.error('Склад не выбран');
            return;
        }

        const warehouseIdNum = Number(warehouseId);
        if (isNaN(warehouseIdNum) || warehouseIdNum <= 0) {
            toast.error('Некорректный ID склада');
            return;
        }

        const validItems: ReceiveItemPayload[] = [];
        let hasError = false;

        allSelectableItems.forEach((item) => {
            if (checkedMap[item.id]) {
                const rawValue = receivedMap[item.id];
                const available = getAvailableToReceive(item);

                if (rawValue === '' || rawValue === undefined) {
                    toast.error(
                        `Укажите количество прихода для "${getRefName.materialName(
                            item.material_id,
                        )}"`,
                    );
                    hasError = true;
                    return;
                }

                const received_quantity = Number(rawValue);
                if (isNaN(received_quantity) || received_quantity <= 0) {
                    toast.error(
                        `Количество должно быть > 0 для "${getRefName.materialName(
                            item.material_id,
                        )}"`,
                    );
                    hasError = true;
                    return;
                }

                if (received_quantity > available) {
                    toast.error(
                        `Макс. приход: ${available} для "${getRefName.materialName(
                            item.material_id,
                        )}"`,
                    );
                    hasError = true;
                    return;
                }

                validItems.push({
                    purchase_order_item_id: item.id,
                    received_quantity,
                    comment: commentMap[item.id] || undefined,
                });
            }
        });

        if (hasError) return;
        if (validItems.length === 0) {
            toast.error('Выберите хотя бы один материал для приёмки');
            return;
        }

        try {
            const result = await dispatch(
                receivePurchaseOrderItems({
                    warehouse_id: warehouseIdNum,
                    items: validItems,
                }),
            );

            if (receivePurchaseOrderItems.fulfilled.match(result)) {
                toast.success('Приёмка успешно завершена!');
                setCheckedMap({});
                setReceivedMap({});
                setCommentMap({});
            } else {
                toast.error(
                    'Ошибка при приёмке: ' + ((result.payload as string) || 'Неизвестная ошибка'),
                );
            }
        } catch (err) {
            console.error('Ошибка приёмки:', err);
            toast.error('Произошла непредвиденная ошибка');
        }
    };

    /********************************************************************************************************************/
    return (
        <TableContainer component={Paper} className="table-container">
            <Table className="table">
                <TableBody>
                    {orders?.map((req) => (
                        <React.Fragment key={req.id}>
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
                                    Дата создания: <strong>{formatDateTime(req.created_at)}</strong>
                                </TableCell>
                                <TableCell>
                                    Поставщик:{' '}
                                    <strong>{getRefName.suppliersName(req.supplier_id)}</strong>
                                </TableCell>
                                <TableCell>
                                    Статус: <strong>{getRefName.statusName(req.status)}</strong>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell colSpan={5} sx={{ p: 1 }}>
                                    <Collapse in={openRows[req.id]} unmountOnExit>
                                        <Box>
                                            <Typography fontWeight={600} color="#2c7ecb" mb={1}>
                                                Список материалов для приёмки
                                            </Typography>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Тип материала</TableCell>
                                                        <TableCell>Материал</TableCell>
                                                        <TableCell>Кол-во</TableCell>
                                                        <TableCell>Ед.изм</TableCell>
                                                        <TableCell>Цена</TableCell>
                                                        <TableCell>Сумма</TableCell>
                                                        <TableCell>Статус</TableCell>
                                                        <TableCell>Доставлено</TableCell>
                                                        <TableCell>Приход</TableCell>
                                                        <TableCell>Примечание</TableCell>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                checked={allSelected}
                                                                indeterminate={
                                                                    !allSelected &&
                                                                    allSelectableItems.some(
                                                                        (item) =>
                                                                            checkedMap[item.id],
                                                                    )
                                                                }
                                                                onChange={toggleAll}
                                                                disabled={
                                                                    allSelectableItems.length === 0
                                                                }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {req.items?.map((item) => {
                                                        const fullyReceived = isFullyReceived(item);
                                                        const available =
                                                            getAvailableToReceive(item);
                                                        const isChecked = !!checkedMap[item.id];
                                                        // Значение для отображения: если выбрано — из receivedMap, иначе — available
                                                        const displayValue = isChecked
                                                            ? (receivedMap[item.id] ?? available)
                                                            : available;

                                                        return (
                                                            <TableRow
                                                                key={item.id}
                                                                hover={!fullyReceived}
                                                                sx={{
                                                                    '& td': { textAlign: 'center' },
                                                                    opacity: fullyReceived
                                                                        ? 0.6
                                                                        : 1,
                                                                    pointerEvents: fullyReceived
                                                                        ? 'none'
                                                                        : 'auto',
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    {getRefName.materialTypeName(
                                                                        item.material_type,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getRefName.materialName(
                                                                        item.material_id,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.quantity}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getRefName.unitName(
                                                                        item.unit_of_measure,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.price ?? '—'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.summ ?? '—'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getRefName.statusItemName(
                                                                        item.status,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.delivered_quantity ?? '0'}
                                                                </TableCell>

                                                                {/* Поле "Приход" — всегда отображает available*/}
                                                                <TableCell>
                                                                    {fullyReceived ? (
                                                                        '—'
                                                                    ) : (
                                                                        <TextField
                                                                            type="number"
                                                                            size="small"
                                                                            value={displayValue}
                                                                            inputProps={{
                                                                                min: 1,
                                                                                max: available,
                                                                                step: 1,
                                                                            }}
                                                                            sx={compactTextFieldSx}
                                                                            // disabled={!isChecked} // ← ключевое: редактируемо только если выбрано
                                                                            onChange={(e) => {
                                                                                const val =
                                                                                    e.target
                                                                                        .value ===
                                                                                    ''
                                                                                        ? ''
                                                                                        : Number(
                                                                                              e
                                                                                                  .target
                                                                                                  .value,
                                                                                          );
                                                                                setReceivedMap(
                                                                                    (prev) => ({
                                                                                        ...prev,
                                                                                        [item.id]:
                                                                                            val,
                                                                                    }),
                                                                                );
                                                                            }}
                                                                        />
                                                                    )}
                                                                </TableCell>

                                                                <TableCell>
                                                                    {fullyReceived ? (
                                                                        '—'
                                                                    ) : (
                                                                        <TextField
                                                                            size="small"
                                                                            value={
                                                                                commentMap[
                                                                                    item.id
                                                                                ] ?? ''
                                                                            }
                                                                            // disabled={!isChecked}
                                                                            onChange={(e) =>
                                                                                setCommentMap(
                                                                                    (prev) => ({
                                                                                        ...prev,
                                                                                        [item.id]:
                                                                                            e.target
                                                                                                .value,
                                                                                    }),
                                                                                )
                                                                            }
                                                                            sx={compactFieldSx}
                                                                        />
                                                                    )}
                                                                </TableCell>

                                                                <TableCell padding="checkbox">
                                                                    {fullyReceived ? (
                                                                        '—'
                                                                    ) : (
                                                                        <Checkbox
                                                                            checked={isChecked}
                                                                            onChange={() =>
                                                                                toggleOne(item)
                                                                            }
                                                                        />
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>

            <Box display="flex" justifyContent="flex-end" p={1}>
                <AppButton
                    variantType="primary"
                    sx={{
                        bgcolor: 'transparent',
                        color: 'var(--primary)',
                        border: '1px solid var(--primary)',
                        '&:hover': {
                            bgcolor: 'rgba(44,126,203,0.1)',
                        },
                    }}
                    onClick={handleReceive}
                >
                    Подтвердить приёмку
                </AppButton>
            </Box>
        </TableContainer>
    );
}
