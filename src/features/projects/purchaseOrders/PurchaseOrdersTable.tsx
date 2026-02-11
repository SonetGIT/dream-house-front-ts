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
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchPurchaseOrders } from './purchaseOrdersSlice';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useOutletContext } from 'react-router-dom';
import type { ProjectOutletContext } from '../material_request/MaterialRequests';
import { formatDateTime } from '@/utils/formatDateTime';
import { useReference } from '@/features/reference/useReference';

/***********************************************************************************************************************************/
export default function PurchaseOrdersTable() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const dispatch = useAppDispatch();
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});

    const refs = {
        purchaseOrderStatuses: useReference('purchaseOrderStatuses'),
        purchaseOrderItemStatuses: useReference('purchaseOrderItemStatuses'),
        suppliers: useReference('suppliers'),
        materialTypes: useReference('materialTypes'),
        materials: useReference('materials'),
        unitsOfMeasure: useReference('unitsOfMeasure'),
    };

    const toggleRow = (id: number) => {
        setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    const { data: orders, loading } = useAppSelector((state) => state.purchaseOrders);

    //Загрузка списка при монтировании
    useEffect(() => {
        dispatch(fetchPurchaseOrders({ page: 1, size: 10, project_id: projectId }));
    }, [dispatch]);

    if (loading) return <Typography>Загрузка заявок...</Typography>;

    /***********************************************************************************************************************************/
    return (
        <TableContainer component={Paper} className="table-container">
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
                                        <strong>{formatDateTime(req.created_at)}</strong>
                                    </TableCell>
                                    <TableCell>
                                        Поставщик:
                                        <strong>{refs.suppliers.lookup(req.supplier_id)}</strong>
                                    </TableCell>
                                    <TableCell>
                                        Статус:
                                        <strong>
                                            {refs.purchaseOrderStatuses.lookup(req.status)}
                                        </strong>
                                    </TableCell>
                                </TableRow>

                                {/* DETAILS */}
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ p: 1 }}>
                                        <Collapse in={openRows[req.id]} unmountOnExit>
                                            <Box>
                                                <Typography
                                                    fontWeight={600}
                                                    color="#2c7ecb"
                                                    sx={{ p: 1 }}
                                                >
                                                    Список материалов для поставщика
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
                                                                    {refs.materialTypes.lookup(
                                                                        item.material_type,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {refs.materials.lookup(
                                                                        item.material_id,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.quantity}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {refs.unitsOfMeasure.lookup(
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
                                                                    <strong>
                                                                        {refs.purchaseOrderItemStatuses.lookup(
                                                                            item.status,
                                                                        )}
                                                                    </strong>
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
