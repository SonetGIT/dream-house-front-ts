import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { EstimateItemRowType } from './useMaterialEstimateItemsForm';
import EstimateItemRow from './EstimateItemRow';

interface Props {
    rows: EstimateItemRowType[];
    updateField: (index: number, field: keyof EstimateItemRowType, value: any) => void;
    removeRow: (index: number) => void;
    rowTotal: (row: EstimateItemRowType) => number;
    refs: {
        serviceTypes: ReferenceResult;
        services: ReferenceResult;
        materialTypes: ReferenceResult;
        materials: ReferenceResult;
        unitsOfMeasure: ReferenceResult;
        currencies: ReferenceResult;
        materialEstimateItemTypes: ReferenceResult;
    };
}

export default function EstimateItemsTable({
    rows,
    updateField,
    removeRow,
    rowTotal,
    refs,
}: Props) {
    return (
        <Table
            size="small"
            sx={{
                borderCollapse: 'collapse',
                '& .MuiTableCell-root': {
                    padding: '4px 8px',
                },
            }}
        >
            <TableHead>
                <TableRow
                    sx={{
                        '& th': {
                            padding: '6px 8px',
                            fontWeight: 600,
                            fontSize: '0.825rem',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                            color: '#2c7ecb',
                        },
                    }}
                >
                    {/* Новый столбец Тип позиции */}
                    {/* <TableCell>Под этапы</TableCell> */}
                    <TableCell>Тип позиции</TableCell>
                    <TableCell>Группа услуг</TableCell>
                    <TableCell>Услуга</TableCell>

                    <TableCell>Тип материала</TableCell>
                    <TableCell>Материал</TableCell>

                    <TableCell>Ед. изм</TableCell>
                    <TableCell>Кол-во</TableCell>
                    <TableCell>Коэффициент</TableCell>

                    <TableCell>Валюта</TableCell>
                    <TableCell>Цена</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                    <TableCell>Примечание</TableCell>

                    <TableCell />
                </TableRow>
            </TableHead>

            <TableBody>
                {rows?.map((row, index) => (
                    <EstimateItemRow
                        key={index}
                        row={row}
                        index={index}
                        updateField={updateField}
                        removeRow={removeRow}
                        rowTotal={rowTotal}
                        refs={refs}
                    />
                ))}
            </TableBody>
        </Table>
    );
}
