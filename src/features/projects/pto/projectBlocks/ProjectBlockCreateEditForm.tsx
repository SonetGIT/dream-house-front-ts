import { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import {
    createProjectBlock,
    updateProjectBlock,
    type ProjectBlock,
    type ProjectBlockFormData,
} from './projectBlocksSlice';
import { useAppDispatch } from '@/app/store';

interface Props {
    open: boolean;
    onClose: () => void;
    projectId: number;
    block?: ProjectBlock | null; // если есть → edit
}

export default function ProjectBlockCreateEditForm({ open, onClose, projectId, block }: Props) {
    const dispatch = useAppDispatch();

    const isEdit = Boolean(block);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProjectBlockFormData>();

    /* Заполняем форму при редактировании */
    useEffect(() => {
        if (block) {
            reset({
                name: block.name,
                project_id: block.project_id,
            });
        } else {
            reset({
                name: '',
                project_id: projectId,
            });
        }
    }, [block, projectId, reset]);

    const onSubmit = async (data: ProjectBlockFormData) => {
        if (isEdit && block) {
            await dispatch(
                updateProjectBlock({
                    id: block.id,
                    data,
                }),
            );
        } else {
            await dispatch(
                createProjectBlock({
                    ...data,
                    project_id: projectId,
                }),
            );
        }

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isEdit ? 'Редактировать блок проекта' : 'Создать блок проекта'}
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <TextField
                        label="Название блока"
                        fullWidth
                        margin="normal"
                        {...register('name', {
                            required: 'Введите название блока',
                        })}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    {isEdit ? 'Сохранить' : 'Создать'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
