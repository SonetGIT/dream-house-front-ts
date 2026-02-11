import { TablePagination } from '@/components/ui/TablePagination';
import type { Pagination } from '@/features/users/userSlice';
import type { MaterialMovement } from './materialMovementsSlice';
import { formatDateTime } from '@/utils/formatDateTime';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import type { ReferenceResult } from '@/features/reference/referenceSlice';

interface PropsType {
    data: MaterialMovement[];
    pagination: Pagination | null | undefined;
    refs: Record<string, ReferenceResult>;
}

/*******************************************************************************************************************************/
export default function MaterialMovementsTable(props: PropsType) {
    return (
        <TableContainer component={Paper} className="table-container">
            <Table className="table">
                <TableHead>
                    <TableRow>
                        {/* <th>Наименование склада</th> */}
                        <TableCell>Дата</TableCell>
                        <TableCell>Со склада</TableCell>
                        <TableCell>На склад</TableCell>
                        <TableCell>Выполнил</TableCell>
                        <TableCell>Транзакция</TableCell>
                        <TableCell>Материал</TableCell>
                        <TableCell>Кол-во</TableCell>
                        <TableCell>Операция</TableCell>
                        <TableCell>Cтатус</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {props.data?.length > 0 ? (
                        props.data.map((item) => (
                            <TableRow
                                key={item.id}
                                sx={{
                                    '& td': {
                                        textAlign: 'center',
                                    },
                                }}
                            >
                                <TableCell> {formatDateTime(item.date)}</TableCell>
                                <TableCell>
                                    {item.from_warehouse_id !== null
                                        ? props.refs.warehouses.lookup(item.from_warehouse_id)
                                        : '-'}
                                </TableCell>
                                <TableCell>
                                    {item.to_warehouse_id !== null
                                        ? props.refs.warehouses.lookup(item.to_warehouse_id)
                                        : '-'}
                                </TableCell>
                                <TableCell>{props.refs.users.lookup(item.user_id)}</TableCell>
                                <TableCell>{item.note}</TableCell>
                                <TableCell>
                                    {props.refs.materials.lookup(item.material_id)}
                                </TableCell>

                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.operation}</TableCell>
                                <TableCell>
                                    {props.refs.materialMovementStatuses.lookup(item.status)}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} style={{ textAlign: 'center', color: 'red' }}>
                                Ничего не найдено
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/*Пагинация***************************************************************************************************************/}
            <TablePagination pagination={props.pagination} />
        </TableContainer>
    );
}
