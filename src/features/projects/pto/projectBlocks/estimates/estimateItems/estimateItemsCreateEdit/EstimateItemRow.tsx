import {
    TableRow,
    TableCell,
    IconButton,
    Typography,
    TextField,
    Box,
    alpha,
    useTheme,
    FormControl,
    MenuItem,
    Select,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { EstimateItemRowType } from './useMaterialEstimateItemsForm';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

// ─────────────────────────────────────────────
// UI
// ─────────────────────────────────────────────

export const CompactCell = styled(TableCell)({
    whiteSpace: 'nowrap',
});

export const CompactSelect = ({
    value,
    onChange,
    children,
    disabled,
}: {
    value: number | '';
    onChange: (value: number | '') => void;
    children: React.ReactNode;
    disabled?: boolean;
}) => (
    <FormControl size="small" fullWidth disabled={disabled}>
        <Select
            value={value ?? ''}
            onChange={(e: any) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            displayEmpty
            sx={{ fontSize: 13 }}
        >
            {children}
        </Select>
    </FormControl>
);

const CompactTextField = styled(TextField)(({ theme }) => ({
    width: 100,
    '& .MuiOutlinedInput-root': {
        borderRadius: 4,
        fontSize: '0.875rem',
        height: 35,
        '& input': {
            textAlign: 'right',
            padding: '8px 10px',
        },
    },
}));

// ─────────────────────────────────────────────

interface Props {
    row: EstimateItemRowType;
    index: number;
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

export default function EstimateItemRow({
    row,
    index,
    updateField,
    removeRow,
    rowTotal,
    refs,
}: Props) {
    const theme = useTheme();

    const MATERIAL_ID = refs.materialEstimateItemTypes.data?.find((t) => t.name === 'Материал')?.id;

    const SERVICE_ID = refs.materialEstimateItemTypes.data?.find((t) => t.name === 'Услуга')?.id;

    const isMaterial = Number(row.item_type) === Number(MATERIAL_ID);
    const isService = Number(row.item_type) === Number(SERVICE_ID);
    const isTypeSelected = Number(!!row.item_type);

    // derived lists
    const services =
        refs.services.data?.filter((s) => Number(s.id) === Number(row.service_type)) ?? [];
    console.log('services', services);
    const materials =
        refs.materials.data?.filter((m) => Number(m.type) === Number(row.material_type)) ?? [];

    const unitName =
        refs.unitsOfMeasure.data?.find((u) => Number(u.id) === Number(row.unit_of_measure))?.name ??
        '—';

    const total = rowTotal(row);

    return (
        <TableRow hover>
            {/* Тип позиции */}
            <CompactCell>
                <CompactSelect
                    value={row.item_type}
                    onChange={(value) => updateField(index, 'item_type', value)}
                >
                    {refs.materialEstimateItemTypes.data?.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.name}
                        </MenuItem>
                    ))}
                </CompactSelect>
            </CompactCell>

            {/* Группа услуг */}
            <CompactCell>
                <CompactSelect
                    value={row.service_type}
                    disabled={!isService}
                    onChange={(value) => updateField(index, 'service_type', value)}
                >
                    {refs.serviceTypes.data?.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.name}
                        </MenuItem>
                    ))}
                </CompactSelect>
            </CompactCell>

            {/* Услуга */}
            <CompactCell>
                <CompactSelect
                    value={row.service_id}
                    disabled={!isService || !row.service_type}
                    onChange={(value) => updateField(index, 'service_id', value)}
                >
                    {/* <MenuItem value="">
                        <em>Услуга</em>
                    </MenuItem> */}
                    {services.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.name}
                        </MenuItem>
                    ))}
                </CompactSelect>
            </CompactCell>

            {/* Тип материала */}
            <CompactCell>
                <CompactSelect
                    value={row.material_type}
                    disabled={!isMaterial}
                    onChange={(value) => updateField(index, 'material_type', value)}
                >
                    {/* <MenuItem value="">
                        <em>Тип</em>
                    </MenuItem> */}
                    {refs.materialTypes.data?.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.name}
                        </MenuItem>
                    ))}
                </CompactSelect>
            </CompactCell>

            {/* Материал */}
            <CompactCell>
                <CompactSelect
                    value={row.material_id}
                    disabled={!isMaterial || !row.material_type}
                    onChange={(value) => updateField(index, 'material_id', value)}
                >
                    {/* <MenuItem value="">
                        <em>Материал</em>
                    </MenuItem> */}
                    {materials.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.name}
                        </MenuItem>
                    ))}
                </CompactSelect>
            </CompactCell>

            {/* Ед. изм */}
            <CompactCell align="center">
                <Box
                    sx={{
                        px: 1,
                        py: 0.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        fontSize: 12,
                        borderRadius: 1,
                        minWidth: 60,
                        textAlign: 'center',
                        opacity: isMaterial ? 1 : 0.5,
                    }}
                >
                    {unitName || 1}
                </Box>
            </CompactCell>

            {/* Кол-во */}
            <CompactCell>
                <CompactTextField
                    type="number"
                    value={row.quantity}
                    // disabled={!isMaterial}
                    disabled={!isTypeSelected}
                    onChange={(e) =>
                        updateField(
                            index,
                            'quantity',
                            e.target.value === '' ? 0 : Number(e.target.value),
                        )
                    }
                />
            </CompactCell>

            {/* Коэффициент */}
            <CompactCell align="center">
                <Box
                    sx={{
                        px: 1,
                        py: 0.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        fontSize: 12,
                        borderRadius: 1,
                        minWidth: 60,
                        textAlign: 'center',
                        opacity: isMaterial ? 1 : 0.5,
                    }}
                >
                    {row.coefficient || 1}
                </Box>
            </CompactCell>

            {/* Валюта */}
            <CompactCell>
                <CompactSelect
                    value={row.currency}
                    disabled={!isTypeSelected}
                    onChange={(value) => updateField(index, 'currency', value)}
                >
                    {/* <MenuItem value="">
                        <em>Валюта</em>
                    </MenuItem> */}
                    {refs.currencies.data?.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.name}
                        </MenuItem>
                    ))}
                </CompactSelect>
            </CompactCell>

            {/* Цена */}
            <CompactCell>
                <CompactTextField
                    type="number"
                    value={row.price}
                    disabled={!isTypeSelected}
                    onChange={(e) =>
                        updateField(
                            index,
                            'price',
                            e.target.value === '' ? 0 : Number(e.target.value),
                        )
                    }
                />
            </CompactCell>

            {/* Сумма */}
            <CompactCell align="right">
                <Typography fontWeight={600}>
                    {isTypeSelected
                        ? total.toLocaleString('ru-RU', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })
                        : '—'}
                </Typography>
            </CompactCell>

            {/* Примечание */}
            <CompactCell>
                <CompactTextField
                    value={row.comment}
                    disabled={!isTypeSelected}
                    onChange={(e) => updateField(index, 'comment', e.target.value)}
                />
            </CompactCell>

            {/* Удалить */}
            <CompactCell width={40}>
                <StyledTooltip title="Удалить">
                    <IconButton onClick={() => removeRow(index)}>
                        <Delete fontSize="small" />
                    </IconButton>
                </StyledTooltip>
            </CompactCell>
        </TableRow>
    );
}
