import { Box, Paper, Typography, TextField, Button, Stack, Divider } from '@mui/material';
import { DocumentFilesList } from './DocumentFilesList';
import type { Documents } from './documentsSlice';

type Props = {
    document: Documents;
    onSubmit?: (data: Partial<Documents>) => void;
};

export function DocumentEditForm({ document, onSubmit }: Props) {
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
                Редактирование документа
            </Typography>

            <Box
                component="form"
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    onSubmit?.({
                        name: String(formData.get('name')),
                        description: String(formData.get('description')),
                        price: Number(formData.get('price')),
                    });
                }}
            >
                <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            name="name"
                            label="Название"
                            defaultValue={document.name}
                            fullWidth
                        />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            name="price"
                            label="Цена"
                            type="number"
                            defaultValue={document.price}
                            fullWidth
                        />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            name="description"
                            label="Описание"
                            defaultValue={document.description}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Stack>
                </Stack>

                <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                    <Button variant="contained" type="submit">
                        Сохранить
                    </Button>
                </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" mb={1}>
                Файлы документа
            </Typography>

            <DocumentFilesList documentId={document.id} />
        </Paper>
    );
}
