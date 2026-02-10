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
import type { FormMetadata } from './AuditLogTable';

interface Props {
    formMetadata: FormMetadata;
    oldValues: Record<string, any>;
    newValues: Record<string, any>;
}

/****************************************************************************************************************************/
export function AuditLogMetadataList({ formMetadata, oldValues, newValues }: Props) {
    if (!formMetadata) return null;

    const fields = formMetadata.sections.flatMap((s) => s.contents);

    const renderValue = (value: any) => {
        if (value === null || value === undefined) {
            return <Typography color="info">—</Typography>;
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
    };

    return (
        <Paper variant="outlined" sx={{ m: 2, overflowX: 'auto' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        {fields.map((field) => (
                            <TableCell key={field.name}>
                                <Typography variant="body2" fontWeight={500}>
                                    {field.label}
                                </Typography>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {/* Строка: Было */}
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2">Было</Typography>
                        </TableCell>

                        {fields.map((field) => {
                            const oldVal = oldValues?.[field.name];
                            const newVal = newValues?.[field.name];
                            const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                            return (
                                <TableCell
                                    key={field.name}
                                    sx={{
                                        bgcolor: isChanged ? 'error.light' : undefined,
                                    }}
                                >
                                    {renderValue(oldVal)}
                                </TableCell>
                            );
                        })}
                    </TableRow>

                    {/* Строка: Стало */}
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2">Стало</Typography>
                        </TableCell>

                        {fields.map((field) => {
                            const oldVal = oldValues?.[field.name];
                            const newVal = newValues?.[field.name];
                            const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                            return (
                                <TableCell
                                    key={field.name}
                                    sx={{
                                        bgcolor: isChanged ? 'success.light' : undefined,
                                    }}
                                >
                                    {renderValue(newVal)}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
}
