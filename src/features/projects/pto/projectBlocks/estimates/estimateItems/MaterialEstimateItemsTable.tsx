import { Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material';
import type { MaterialEstimateItem } from './materialEstimateItemsSlice';
import { useReference } from '@/features/reference/useReference';

interface Props {
    items: MaterialEstimateItem[];
}

export default function MaterialEstimateItemsTable({ items }: Props) {
    // Справочники
    const refs = {
        services: useReference('services'),
        serviceTypes: useReference('serviceTypes'),
        materials: useReference('materials'),
        materialTypes: useReference('materialTypes'),
        unitsOfMeasure: useReference('unitsOfMeasure'),
        currencies: useReference('currencies'),
    };
    if (items.length === 0) {
        return (
            <Typography sx={{ p: 2 }} variant="body2">
                Нет позиций
            </Typography>
        );
    }

    return (
        <Table
            size="small"
            sx={{
                borderCollapse: 'collapse',
                '& th': {
                    fontSize: 12,
                    fontWeight: 600,
                    bgcolor: '#f1f5f9',
                    color: '#475569',
                    py: 0.7,
                    borderBottom: '1px solid #e2e8f0',
                },
                '& td': {
                    fontSize: 12,
                    py: 0.6,
                    borderBottom: '1px solid #f1f5f9',
                },
                '& tbody tr:hover': {
                    bgcolor: '#f8fafc',
                },
            }}
        >
            <TableHead>
                <TableRow>
                    <TableCell>Группа услуг</TableCell>
                    <TableCell>Услуга</TableCell>
                    <TableCell>Тип материала</TableCell>
                    <TableCell>Материал</TableCell>
                    <TableCell align="center">ед. изм</TableCell>
                    <TableCell align="right">Кол-во</TableCell>
                    <TableCell align="right">Коэффициент</TableCell>
                    <TableCell align="center">Валюта</TableCell>
                    <TableCell align="right">Цена</TableCell>
                    <TableCell>Примечание</TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            {item.service_type != null
                                ? refs.serviceTypes.lookup(item.service_type)
                                : '—'}
                        </TableCell>
                        <TableCell>
                            {item.service_id != null ? refs.services.lookup(item.service_id) : '—'}
                        </TableCell>
                        <TableCell>
                            {' '}
                            {item.material_type != null
                                ? refs.materialTypes.lookup(item.material_type)
                                : '—'}
                        </TableCell>
                        <TableCell>
                            {item.material_id != null
                                ? refs.materials.lookup(item.material_id)
                                : '—'}
                        </TableCell>
                        <TableCell align="center">
                            {item.unit_of_measure != null
                                ? refs.unitsOfMeasure.lookup(item.unit_of_measure)
                                : '—'}
                        </TableCell>
                        <TableCell align="right">{item.quantity_planned}</TableCell>
                        <TableCell align="right">{item.coefficient}</TableCell>
                        <TableCell align="center">
                            {item.currency != null ? refs.currencies.lookup(item.currency) : '—'}
                        </TableCell>
                        <TableCell align="right">{item.price || 0}</TableCell>
                        <TableCell>{item.comment}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
