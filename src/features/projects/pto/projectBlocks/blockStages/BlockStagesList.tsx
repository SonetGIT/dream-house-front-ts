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
    IconButton,
    Button,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchBlockStages, deleteBlockStage, type BlockStage } from './blockStagesSlice';
import { TablePagination } from '@/components/ui/TablePagination';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import BlockStageCreateEditForm from './BlockStageCreateEditForm';
import { Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import StageSubsectionsList from './stageSubsections/StageSubsectionsList';

interface Props {
    blockId: number;
}

export default function BlockStagesList({ blockId }: Props) {
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((state) => state.blockStages);

    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const size = 10;

    const [openForm, setOpenForm] = useState(false);
    const [editingStage, setEditingStage] = useState<BlockStage | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [expandedStageId, setExpandedStageId] = useState<number | null>(null);

    /* RESET PAGE WHEN BLOCK CHANGES */
    useEffect(() => {
        setPage(1);
    }, [blockId]);

    /* FETCH */
    useEffect(() => {
        dispatch(
            fetchBlockStages({
                block_id: blockId,
                page,
                size,
                search: searchText,
            }),
        );
    }, [dispatch, blockId, page, size, searchText]);

    /* DELETE */
    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = () => {
        if (!deleteId) return;

        dispatch(deleteBlockStage(deleteId))
            .unwrap()
            .then(() => {
                toast.success('Этап удалён');

                dispatch(
                    fetchBlockStages({
                        block_id: blockId,
                        page,
                        size,
                        search: searchText,
                    }),
                );
            })
            .catch((err: string) => {
                toast.error(err || 'Ошибка удаления');
            });

        setDeleteId(null);
    };

    /* PAGINATION */
    const handleNextPage = () => {
        if (!pagination?.hasNext) return;
        setPage((prev) => prev + 1);
    };

    const handlePrevPage = () => {
        if (!pagination?.hasPrev) return;
        setPage((prev) => prev - 1);
    };

    /*******************************************************************************************************************************/
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
                <TextField
                    size="small"
                    label="Поиск"
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setPage(1);
                    }}
                />

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                        setEditingStage(null);
                        setOpenForm(true);
                    }}
                >
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
                            {data.map((stage) => {
                                const isOpen = expandedStageId === stage.id;

                                return (
                                    <>
                                        <TableRow key={stage.id} hover>
                                            <TableCell width={50}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        setExpandedStageId(isOpen ? null : stage.id)
                                                    }
                                                >
                                                    {isOpen ? (
                                                        <KeyboardArrowUpIcon fontSize="small" />
                                                    ) : (
                                                        <KeyboardArrowDownIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </TableCell>

                                            <TableCell>{stage.name}</TableCell>

                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setEditingStage(stage);
                                                        setOpenForm(true);
                                                    }}
                                                >
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

                                        <TableRow>
                                            <TableCell
                                                style={{ paddingBottom: 0, paddingTop: 0 }}
                                                colSpan={3}
                                            >
                                                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                    <Box sx={{ margin: 2 }}>
                                                        <StageSubsectionsList stageId={stage.id} />
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <TablePagination
                        pagination={pagination}
                        onPrev={handlePrevPage}
                        onNext={handleNextPage}
                    />
                </>
            )}

            <BlockStageCreateEditForm
                open={openForm}
                onClose={() => {
                    setOpenForm(false);
                    setEditingStage(null);
                }}
                blockId={blockId}
                stage={editingStage}
            />

            <ConfirmDialog
                open={Boolean(deleteId)}
                title="Удалить этап?"
                message="Вы уверены, что хотите удалить этап?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </Paper>
    );
}
