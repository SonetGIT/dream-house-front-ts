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
import { useReference } from '../reference/useReference';

interface Props {
    formMetadata: FormMetadata;
    oldValues: Record<string, any>;
    newValues: Record<string, any>;
}

/****************************************************************************************************************************/
export function AuditLogMetadataList({ formMetadata, oldValues, newValues }: Props) {
    const users = useReference('users');

    if (!formMetadata) return null;

    const fields = formMetadata.sections.flatMap((s) => s.contents);

    const renderValue = (fieldName: string, value: any) => {
        if (value === null || value === undefined) {
            return <Typography color="info">—</Typography>;
        }

        //responsible_users - ФИО через запятую
        if (fieldName === 'responsible_users' && Array.isArray(value)) {
            const names = value.map((id) => users.lookup(id)).join(', ');

            return <Typography variant="body2">{names || '—'}</Typography>;
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

    /***********************************************************************************************************************/
    return (
        <Paper variant="outlined" sx={{ m: 1 }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
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
                            <Typography variant="body2" fontWeight={500}>
                                Было:
                            </Typography>
                        </TableCell>

                        {fields.map((field) => {
                            const oldVal = oldValues?.[field.name];
                            const newVal = newValues?.[field.name];
                            const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                            return (
                                <TableCell
                                    key={field.name}
                                    sx={{
                                        bgcolor: isChanged ? '#ef444496' : undefined,
                                    }}
                                >
                                    {renderValue(field.name, oldVal)}
                                </TableCell>
                            );
                        })}
                    </TableRow>

                    {/* Строка: Стало */}
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                                Стало:
                            </Typography>
                        </TableCell>

                        {fields.map((field) => {
                            const oldVal = oldValues?.[field.name];
                            const newVal = newValues?.[field.name];
                            const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                            return (
                                <TableCell
                                    key={field.name}
                                    sx={{
                                        bgcolor: isChanged ? '	#10b981a7 ' : undefined,
                                    }}
                                >
                                    {renderValue(field.name, newVal)}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
}
