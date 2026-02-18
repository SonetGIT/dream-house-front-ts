import { useEffect, useState } from 'react';
import { DialogActions, TextField, Box } from '@mui/material';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import type { Project } from './projectsSlice';
import { useReference } from '../reference/useReference';
import { AppButton } from '@/components/ui/AppButton';

export interface ProjectFormData {
    name: string;
    code: string;
    type: number | '';
    status: number | '';
    address: string;
}

interface Props {
    initialData: Project | null;
    onSubmit: (data: ProjectFormData) => void;
    submitting?: boolean;
}

export function ProjectForm({ initialData, onSubmit, submitting = false }: Props) {
    const projectTypes = useReference('projectTypes');
    const projectStatuses = useReference('projectStatuses');

    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        code: '',
        type: '',
        status: '',
        address: '',
    });

    // заполнение при edit
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name ?? '',
                code: initialData.code ?? '',
                type: initialData.type ?? '',
                status: initialData.status ?? '',
                address: initialData.address ?? '',
            });
        }
    }, [initialData]);

    const handleChange = <K extends keyof ProjectFormData>(field: K, value: ProjectFormData[K]) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };

    /*********************************************************************************************************************************************/
    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Название проекта"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    fullWidth
                    required
                    size="small"
                />

                <TextField
                    label="Код проекта"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    fullWidth
                    size="small"
                />

                <ReferenceSelect
                    label="Тип проекта"
                    value={formData.type}
                    onChange={(value) => handleChange('type', value === '' ? '' : Number(value))}
                    options={projectTypes.data ?? []}
                    loading={projectTypes.loading}
                    error={!formData.type}
                    helperText={!formData.type ? 'Выберите тип проекта' : undefined}
                />

                <ReferenceSelect
                    label="Статус проекта"
                    value={formData.status}
                    onChange={(value) => handleChange('status', value === '' ? '' : Number(value))}
                    options={projectStatuses.data ?? []}
                    loading={projectStatuses.loading}
                />

                <TextField
                    label="Адрес"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    fullWidth
                    size="small"
                />
            </Box>

            <DialogActions sx={{ mt: 2 }}>
                <AppButton variant="contained" onClick={handleSubmit} disabled={submitting}>
                    Сохранить
                </AppButton>
            </DialogActions>
        </>
    );
}
