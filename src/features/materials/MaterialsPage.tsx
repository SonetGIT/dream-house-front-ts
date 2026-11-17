import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    type Material,
    type MaterialFormData,
} from './materialsSlice';
import { Button, Box, CircularProgress, Typography, Tab, Tabs } from '@mui/material';
import { MdOutlinePlaylistAdd, MdOutlineRestartAlt } from 'react-icons/md';
import { MaterialsTableMenu } from './MaterialsTableMenu';
import { MaterialCreateEditDialog } from './MaterialCreateEditDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import InputSearch from '@/components/ui/InputSearch';
import { useReference } from '../reference/useReference';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import MaterialTypesPage from './MaterialTypesPage';
import { fetchEnum } from '../reference/referenceSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { downloadMaterialsExcel } from './downloadMaterialsExcel';

export default function MaterialsPage() {
    const [tab, setTab] = useState('materials');
    return <>
        <Tabs value={tab} onChange={(_, value: string) => setTab(value)}>
            <Tab value="materials" label="Материалы" />
            <Tab value="types" label="Типы материалов" />
        </Tabs>
        {tab === 'materials' ? <MaterialsDirectory /> : <MaterialTypesPage />}
    </>;
}

function MaterialsDirectory() {
    const dispatch = useAppDispatch();
    const { data, pagination, loading, error } = useAppSelector((state) => state.materials);
    const refs = {
        unitsOfMeasure: useReference('unitsOfMeasure'),
        materialTypes: useReference('materialTypes'),
    };

    const [busy, setBusy] = useState(false);
    const [exporting, setExporting] = useState(false);
    const exportInProgress = useRef(false);

    const handleExport = async () => {
        if (exportInProgress.current) return;
        exportInProgress.current = true;
        setExporting(true);
        try {
            await downloadMaterialsExcel();
        } catch {
            toast.error('Не удалось выгрузить материалы в Excel');
        } finally {
            exportInProgress.current = false;
            setExporting(false);
        }
    };
    const [openForm, setOpenForm] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState('');
    const [unitsOfMeasureId, setUnitsOfMeasureId] = useState<string | number | null>(null);

    const [query, setQuery] = useState({
        page: 1,
        size: 10,
        name: '',
        type: undefined as number | undefined,
        unit_of_measure: undefined as number | undefined,
    });

    useEffect(() => {
        dispatch(fetchMaterials(query));
    }, [dispatch, query]);

    const handleSearch = () => {
        setQuery((current) => ({ ...current, page: 1, name: searchText.trim() }));
    };

    const handleUnitChange = (value: string | number | null) => {
        setUnitsOfMeasureId(value);
        setQuery((current) => ({
            ...current,
            page: 1,
            unit_of_measure: value === null || value === '' ? undefined : Number(value),
        }));
    };

    const handleReset = () => {
        setSearchText('');
        setUnitsOfMeasureId(null);
        setQuery((current) => ({ ...current, page: 1, name: '', type: undefined, unit_of_measure: undefined }));
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

    const handleSubmit = async (formData: MaterialFormData) => {
        if (busy) return;
        setBusy(true);
        try {
            if (editingMaterial) {
                await dispatch(updateMaterial({ id: editingMaterial.id, data: formData })).unwrap();
            } else {
                await dispatch(createMaterial(formData)).unwrap();
            }
            setOpenForm(false);
            void dispatch(fetchMaterials(query));
            void dispatch(fetchEnum('materials'));
            toast.success(editingMaterial ? 'Материал успешно обновлён' : 'Материал успешно создан');
        } catch (reason: unknown) {
            toast.error(typeof reason === 'string' ? reason : reason instanceof Error ? reason.message : 'Ошибка сохранения');
        } finally {
            setBusy(false);
        }
    };

    /* DELETE */
    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = () => {
        if (!deleteId || busy) return;
        setBusy(true);

        dispatch(deleteMaterial(deleteId))
            .unwrap()
            .then(() => {
                if (data.length === 1 && query.page > 1) {
                    setQuery((current) => ({ ...current, page: current.page - 1 }));
                } else {
                    dispatch(fetchMaterials(query));
                }

                setDeleteId(null);
                void dispatch(fetchEnum('materials'));
                toast.success('Материал удалён');
            })
            .catch((err: string) => {
                toast.error(err || 'Ошибка удаления');
            }).finally(() => setBusy(false));
    };

    const handlePageChange = (page: number) => {
        if (loading) return;
        setQuery((current) => ({ ...current, page }));
    };

    const handleSizeChange = (size: number) => {
        if (loading) return;
        setQuery((current) => ({ ...current, page: 1, size }));
    };

    /************************************************************************************************************/
    return (
        <>
            {/* FILTER BAR */}
            <div className="filter-container">
                <Box className="filter-search" sx={{ flexWrap: 'wrap', gap: 1, '& > *': { maxWidth: '100%' } }}>
                    <InputSearch
                        placeholder="Название материала"
                        value={searchText}
                        onChange={setSearchText}
                        onEnter={handleSearch}
                    />

                    <ReferenceSelect
                        label="Тип материала" value={query.type ?? ''}
                        options={refs.materialTypes.data ?? []} loading={refs.materialTypes.loading}
                        onChange={(value) => setQuery((current) => ({
                            ...current, page: 1, type: value === '' ? undefined : Number(value),
                        }))}
                    />

                    <ReferenceSelect
                        label="Единица измерения"
                        value={unitsOfMeasureId || ''}
                        onChange={handleUnitChange}
                        options={refs.unitsOfMeasure.data || []}
                        loading={refs.unitsOfMeasure.loading}
                    />

                    <Button variant="outlined" onClick={handleSearch}>Найти</Button>
                    <div className="icon">
                        <StyledTooltip title="Сбросить фильтры и поиск">
                            <MdOutlineRestartAlt onClick={handleReset} />
                        </StyledTooltip>
                    </div>
                </Box>

                <div className="filter-actions">
                    <Button
                        variant="outlined"
                        startIcon={<MdOutlinePlaylistAdd />}
                        onClick={handleCreate}
                    >
                        Создать
                    </Button>
                    <Button variant="outlined" disabled={exporting} onClick={handleExport}>
                        Excel
                    </Button>
                </div>
            </div>

            {loading && (
                <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                </Box>
            )}
            {error && <Typography color="error" sx={{ p: 3 }}>{error}</Typography>}

            {/* TABLE */}
            <MaterialsTableMenu
                data={error ? [] : data}
                refs={refs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                pagination={pagination}
                onPageChange={handlePageChange}
                onSizeChange={handleSizeChange}
            />

            {/* DIALOG */}
            {openForm && <MaterialCreateEditDialog
                busy={busy}
                material={editingMaterial}
                onClose={() => setOpenForm(false)}
                onSubmit={handleSubmit}
            />}

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                open={Boolean(deleteId)}
                loading={busy}
                title="Удалить материал?"
                message="Вы уверены, что хотите удалить материал?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}
