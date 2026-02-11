import { RiArrowRightUpBoxFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { Warehouse } from './warehousesSlice';
import type { Pagination } from '../../users/userSlice';
import { MdAdsClick } from 'react-icons/md';
import { TablePagination } from '@/components/ui/TablePagination';
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
    items: Warehouse[];
    pagination: Pagination | null;
    refs: Record<string, ReferenceResult>;
}

/*******************************************************************************************************************************/
export default function WarehousesList(props: PropsType) {
    const navigate = useNavigate();
    const handleRowClick = (warehouse: Warehouse) => {
        navigate(`${warehouse.id}`, { state: { warehouse } });
    };

    /*******************************************************************************************************************************/
    return (
        <TableContainer component={Paper} className="table-container">
            <Table className="table">
                <TableHead>
                    <TableRow>
                        <TableCell>Наименование склада</TableCell>
                        <TableCell>Код</TableCell>
                        <TableCell>Адрес</TableCell>
                        <TableCell>Кладовшик</TableCell>
                        <TableCell>Телефон</TableCell>
                        <TableCell>
                            <MdAdsClick size={20} style={{ verticalAlign: 'middle' }} />
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {props.items?.length > 0 ? (
                        props.items.map((item) => (
                            <TableRow
                                key={item.id}
                                onClick={() => handleRowClick(item)}
                                sx={{
                                    '& td': {
                                        textAlign: 'center',
                                    },
                                    cursor: 'pointer',
                                }}
                            >
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.code}</TableCell>
                                <TableCell>{item.address}</TableCell>
                                <TableCell>{props.refs.users.lookup(item.manager_id)}</TableCell>
                                <TableCell>{item.phone}</TableCell>
                                <TableCell className="action-container">
                                    <StyledTooltip title="Открыть">
                                        <RiArrowRightUpBoxFill
                                            size={20}
                                            color="#66a7da"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRowClick(item);
                                            }}
                                        />
                                    </StyledTooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <td colSpan={6} style={{ textAlign: 'center', color: 'red' }}>
                                Ничего не найдено
                            </td>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/*Пагинация***************************************************************************************************************/}
            <TablePagination
                pagination={props.pagination}
                // onPrev={props.onPrevPage}
                // onNext={props.onNextPage}
            />
        </TableContainer>
    );
}
