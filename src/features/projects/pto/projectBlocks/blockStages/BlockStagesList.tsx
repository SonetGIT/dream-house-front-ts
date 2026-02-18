import { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Button,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchBlockStages, deleteBlockStage } from './blockStagesSlice';

interface Props {
    blockId: number;
}

export default function BlockStagesList({ blockId }: Props) {
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((state) => state.blockStages);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');

    /* FETCH */

    useEffect(() => {
        dispatch(
            fetchBlockStages({
                block_id: blockId,
                page: page + 1,
                size: rowsPerPage,
                search,
            }),
        );
    }, [dispatch, blockId, page, rowsPerPage, search]);

    /* RESET PAGE WHEN BLOCK CHANGES */

    useEffect(() => {
        setPage(0);
    }, [blockId]);

    const handleDelete = (id: number) => {
        if (window.confirm('Удалить этап?')) {
            dispatch(deleteBlockStage(id));
        }
    };

    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                    gap: 2,
                }}
            >
                {/* <TextField
                    size="small"
                    label="Поиск"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                /> */}

                <Button variant="contained" startIcon={<Add />}>
                    Добавить этап
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : data.length === 0 ? (
                <Typography color="text.secondary">Этапы отсутствуют</Typography>
            ) : (
                <>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Название</TableCell>
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {data.map((stage) => (
                                <TableRow key={stage.id} hover>
                                    <TableCell>{stage.name}</TableCell>

                                    <TableCell align="right">
                                        <IconButton size="small">
                                            <Edit fontSize="small" />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(stage.id)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <TablePagination
                        component="div"
                        count={pagination?.total ?? 0}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </>
            )}
        </Paper>
    );
}
