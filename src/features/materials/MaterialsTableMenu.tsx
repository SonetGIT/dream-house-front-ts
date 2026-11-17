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
    onPageChange: (page: number) => void;
    onSizeChange: (size: number) => void;
}

/*********************************************************************************************************/
export function MaterialsTableMenu(props: Props) {
    return (
        <div className="table-container">
            <Table className="table">
                <TableHead>
                    <TableRow>
                        <TableCell>Название</TableCell>
                        <TableCell>ед.изм.</TableCell>
                        <TableCell>Коэффициент</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell align="center">Действие</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {props.data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center">Материалы не найдены</TableCell>
                        </TableRow>
                    )}
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
                            <TableCell align="center">
                                <div className="action-container">
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
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {props.pagination && (
                <TablePagination
                    pagination={props.pagination}
                    onPageChange={props.onPageChange}
                    onSizeChange={props.onSizeChange}
                    showFirstButton
                    showLastButton
                />
            )}
        </div>
    );
}
