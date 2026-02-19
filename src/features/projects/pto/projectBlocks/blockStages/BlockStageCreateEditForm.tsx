import { useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, Box, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/app/store';
import {
    createBlockStage,
    updateBlockStage,
    type BlockStage,
    type BlockStageFormData,
} from './blockStagesSlice';
import { AppButton } from '@/components/ui/AppButton';

interface Props {
    open: boolean;
    onClose: () => void;
    blockId: number;
    stage?: BlockStage | null;
}

/*************************************************************************************************************/
export default function BlockStageCreateEditForm({ open, onClose, blockId, stage }: Props) {
    const dispatch = useAppDispatch();
    const isEdit = Boolean(stage);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<BlockStageFormData>({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    // Заполнение формы при редактировании
    useEffect(() => {
        if (open) {
            if (stage) {
                reset({
                    name: stage.name,
                    block_id: stage.block_id,
                });
            } else {
                reset({
                    name: '',
                    block_id: blockId,
                });
            }
        }
    }, [open, stage, blockId, reset]);

    const onSubmit = async (data: BlockStageFormData) => {
        try {
            if (isEdit && stage) {
                await dispatch(
                    updateBlockStage({
                        id: stage.id,
                        data,
                    }),
                ).unwrap();
            } else {
                await dispatch(
                    createBlockStage({
                        ...data,
                        block_id: blockId,
                    }),
                ).unwrap();
            }

            onClose();
        } catch (error) {
            // Ошибки обрабатываются в slice, но можно добавить toast здесь
            console.error('Error saving block stage:', error);
        }
    };

    /*************************************************************************************************************/
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: 'background.default',
                    p: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography variant="h6" fontWeight={600} color="text.primary">
                    {isEdit ? 'Редактировать этап' : 'Создать новый этап'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {isEdit
                        ? 'Обновите информацию об этапе строительного блока'
                        : 'Заполните информацию для нового этапа'}
                </Typography>
            </Box>

            {/* Content */}
            <DialogContent sx={{ p: 3 }}>
                <TextField
                    label="Название этапа *"
                    fullWidth
                    placeholder="Введите название этапа..."
                    {...register('name', {
                        required: 'Обязательное поле',
                        minLength: {
                            value: 2,
                            message: 'Минимум 2 символа',
                        },
                        maxLength: {
                            value: 100,
                            message: 'Максимум 100 символов',
                        },
                    })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    size="small"
                    slotProps={{
                        input: {
                            sx: {
                                borderRadius: 1.5,
                                px: 1.5,
                                py: 1,
                            },
                        },
                    }}
                />
            </DialogContent>

            {/* Footer */}
            <DialogActions
                sx={{
                    p: 2.5,
                    bgcolor: 'background.default',
                    justifyContent: 'flex-end',
                    gap: 1.5,
                }}
            >
                <AppButton variantType="secondary" onClick={onClose} sx={{ minWidth: 100 }}>
                    Отмена
                </AppButton>

                <AppButton
                    variantType="primary"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    sx={{ minWidth: 120 }}
                >
                    {isSubmitting ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
                </AppButton>
            </DialogActions>
        </Dialog>
    );
}
