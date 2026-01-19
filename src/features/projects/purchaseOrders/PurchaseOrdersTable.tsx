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
import { useReference } from '@/features/reference/useReference';
import { useOutletContext, useParams } from 'react-router-dom';
import type { ProjectOutletContext } from '../material_request/MaterialRequests';

/***********************************************************************************************************************************/
export default function PurchaseOrdersTable() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const dispatch = useAppDispatch();
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const { lookup: getPurchaseOrderStatusesName } = useReference(
        '84242cf6-76a5-403a-bd87-63f58c539d2b'
    ); //purchaseOrderStatuses/gets
    const { lookup: getPurchaseOrderItemStatusesName } = useReference(
        '2beaaf9c2-b0d1-4c1c-8861-6c3345723b93'
    ); //purchaseOrderItemStatuses/gets
    const { lookup: getSuppliersName } = useReference('7ec0dff6-a9cd-46fe-bc8a-d32f20bcdfbf');
    const { lookup: getMaterialTypeName } = useReference('681635e7-3eff-413f-9a07-990bfe7bc68a');
    const { lookup: getMaterialName } = useReference('7c52acfc-843a-4242-80ba-08f7439a29a7');
    const { lookup: getUnitOfMeasure } = useReference('2198d87a-d834-4c5d-abf8-8925aeed784e');

    const toggleRow = (id: number) => {
        setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    const { data: orders, loading } = useAppSelector((state) => state.purchaseOrders);

    // 🔥 Загрузка списка при монтировании
    useEffect(() => {
        dispatch(fetchPurchaseOrders({ page: 1, size: 10, project_id: projectId }));
    }, [dispatch]);

    if (loading) return <Typography>Загрузка заявок...</Typography>;

    const getRefName = {
        materialTypeName: getMaterialTypeName,
        materialName: getMaterialName,
        unitName: getUnitOfMeasure,
        suppliersName: getSuppliersName,
        statusName: getPurchaseOrderStatusesName,
        statusItemName: getPurchaseOrderItemStatusesName,
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
                                                                    <strong>
                                                                        {getRefName.statusItemName(
                                                                            item.status
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
