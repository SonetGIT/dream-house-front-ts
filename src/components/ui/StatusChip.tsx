import { DOCUMENT_STATUS_COLOR } from '@/features/projects/legal_department/documents/documentStatus';
import { Chip } from '@mui/material';

interface Props {
    label: string;
    status: number;
}

export default function StatusChip({ label, status }: Props) {
    return (
        <Chip
            label={label}
            color={DOCUMENT_STATUS_COLOR[Number(status)] ?? 'default'}
            size="small"
            variant="outlined"
            sx={{
                border: 'none',
                fontWeight: 500,
            }}
        />
    );
}
