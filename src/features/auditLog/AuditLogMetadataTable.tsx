import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Stack,
} from '@mui/material';
import type { FormMetadata } from './AuditLogTimeline';

interface Props {
    formMetadata: FormMetadata;
    oldValues: Record<string, any>;
    newValues: Record<string, any>;
}

export function AuditLogMetadataTable({ formMetadata, oldValues, newValues }: Props) {
    if (!formMetadata) return null;

    const fields = formMetadata.sections.flatMap((s) => s.contents);

    function ValueRenderer({ value }: { value: any }) {
        if (value === null || value === undefined) {
            return <Typography color="text.disabled">—</Typography>;
        }

        if (Array.isArray(value)) {
            return (
                <Stack spacing={0.5}>
                    {value.map((v, i) => (
                        <Typography key={i} variant="body2">
                            {String(v)}
                        </Typography>
                    ))}
                </Stack>
            );
        }

        return <Typography variant="body2">{String(value)}</Typography>;
    }

    return (
        <Paper variant="outlined" sx={{ m: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Поле</TableCell>
                        <TableCell>Было</TableCell>
                        <TableCell>Стало</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {fields.map((field) => {
                        const oldVal = oldValues?.[field.name];
                        const newVal = newValues?.[field.name];
                        const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                        return (
                            <TableRow key={field.name}>
                                <TableCell>
                                    <Typography variant="body2">{field.label}</Typography>
                                </TableCell>

                                <TableCell
                                    sx={{
                                        bgcolor: isChanged ? 'error.light' : undefined,
                                    }}
                                >
                                    <ValueRenderer value={oldVal} />
                                </TableCell>

                                <TableCell
                                    sx={{
                                        bgcolor: isChanged ? 'success.light' : undefined,
                                    }}
                                >
                                    <ValueRenderer value={newVal} />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    );
}
