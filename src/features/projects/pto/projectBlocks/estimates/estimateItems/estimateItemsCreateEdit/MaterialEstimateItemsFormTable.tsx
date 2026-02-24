import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import type { TypeMaterialEstimateItemFormRow } from './useMaterialEstimateItemsForm';
import MaterialEstimateItemFormRow from './MaterialEstimateItemFormRow';
import { useReference } from '@/features/reference/useReference';

interface Props {
    rows: TypeMaterialEstimateItemFormRow[];
    updateField: any;
    removeRow: any;
    rowTotal: any;
    isEditMode: boolean;
}

export default function MaterialEstimateItemsFormTable({
    rows,
    updateField,
    removeRow,
    rowTotal,
    isEditMode,
}: Props) {
    const refs = {
        serviceTypes: useReference('serviceTypes'),
        services: useReference('services'),
        materialTypes: useReference('materialTypes'),
        materials: useReference('materials'),
        currencies: useReference('currencies'),
        unitsOfMeasure: useReference('unitsOfMeasure'),
    };

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
                            fontSize: '0.8rem',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap', // ❗ заголовки в одну строку
                        },
                    }}
                >
                    <TableCell>Группа услуг</TableCell>
                    <TableCell>Услуга</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Материал</TableCell>
                    <TableCell>ед. изм</TableCell>
                    <TableCell>Кол-во</TableCell>
                    <TableCell>Коэффициент</TableCell>
                    <TableCell>Валюта</TableCell>
                    <TableCell align="right">Цена</TableCell>
                    <TableCell>Примечание</TableCell>
                    {!isEditMode && <TableCell />}
                </TableRow>
            </TableHead>

            <TableBody>
                {rows?.map((row, index) => (
                    <MaterialEstimateItemFormRow
                        key={index}
                        row={row}
                        index={index}
                        updateField={updateField}
                        removeRow={removeRow}
                        rowTotal={rowTotal}
                        isEditMode={isEditMode}
                        refs={refs}
                    />
                ))}
            </TableBody>
        </Table>
    );
}
