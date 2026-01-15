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
import { compactFieldSx, compactTextFieldSx, tableCellSx } from '@/styles/ui_style';

export default function WarehousePurchaseOrdersTable() {
    const dispatch = useAppDispatch();
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const { lookup: getStatusName } = useReference('beaaf9c2-b0d1-4c1c-8861-5723b936c334');
    const { lookup: getSuppliersName } = useReference('7ec0dff6-a9cd-46fe-bc8a-d32f20bcdfbf');
    const { lookup: getMaterialTypeName } = useReference('681635e7-3eff-413f-9a07-990bfe7bc68a');
    const { lookup: getMaterialName } = useReference('7c52acfc-843a-4242-80ba-08f7439a29a7');
    const { lookup: getUnitOfMeasure } = useReference('2198d87a-d834-4c5d-abf8-8925aeed784e');

    const toggleRow = (id: number) => {
        setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    const { data: orders, pagination, loading } = useAppSelector((state) => state.purchaseOrders);

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
                                            // size="small"
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
                                                            <TableCell>
                                                                Доставленное кол-во
                                                            </TableCell>
                                                            <TableCell>Примечание</TableCell>
                                                            <TableCell></TableCell>
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
                                                                        // {/* {...field} */}
                                                                        type="number"
                                                                        // error={!!fieldState.error}
                                                                        // helperText={fieldState.error?.message}
                                                                        sx={compactTextFieldSx}
                                                                    />
                                                                    {/* <TextField
                                                                        type="number"
                                                                        size="small"
                                                                        value={
                                                                            item.delivered_quantity ??
                                                                            ''
                                                                        }
                                                                        inputProps={{
                                                                            min: 0,
                                                                            max: item.quantity,
                                                                        }}
                                                                        sx={{ width: 80 }}
                                                                        onChange={(e) => {
                                                                            const value = Number(
                                                                                e.target.value
                                                                            );
                                                                            // здесь позже будет setState / dispatch
                                                                            console.log(
                                                                                'delivered_quantity',
                                                                                value
                                                                            );
                                                                        }}
                                                                    /> */}
                                                                </TableCell>

                                                                <TableCell>
                                                                    <TextField
                                                                        sx={compactFieldSx}
                                                                        onChange={(e) => {
                                                                            console.log(
                                                                                'comment',
                                                                                e.target.value
                                                                            );
                                                                        }}
                                                                    />
                                                                </TableCell>

                                                                <TableCell align="center">
                                                                    <Checkbox
                                                                        onChange={(e) => {
                                                                            console.log(
                                                                                'accepted',
                                                                                e.target.checked
                                                                            );
                                                                        }}
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
        </TableContainer>
    );
}
