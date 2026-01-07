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
    oldPassword: string;
    newPassword: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onClose: () => void;
}

export default function ChangePasswordModal({
    open,
    oldPassword,
    newPassword,
    onChange,
    onSave,
    onClose,
}: PropsType) {
    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                // Запрещаем закрытие по клику на фон
                if (reason !== 'backdropClick') onClose();
            }}
        >
            <DialogTitle>Смена пароля</DialogTitle>

            <DialogContent>
                <TextField
                    id="oldPassword"
                    label="Старый пароль"
                    type="password"
                    value={oldPassword}
                    onChange={onChange}
                    fullWidth
                    margin="dense"
                    autoFocus
                />
                <TextField
                    id="newPassword"
                    label="Новый пароль"
                    type="password"
                    value={newPassword}
                    onChange={onChange}
                    fullWidth
                    margin="dense"
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button variant="contained" onClick={onSave}>
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
}
