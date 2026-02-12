import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    TableContainer,
} from '@mui/material';
import { type DocumentStages } from './documentStagesSlice';
import { formatDateTime } from '@/utils/formatDateTime';
import { useNavigate } from 'react-router-dom';
import type { Pagination } from '@/features/users/userSlice';
import { MdAdsClick } from 'react-icons/md';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { RiArrowRightUpBoxFill } from 'react-icons/ri';
import { TablePagination } from '@/components/ui/TablePagination';

interface PropsType {
    items: DocumentStages[];
    pagination: Pagination | null;
}

export default function DocumentStagesTable(props: PropsType) {
    const navigate = useNavigate();
    const handleRowClick = (docStage: DocumentStages) => {
        navigate(`${docStage.id}`, { state: { docStage } });
    };

    /*******************************************************************************************************************************/
    return (
        <TableContainer component={Paper} className="table-container">
            <Table className="table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Наименование</TableCell>
                        <TableCell>Создан</TableCell>
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
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{formatDateTime(item.created_at)}</TableCell>
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
