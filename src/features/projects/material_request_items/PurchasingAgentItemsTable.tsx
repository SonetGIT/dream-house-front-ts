import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Paper,
    Box,
    Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchPurchasingAgentItems,
    type MaterialRequestItems,
} from '@/features/projects/material_request_items/materialRequestItemsSlice';

interface Props {
    // onChange?: (items: MaterialRequestItems[]) => void;
    items: MaterialRequestItems[];
    getRefName: {
        materialType: (id: number) => string;
        materialName: (id: number) => string;
        unitName: (id: number) => string;
    };
}

// export default function PurchasingAgentItemsTable({ onChange, getRefName, items }: Props) {
export default function PurchasingAgentItemsTable(props: Props) {
    const dispatch = useAppDispatch();
    // const items = useAppSelector(selectPurchasingAgentItems);
    // const loading = useAppSelector(selectPurchasingAgentLoading);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        dispatch(fetchPurchasingAgentItems({ page: 1, size: 10 }));
    }, [dispatch]);

    // useEffect(() => {
    //     if (onChange) {
    //         const selectedItems = items.filter((i) => selectedIds.includes(i.id));
    //         onChange(selectedItems);
    //     }
    // }, [selectedIds, items, onChange]);

    const isAllSelected = props.items.length > 0 && selectedIds.length === props.items.length;

    const toggleAll = () => {
        setSelectedIds(isAllSelected ? [] : props.items.map((i) => i.id));
    };

    const toggleOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    return (
        <TableContainer
            className="table-container"
            component={Paper}
            // sx={{
            //     border: '1px solid var(--border)',
            //     borderRadius: 'var(--border-radius)',
            //     background: 'var(--bg-surfacePrm)',
            // }}
        >
            <Table size="small" className="table">
                <TableHead>
                    <TableRow sx={{ background: 'var(--bg-header)' }}>
                        <TableCell padding="checkbox">
                            <Checkbox
                                checked={isAllSelected}
                                indeterminate={selectedIds.length > 0 && !isAllSelected}
                                onChange={toggleAll}
                            />
                        </TableCell>
                        {/* <TableCell>ID</TableCell> */}
                        <TableCell>Тип материала</TableCell>
                        <TableCell>Материалы</TableCell>
                        <TableCell>ед.изм.</TableCell>
                        <TableCell>Кол-во</TableCell>
                        <TableCell>Цена</TableCell>
                        <TableCell>Сумма</TableCell>
                        <TableCell>Остаток</TableCell>
                        <TableCell>Комментарий</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {props.items.map((item, idx) => {
                        const checked = selectedIds.includes(item.id);

                        return (
                            <TableRow
                                key={item.id}
                                hover
                                sx={{
                                    '& td': {
                                        textAlign: 'center',
                                    },
                                }}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={checked}
                                        onChange={() => toggleOne(item.id)}
                                    />
                                </TableCell>
                                {/* <TableCell>{item.id}</TableCell> */}
                                <TableCell>
                                    {props.getRefName.materialType(item.material_type)}
                                </TableCell>
                                <TableCell>
                                    {props.getRefName.materialName(item.material_id)}
                                </TableCell>
                                <TableCell>
                                    {props.getRefName.unitName(item.unit_of_measure)}
                                </TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">{item.remaining_quantity}</TableCell>
                                <TableCell>{item.comment ?? '—'}</TableCell>
                            </TableRow>
                        );
                    })}

                    {/* {!loading && items.length === 0 && ( */}
                    {props.items?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8}>
                                <Box textAlign="center" py={3}>
                                    <Typography color="text.secondary" fontSize="0.9rem">
                                        Данные не найдены
                                    </Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
