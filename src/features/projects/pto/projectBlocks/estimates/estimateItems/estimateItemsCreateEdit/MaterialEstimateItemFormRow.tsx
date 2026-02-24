import {
    TableRow,
    TableCell,
    IconButton,
    Typography,
    TextField,
    Box,
    alpha,
    useTheme,
} from '@mui/material';
import { Delete, DragIndicator } from '@mui/icons-material';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { styled } from '@mui/material/styles';
import type { TypeMaterialEstimateItemFormRow } from './useMaterialEstimateItemsForm';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

// ─────────────────────────────────────────────────────
// 🎨 Premium Styled Components
// ─────────────────────────────────────────────────────

const PremiumTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        transform: 'scale(1.002)',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        zIndex: 2,
        position: 'relative',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '16px',
        right: '16px',
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.5)}, transparent)`,
    },
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent !important',
}));

const PremiumCell = styled(TableCell)(({ theme, padding = '8px' }) => ({
    padding: `${padding} !important`,
    borderBottom: 'none',
    '&:first-of-type': {
        paddingLeft: '12px !important',
    },
    '&:last-of-type': {
        paddingRight: '12px !important',
    },
}));

const CompactTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 10,
        fontSize: '0.825rem',
        minHeight: 32,
        '& fieldset': {
            borderColor: alpha(theme.palette.divider, 0.6),
            transition: 'border-color 0.2s',
        },
        '&:hover fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.5),
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
    },
    '& input': {
        padding: '6px 10px',
        '&::placeholder': {
            opacity: 0.5,
            fontSize: '0.8rem',
        },
    },
}));

const PremiumSelect = styled(ReferenceSelect)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 10,
        fontSize: '0.525rem',
        minHeight: 32,
        color: '#ca1818',
        backgroundColor: alpha(theme.palette.background.paper, 0.4),
        '& fieldset': {
            borderColor: alpha(theme.palette.divider, 0.6),
        },
        '&:hover fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.5),
        },
    },
}));

const TotalValue = styled(Typography)(({ theme }) => ({
    fontFamily: 'monospace',
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 700,
    fontSize: '0.9rem',
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
    borderRadius: 8,
    padding: 6,
    transition: 'all 0.2s',
    '&:hover': {
        backgroundColor: alpha(theme.palette.error.main, 0.1),
        transform: 'scale(1.1)',
    },
}));

interface Props {
    row: TypeMaterialEstimateItemFormRow;
    index: number;
    updateField: (
        index: number,
        field: keyof TypeMaterialEstimateItemFormRow,
        value: string | number,
    ) => void;
    removeRow: (index: number) => void;
    rowTotal: (row: TypeMaterialEstimateItemFormRow) => number;
    isEditMode: boolean;
    refs: Record<string, ReferenceResult>;
}

export default function MaterialEstimateItemFormRow({
    row,
    index,
    updateField,
    removeRow,
    rowTotal,
    isEditMode,
    refs,
}: Props) {
    const theme = useTheme();
    // Оптимизированные фильтры с мемоизацией (добавьте useMemo в реальном коде)
    const services =
        row.service_type && refs.services.data
            ? refs.services.data.filter((s) => Number(s.type) === Number(row.service_type))
            : [];

    const materials =
        row.material_type && refs.materials.data
            ? refs.materials.data.filter((m) => Number(m.type) === Number(row.material_type))
            : [];

    const total = rowTotal(row);

    /*********************************************/
    return (
        <PremiumTableRow hover>
            {/* Группа услуг */}
            <PremiumCell>
                <PremiumSelect
                    label=""
                    value={row.service_type}
                    onChange={(v) => {
                        updateField(index, 'service_type', v);
                        updateField(index, 'service_id', '');
                    }}
                    options={refs.serviceTypes.data || []}
                    placeholder="📁 Группа"
                />
            </PremiumCell>

            {/* Услуга */}
            <PremiumCell>
                <ReferenceSelect
                    label=""
                    value={row.service_id}
                    onChange={(v) => updateField(index, 'service_id', v)}
                    options={services}
                    disabled={!row.service_type}
                    placeholder={row.service_type ? '✨ Услуга' : '→ Сначала группа'}
                />
            </PremiumCell>

            {/* Тип материала */}
            <PremiumCell>
                <ReferenceSelect
                    label=""
                    placeholder="🏷️ Тип"
                    value={row.material_type}
                    onChange={(v) => {
                        updateField(index, 'material_type', v);
                        updateField(index, 'material_id', '');
                        updateField(index, 'unit_of_measure', '');
                    }}
                    options={refs.materialTypes.data || []}
                />
            </PremiumCell>

            {/* Материал */}
            <PremiumCell>
                <ReferenceSelect
                    label=""
                    placeholder={row.material_type ? '📦 Материал' : '→ Сначала тип'}
                    value={row.material_id}
                    onChange={(v) => {
                        updateField(index, 'material_id', v);
                        const material = refs.materials.data?.find((m) => m.id === Number(v));
                        updateField(
                            index,
                            'unit_of_measure',
                            String(material?.unit_of_measure ?? ''),
                        );
                    }}
                    options={materials}
                    disabled={!row.material_type}
                />
            </PremiumCell>

            {/* Ед. изм (авто) */}
            <PremiumCell align="center">
                <Box
                    sx={{
                        px: 1.5,
                        py: 0.75,
                        // borderRadius: 6,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                    }}
                >
                    {refs.unitsOfMeasure.data?.find((u) => u.id === Number(row.unit_of_measure))
                        ?.name || '—'}
                </Box>
            </PremiumCell>

            {/* Коэффициент */}
            <PremiumCell>
                <CompactTextField
                    type="number"
                    value={row.coefficient}
                    onChange={(e) => updateField(index, 'coefficient', e.target.value)}
                    inputProps={{ step: '0.01', min: '0', style: { textAlign: 'center' } }}
                    fullWidth
                />
            </PremiumCell>

            {/* Валюта */}
            <PremiumCell>
                <ReferenceSelect
                    label=""
                    value={row.currency}
                    onChange={(v) => updateField(index, 'currency', v)}
                    options={refs.currencies.data || []}
                    placeholder="💱"
                    // sx={{ '& .MuiInputBase-input': { textAlign: 'center', py: 0.75 } }}
                />
            </PremiumCell>

            {/* Цена */}
            <PremiumCell>
                <CompactTextField
                    type="number"
                    value={row.price}
                    onChange={(e) => updateField(index, 'price', e.target.value)}
                    inputProps={{ step: '0.01', min: '0', style: { textAlign: 'right' } }}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <Box
                                component="span"
                                sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}
                            >
                                ₽
                            </Box>
                        ),
                    }}
                />
            </PremiumCell>

            {/* Комментарий */}
            <PremiumCell>
                <CompactTextField
                    value={row.comment}
                    onChange={(e) => updateField(index, 'comment', e.target.value)}
                    placeholder="💬 Заметка"
                    inputProps={{ maxLength: 50 }}
                    fullWidth
                />
            </PremiumCell>

            {/* 💰 Сумма (sticky right) */}
            <PremiumCell
                align="right"
                sx={{
                    // position: 'sticky',
                    right: 40,
                    bgcolor: theme.palette.background.paper,
                    zIndex: 3,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: `linear-gradient(180deg, transparent, ${alpha(theme.palette.divider, 0.8)}, transparent)`,
                    },
                }}
            >
                <TotalValue>
                    {total.toLocaleString('ru-RU', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </TotalValue>
            </PremiumCell>

            {/* 🗑️ Удаление (sticky far right) */}
            {!isEditMode && (
                <PremiumCell
                    width={50}
                    sx={{
                        position: 'sticky',
                        right: 0,
                        bgcolor: theme.palette.background.paper,
                        zIndex: 4,
                        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    }}
                >
                    <StyledTooltip title="Удалить строку">
                        <DeleteButton size="small" onClick={() => removeRow(index)}>
                            <Delete fontSize="small" />
                        </DeleteButton>
                    </StyledTooltip>
                </PremiumCell>
            )}
        </PremiumTableRow>
    );
}
