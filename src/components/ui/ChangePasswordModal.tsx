import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';
import type { ChangeEvent } from 'react';

interface PropsType {
    open: boolean;
    newPassword: string;
    repeatPassword: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onClose: () => void;
    loading?: boolean;
}

export default function ChangePasswordModal({
    open,
    newPassword,
    repeatPassword,
    onChange,
    onSave,
    onClose,
    loading = false,
}: PropsType) {
    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (reason !== 'backdropClick') onClose();
            }}
        >
            <DialogTitle>Смена пароля</DialogTitle>

            <DialogContent>
                <TextField
                    id="newPassword"
                    label="Новый пароль"
                    type="password"
                    value={newPassword}
                    onChange={onChange}
                    fullWidth
                    margin="dense"
                    autoFocus
                />
                <TextField
                    id="repeatPassword"
                    label="Повторите пароль"
                    type="password"
                    value={repeatPassword}
                    onChange={onChange}
                    fullWidth
                    margin="dense"
                />
            </DialogContent>

            <DialogActions>
                <Button variant="contained" onClick={onSave} disabled={loading}>
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
}
