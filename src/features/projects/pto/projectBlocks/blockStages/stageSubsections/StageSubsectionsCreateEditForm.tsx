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
import { useAppDispatch } from '@/app/store';
import {
    createStageSubsection,
    updateStageSubsection,
    type StageSubsection,
    type StageSubsectionFormData,
} from './stageSubsectionsSlice';
import toast from 'react-hot-toast';

interface Props {
    open: boolean;
    onClose: () => void;
    stageId: number;
    subsection?: StageSubsection | null;
}

export default function StageSubsectionsCreateEditForm({
    open,
    onClose,
    stageId,
    subsection,
}: Props) {
    const dispatch = useAppDispatch();
    const isEdit = Boolean(subsection);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<StageSubsectionFormData>();

    /* Заполняем форму при редактировании */
    useEffect(() => {
        if (subsection) {
            reset({
                name: subsection.name,
                stage_id: subsection.stage_id,
            });
        } else {
            reset({
                name: '',
                stage_id: stageId,
            });
        }
    }, [subsection, stageId, reset]);

    const onSubmit = async (data: StageSubsectionFormData) => {
        try {
            if (isEdit && subsection) {
                await dispatch(
                    updateStageSubsection({
                        id: subsection.id,
                        data,
                    }),
                ).unwrap();
                toast.success('Подраздел обновлён');
            } else {
                await dispatch(
                    createStageSubsection({
                        ...data,
                        stage_id: stageId,
                    }),
                ).unwrap();
                toast.success('Подраздел создан');
            }

            onClose();
        } catch (err: any) {
            toast.error(err || 'Ошибка сохранения');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? 'Редактировать подраздел' : 'Создать подраздел'}</DialogTitle>

            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <TextField
                        label="Название подраздела"
                        fullWidth
                        margin="normal"
                        {...register('name', {
                            required: 'Введите название',
                            minLength: {
                                value: 2,
                                message: 'Минимум 2 символа',
                            },
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
