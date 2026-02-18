import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    type Material,
} from './materialsSlice';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import { MdOutlinePlaylistAdd, MdOutlineRestartAlt } from 'react-icons/md';
import { MaterialsTable } from './MaterialsTable';
import { MaterialCreateEditDialog } from './MaterialCreateEditDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import InputSearch from '@/components/ui/InputSearch';
import { useReference } from '../reference/useReference';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

export default function MaterialsPage() {
    const dispatch = useAppDispatch();
    const { data, pagination, loading, error } = useAppSelector((state) => state.materials);
    const refs = { unitsOfMeasure: useReference('unitsOfMeasure') };

    const [openForm, setOpenForm] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState('');
    const [unitsOfMeasureId, setUnitsOfMeasureId] = useState<string | number | null>(null);

    /* INITIAL LOAD */
    useEffect(() => {
        dispatch(fetchMaterials({ page: 1, size: 10 }));
    }, [dispatch]);

    const loadMaterials = (searchParam = searchText, unitParam = unitsOfMeasureId) => {
        dispatch(
            fetchMaterials({
                page: 1,
                size: 10,
                search: searchParam || undefined,
                unit_of_measure: unitParam ? Number(unitParam) : undefined,
            }),
        );
    };

    /* SEARCH */
    const handleSearch = () => {
        loadMaterials(searchText, unitsOfMeasureId);
    };

    useEffect(() => {
        loadMaterials(searchText, unitsOfMeasureId);
    }, [unitsOfMeasureId]);

    /* RESET */
    const handleReset = () => {
        setSearchText('');
        setUnitsOfMeasureId(null);

        loadMaterials('', null);
    };

    /* CREATE / EDIT */
    const handleCreate = () => {
        setEditingMaterial(null);
        setOpenForm(true);
    };

    const handleEdit = (material: Material) => {
        setEditingMaterial(material);
        setOpenForm(true);
    };

    const handleSubmit = (data: any) => {
        if (editingMaterial) {
            dispatch(updateMaterial({ id: editingMaterial.id, data: data }))
                .unwrap()
                .then(() => {
                    dispatch(fetchMaterials({ page: 1, size: 10 }));
                    toast.success('Материал успешно обновлён');
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при обновлении материала');
                });
        } else {
            dispatch(createMaterial(data))
                .unwrap()
                .then(() => {
                    dispatch(fetchMaterials({ page: 1, size: 10 }));
                    toast.success('Материал успешно создан', {
                        duration: 3000,
                    });
                })
                .catch((err: string) => {
                    console.log('err', err);
                    toast.error(err || 'Ошибка при создании материала');
                });
        }
        setOpenForm(false);
    };

    /* DELETE */
    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = () => {
        if (!deleteId) return;

        dispatch(deleteMaterial(deleteId))
            .unwrap()
            .then(() => {
                dispatch(
                    fetchMaterials({
                        page: 1,
                        size: 10,
                        search: searchText,
                        unit_of_measure: unitsOfMeasureId ? Number(unitsOfMeasureId) : undefined,
                    }),
                );

                toast.success('Материал удалён');
            })
            .catch((err: string) => {
                toast.error(err || 'Ошибка удаления');
            });

        setDeleteId(null);
    };

    //Пагинация
    const handleNextPage = () => {
        if (!pagination?.hasNext) return;
        dispatch(
            fetchMaterials({
                page: pagination.page + 1,
                size: pagination.size,
                search: searchText,
            }),
        );
    };

    const handlePrevPage = () => {
        if (!pagination?.hasPrev) return;
        dispatch(
            fetchMaterials({
                page: pagination.page - 1,
                size: pagination.size,
                search: searchText,
            }),
        );
    };

    /* LOADING / ERROR */
    if (loading)
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );

    if (error)
        return (
            <Typography color="error" sx={{ p: 3 }}>
                {error}
            </Typography>
        );

    /************************************************************************************************************/
    return (
        <>
            {/* ===== FILTER BAR ===== */}
            <div className="filter-container">
                <div className="filter-search">
                    <InputSearch
                        value={searchText}
                        onChange={setSearchText}
                        onEnter={handleSearch}
                    />

                    <ReferenceSelect
                        label="Единица измерения"
                        value={unitsOfMeasureId || ''}
                        onChange={setUnitsOfMeasureId}
                        options={refs.unitsOfMeasure.data || []}
                        loading={refs.unitsOfMeasure.loading}
                    />

                    <div className="icon">
                        <StyledTooltip title="Сбросить фильтры и поиск">
                            <MdOutlineRestartAlt onClick={handleReset} />
                        </StyledTooltip>
                    </div>
                </div>

                <div className="filter-actions">
                    <Button
                        variant="outlined"
                        startIcon={<MdOutlinePlaylistAdd />}
                        onClick={handleCreate}
                    >
                        Создать
                    </Button>
                </div>
            </div>

            {/* TABLE */}
            <MaterialsTable
                data={data}
                refs={refs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                pagination={pagination}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
            />

            {/* DIALOG */}
            <MaterialCreateEditDialog
                open={openForm}
                material={editingMaterial}
                onClose={() => setOpenForm(false)}
                onSubmit={handleSubmit}
            />

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                open={Boolean(deleteId)}
                title="Удалить материал?"
                message="Вы уверены, что хотите удалить материал?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}
