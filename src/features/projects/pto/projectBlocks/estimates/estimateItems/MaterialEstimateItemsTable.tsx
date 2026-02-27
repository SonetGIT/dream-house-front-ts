import { Table, TableHead, TableRow, TableCell, TableBody, Typography, Box } from '@mui/material';
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

    if (items?.length === 0) {
        return (
            <Typography sx={{ p: 1.5, color: '#64748b', fontSize: '0.875rem' }} variant="body2">
                Нет позиций
            </Typography>
        );
    }

    return (
        <Box
            sx={{
                border: '1px solid #e2e8f0',
                borderRadius: 1.5,
                overflow: 'hidden',
            }}
        >
            <Table
                size="small"
                sx={{
                    borderCollapse: 'collapse',
                    '& th': {
                        fontSize: 12,
                        fontWeight: 600,
                        bgcolor: '#f8fafc', // Очень светло-голубой (отличается от родителя)
                        color: '#334155', // Темнее чем у родителя
                        py: 0.6,
                        px: 1,
                        borderBottom: '1px solid #e2e8f0',
                    },
                    '& td': {
                        fontSize: 12, // Мельче чем у родителя (12px → 11px)
                        py: 0.5,
                        px: 1,
                        borderBottom: '1px solid #f1f5f9',
                        color: '#475569', // Немного темнее
                    },
                    '& tbody tr:hover': {
                        bgcolor: '#f1f5f9', // Более нейтральный hover
                    },
                    '& tbody tr:last-child td': {
                        borderBottom: 'none',
                    },
                }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell>Группа услуг</TableCell>
                        <TableCell>Услуга</TableCell>
                        <TableCell>Тип материала</TableCell>
                        <TableCell>Материал</TableCell>
                        <TableCell align="center" width={60}>
                            ед. изм
                        </TableCell>
                        <TableCell align="right" width={80}>
                            Кол-во
                        </TableCell>
                        <TableCell align="right" width={80}>
                            Коэффициент
                        </TableCell>
                        <TableCell align="center" width={70}>
                            Валюта
                        </TableCell>
                        <TableCell align="right" width={80}>
                            Цена
                        </TableCell>
                        <TableCell>Примечание</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {items?.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                {item.service_type != null
                                    ? refs.serviceTypes.lookup(item.service_type)
                                    : '—'}
                            </TableCell>
                            <TableCell>
                                {item.service_id != null
                                    ? refs.services.lookup(item.service_id)
                                    : '—'}
                            </TableCell>
                            <TableCell>
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
                                {item.currency != null
                                    ? refs.currencies.lookup(item.currency)
                                    : '—'}
                            </TableCell>
                            <TableCell align="right">{item.price || 0}</TableCell>
                            <TableCell>{item.comment}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
}
