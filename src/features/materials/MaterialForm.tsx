import { Box, TextField, Typography } from '@mui/material';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { useReference } from '@/features/reference/useReference';
import type { MaterialFormData } from './materialsSlice';

interface Props {
    data: MaterialFormData;
    editing: boolean;
    disabled: boolean;
    onChange: (data: MaterialFormData) => void;
}

export function MaterialForm({ data, editing, disabled, onChange }: Props) {
    const materialTypes = useReference('materialTypes');
    const units = useReference('unitsOfMeasure');
    return (
        <Box display="flex" flexDirection="column" gap={2}
            sx={{ '& > .MuiAutocomplete-root': { minWidth: 0, width: '100%' } }}>
            <TextField autoFocus fullWidth required label="Название материала" placeholder="Название материала" value={data.name} disabled={disabled}
                onChange={(event) => onChange({ ...data, name: event.target.value })} size="small" />
            <ReferenceSelect label="Тип материала" value={data.type} disabled={disabled}
                onChange={(value) => onChange({ ...data, type: value === '' ? '' : Number(value) })}
                options={materialTypes.data ?? []} loading={materialTypes.loading} />
            {materialTypes.error && <Typography color="error">{materialTypes.error}</Typography>}
            <ReferenceSelect label="Ед. изм. *" value={data.unit_of_measure} disabled={disabled}
                onChange={(value) => onChange({ ...data, unit_of_measure: value === '' ? '' : Number(value) })}
                options={units.data ?? []} loading={units.loading} />
            {units.error && <Typography color="error">{units.error}</Typography>}
            <TextField label="Коэффициент" value={data.coefficient} disabled={disabled || editing}
                helperText={editing ? 'Коэффициент задаётся при создании материала' : undefined}
                onChange={(event) => {
                    const value = event.target.value.replace(',', '.');
                    if (/^\d*\.?\d*$/.test(value)) onChange({ ...data, coefficient: value });
                }} size="small" />
            <TextField label="Описание" multiline rows={3} value={data.description} disabled={disabled}
                onChange={(event) => onChange({ ...data, description: event.target.value })} size="small" />
        </Box>
    );
}
