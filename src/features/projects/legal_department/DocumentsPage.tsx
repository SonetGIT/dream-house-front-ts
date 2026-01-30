import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchDocumentStages } from './documentStagesSlice';
import { Box, CircularProgress, Typography } from '@mui/material';
import { DocumentStagesTable } from './DocumentStagesTable';

/*******************************************************************************************************************************************************************/
export default function DocumentsPage() {
    const dispatch = useAppDispatch();
    const { data, pagination, loading, error } = useAppSelector((state) => state.documentStages);

    useEffect(() => {
        dispatch(fetchDocumentStages());
    }, [dispatch]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    /********************************************************************************************************************************************/
    return (
        <div>
            <DocumentStagesTable items={data} pagination={pagination} />
        </div>
    );
}
