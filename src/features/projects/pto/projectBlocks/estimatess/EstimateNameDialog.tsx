import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useAppDispatch } from '@/app/store';
import { useAsyncActionLock } from '@/utils/useAsyncActionLock';
import { updateEstimate } from './estimatesSlice';
import type { Estimate } from './estimatesSlice';
import toast from 'react-hot-toast';

interface Props {
    estimate: Estimate;
    onClose: () => void;
}

export default function EstimateNameDialog({ estimate, onClose }: Props) {
    const dispatch = useAppDispatch();
    const [name, setName] = useState(estimate.name);
    const [error, setError] = useState<string | null>(null);
    const { pending, run, isLocked } = useAsyncActionLock();

    const save = () => run(async () => {
        if (!name.trim()) {
            setError('Укажите название сметы');
            return;
        }
        setError(null);
        try {
            await dispatch(updateEstimate({ id: estimate.id, data: { name } })).unwrap();
            toast.success('Название сметы обновлено');
            onClose();
        } catch (reason: unknown) {
            setError(typeof reason === 'string' ? reason : 'Не удалось изменить название сметы');
        }
    });

    return (
        <Dialog open fullWidth maxWidth="sm" onClose={() => { if (!isLocked()) onClose(); }}>
            <DialogTitle>Название сметы</DialogTitle>
            <form onSubmit={(event) => { event.preventDefault(); void save(); }}>
                <DialogContent dividers>
                    <TextField autoFocus fullWidth required label="Название" value={name}
                        disabled={pending} size="small" onChange={(event) => setName(event.target.value)} />
                    {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button disabled={pending} onClick={onClose}>Отмена</Button>
                    <Button type="submit" variant="contained" disabled={pending || !name.trim()}>
                        {pending ? 'Сохранение…' : 'Сохранить'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
