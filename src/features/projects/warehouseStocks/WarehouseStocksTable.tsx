import type { WarehouseStocks } from './warehouseStocksSlice';
import { TablePagination } from '@/components/ui/TablePagination';
import type { Pagination } from '@/features/users/userSlice';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';

interface PropsType {
    data: WarehouseStocks[];
    pagination: Pagination | null | undefined;
    getRefName: {
        materialTypeName: (id: number) => string;
        materialName: (id: number) => string;
        unitName: (id: number) => string;
    };
}

/*******************************************************************************************************************************/
export default function WarehouseStocksTable(props: PropsType) {
    return (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table className="table">
                <TableHead>
                    <TableRow>
                        {/* <th>Наименование склада</th> */}
                        <TableCell>Тип материала</TableCell>
                        <TableCell>Материал</TableCell>
                        <TableCell>Едю изм.</TableCell>
                        <TableCell>Количество</TableCell>
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
                                <TableCell>
                                    {props.getRefName.materialTypeName(item.material_type)}
                                </TableCell>
                                <TableCell>
                                    {props.getRefName.materialName(item.material_id)}
                                </TableCell>
                                <TableCell>
                                    {props.getRefName.unitName(item.unit_of_measure)}
                                </TableCell>
                                <TableCell>{item.quantity}</TableCell>
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
