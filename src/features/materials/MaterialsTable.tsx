import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { type Material } from './materialsSlice';
import { MdDelete } from 'react-icons/md';
import type { ReferenceResult } from '../reference/referenceSlice';
import { TablePagination } from '@/components/ui/TablePagination';
import type { Pagination } from '../users/userSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

interface Props {
    data: Material[];
    refs: Record<string, ReferenceResult>;
    onEdit: (material: Material) => void;
    onDelete: (id: number) => void;
    pagination: Pagination | null;
    onPrevPage: () => void;
    onNextPage: () => void;
}

/*********************************************************************************************************/
export function MaterialsTable(props: Props) {
    return (
        <div className="table-container">
            <Table className="table">
                <TableHead>
                    <TableRow>
                        <TableCell>Название</TableCell>
                        <TableCell>ед.изм.</TableCell>
                        <TableCell>Коэффициент</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell align="right" />
                    </TableRow>
                </TableHead>

                <TableBody>
                    {props.data?.map((material) => (
                        <TableRow
                            key={material.id}
                            onClick={() => props.onEdit(material)}
                            sx={{
                                '& td': {
                                    textAlign: 'center',
                                },
                                cursor: 'pointer',
                            }}
                        >
                            <TableCell>{material.name}</TableCell>
                            <TableCell>
                                {props.refs.unitsOfMeasure.lookup(material.unit_of_measure)}
                            </TableCell>
                            <TableCell>{material.coefficient}</TableCell>
                            <TableCell>{material.description}</TableCell>
                            <TableCell className="action-container">
                                <StyledTooltip title="Удалить">
                                    <MdDelete
                                        size={20}
                                        color="#c96161"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            props.onDelete(material.id);
                                        }}
                                    />
                                </StyledTooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/*Пагинация***********************************************************************************************************/}
            <TablePagination
                pagination={props.pagination}
                onPrev={props.onPrevPage}
                onNext={props.onNextPage}
            />
        </div>
    );
}
