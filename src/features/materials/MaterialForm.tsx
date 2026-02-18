import { useEffect, useState } from 'react';
import { Box, TextField } from '@mui/material';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { useReference } from '@/features/reference/useReference';
import type { Material, MaterialFormData } from './materialsSlice';

interface Props {
    initialData: Material | null;
    onChange: (data: MaterialFormData) => void;
}

export function MaterialForm({ initialData, onChange }: Props) {
    const materialTypes = useReference('materialTypes');
    const units = useReference('unitsOfMeasure');

    const [formData, setFormData] = useState<MaterialFormData>({
        name: '',
        type: '',
        unit_of_measure: '',
        coefficient: '',
        description: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                type: initialData.type,
                unit_of_measure: initialData.unit_of_measure,
                coefficient: initialData.coefficient || '',
                description: initialData.description || '',
            });
        }
    }, [initialData]);

    useEffect(() => {
        onChange(formData);
    }, [formData]);

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <TextField
                label="Название"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                size="small"
            />

            <ReferenceSelect
                label="Тип"
                value={formData.type}
                onChange={(v) =>
                    setFormData({
                        ...formData,
                        type: v === '' ? '' : Number(v),
                    })
                }
                options={materialTypes.data ?? []}
            />

            <ReferenceSelect
                label="Единица измерения"
                value={formData.unit_of_measure}
                onChange={(v) =>
                    setFormData({
                        ...formData,
                        unit_of_measure: v === '' ? '' : Number(v),
                    })
                }
                options={units.data ?? []}
            />
            <TextField
                label="Коэффициент"
                value={formData.coefficient}
                onChange={(e) => {
                    const value = e.target.value.replace(',', '.');

                    // Разрешаем только цифры и одну точку
                    if (/^\d*\.?\d*$/.test(value)) {
                        setFormData({
                            ...formData,
                            coefficient: value,
                        });
                    }
                }}
                size="small"
            />

            <TextField
                label="Описание"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        description: e.target.value,
                    })
                }
                size="small"
            />
        </Box>
    );
}
