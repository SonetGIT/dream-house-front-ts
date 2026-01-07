import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
    return (
        <Dialog
            open={props.open}
            onClose={props.onCancel}
            PaperProps={{
                style: {
                    overflow: 'hidden', // убираем прокрутку
                    borderRadius: 10,
                    height: 120,
                },
            }}
        >
            {props.title && (
                <DialogTitle
                    style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        paddingBottom: 4,
                    }}
                >
                    {props.title}
                </DialogTitle>
            )}
            <DialogContent>
                <DialogContentText>{props.message}</DialogContentText>
            </DialogContent>
            <DialogActions style={{ marginTop: -10 }}>
                <Button
                    onClick={props.onCancel}
                    color="secondary"
                    variant="outlined"
                    size="small"
                    style={{
                        textTransform: 'none',
                        minWidth: 64,
                    }}
                >
                    Нет
                </Button>
                <Button
                    onClick={props.onConfirm}
                    color="success"
                    variant="outlined"
                    size="small"
                    style={{
                        textTransform: 'none',
                        minWidth: 64,
                    }}
                >
                    Да
                </Button>
            </DialogActions>
        </Dialog>
    );
}
