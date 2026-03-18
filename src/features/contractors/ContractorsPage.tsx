import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { TablePagination } from '@/components/ui/TablePagination';
import {
    createContractor,
    deleteContractor,
    fetchContractors,
    updateContractor,
    type Contractor,
    type ContractorFormData,
} from './contractorsSlice';
import ContractorsTable from './ContractorsTable';
import ContractorFiltersPanel from './ContractorFiltersPanel';
import ContractorForm from './ContractorForm';
import { ConfirmDialogNew } from '@/components/ui/ConfirmDialogNew';
import Modal from '@/components/ui/Modal';

/*******************************************************************************************************************/
export default function ContractorsPage() {
    const dispatch = useAppDispatch();
    const { items, pagination, loading } = useAppSelector((state) => state.contractors);

    const [filters, setFilters] = useState({ search: '' });

    const [currentPage, setCurrentPage] = useState(1);

    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);

    const [formLoading, setFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    //Первичная загрузка
    useEffect(() => {
        dispatch(
            fetchContractors({
                page: 1,
                size: 10,
            }),
        );
    }, [dispatch]);

    //Поиск
    const handleSearch = (newFilters: typeof filters) => {
        setFilters(newFilters);
        setCurrentPage(1);

        dispatch(
            fetchContractors({
                page: 1,
                size: pagination?.size ?? 10,
                ...newFilters,
            }),
        );
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            typeId: null,
            statusId: null,
            customerId: null,
        };

        setFilters(resetFilters);
        setCurrentPage(1);

        dispatch(
            fetchContractors({
                page: 1,
                size: pagination?.size ?? 10,
            }),
        );
    };

    //CRUD
    const handleCreate = () => {
        setSelectedContractor(null);
        setModal('create');
    };

    const handleEdit = (contractor: Contractor) => {
        setSelectedContractor(contractor);
        setModal('edit');
    };

    const handleDelete = (contractor: Contractor) => {
        setSelectedContractor(contractor);
        setModal('delete');
    };

    const handleCreateContractor = async (data: ContractorFormData) => {
        try {
            setFormLoading(true);

            await dispatch(createContractor(data)).unwrap();

            toast.success(`Подрядчик успешно создан: ${data.name}`);

            dispatch(
                fetchContractors({
                    page: pagination?.page ?? 1,
                    size: pagination?.size ?? 10,
                    ...filters,
                }),
            );

            setModal(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка создания подрядчика');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateContractor = async (data: ContractorFormData) => {
        if (!selectedContractor) return;

        try {
            setFormLoading(true);

            await dispatch(
                updateContractor({
                    id: selectedContractor.id,
                    data,
                }),
            ).unwrap();

            toast.success(`Подрядчик успешно обновлён: ${data.name}`);

            dispatch(
                fetchContractors({
                    page: pagination?.page ?? 1,
                    size: pagination?.size ?? 10,
                    ...filters,
                }),
            );

            setModal(null);
            setSelectedContractor(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка обновления объекта');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteContractor = async () => {
        if (!selectedContractor) return;

        try {
            setDeleteLoading(true);

            await dispatch(deleteContractor(selectedContractor.id)).unwrap();

            toast.success(`Подрядчик успешно удалён: ${selectedContractor.name}`);

            dispatch(
                fetchContractors({
                    page: pagination?.page ?? 1,
                    size: pagination?.size ?? 10,
                    ...filters,
                }),
            );

            setModal(null);
            setSelectedContractor(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка удаления подрядчика');
        } finally {
            setDeleteLoading(false);
        }
    };

    /*******************************************************************************************************************/
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            <div className="mx-auto max-w-[1800px] px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-bold text-sky-800">Подрядчики</h1>
                    <p className="text-sm text-sky-700">Панель управления по подрядчиком</p>
                </div>

                {/* Фильтры */}
                <ContractorFiltersPanel
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onCreate={handleCreate}
                />

                {/* Таблица */}
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                    <ContractorsTable
                        contractors={items}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    {/* Пагинация */}
                    {pagination && (
                        <TablePagination
                            pagination={pagination}
                            onPageChange={(newPage) => {
                                setCurrentPage(newPage);

                                dispatch(
                                    fetchContractors({
                                        page: newPage,
                                        size: pagination.size,
                                        ...filters,
                                    }),
                                );
                            }}
                            onSizeChange={(newSize) => {
                                setCurrentPage(1);

                                dispatch(
                                    fetchContractors({
                                        page: 1,
                                        size: newSize,
                                        ...filters,
                                    }),
                                );
                            }}
                            sizeOptions={[10, 25, 50, 100]}
                            showFirstButton
                            showLastButton
                        />
                    )}
                </div>
            </div>

            {/* CREATE */}
            <Modal
                isOpen={modal === 'create'}
                onClose={() => setModal(null)}
                title="Создать новые данные"
            >
                <ContractorForm
                    onSubmit={handleCreateContractor}
                    onCancel={() => setModal(null)}
                    loading={formLoading}
                />
            </Modal>

            {/* EDIT */}
            <Modal
                isOpen={modal === 'edit'}
                onClose={() => setModal(null)}
                title="Редактировать данные"
            >
                <ContractorForm
                    contractor={selectedContractor}
                    onSubmit={handleUpdateContractor}
                    onCancel={() => setModal(null)}
                    loading={formLoading}
                />
            </Modal>

            {/* DELETE */}
            <ConfirmDialogNew
                isOpen={modal === 'delete'}
                onClose={() => setModal(null)}
                onConfirm={handleDeleteContractor}
                title="Удалить подрядчика?"
                message={`Вы уверены, что хотите удалить подрядчика "${selectedContractor?.name}" (${selectedContractor?.inn})? `}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
}
