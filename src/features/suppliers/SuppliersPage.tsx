import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { TablePagination } from '@/components/ui/TablePagination';
import SuppliersTable from './SuppliersTable';
import SupplierFiltersPanel from './SuppliersFiltersPanel';
import SupplierForm from './SuppliersForm';
import { ConfirmDialogNew } from '@/components/ui/ConfirmDialogNew';
import {
    createSupplier,
    deleteSupplier,
    fetchSuppliers,
    updateSupplier,
    type Supplier,
    type SupplierFormData,
} from './suppliersSlice';
import SupplierRatingForm from './supplierRating/SupplierRatingForm';
import {
    createSupplierRating,
    type SupplierRatingFormData,
} from './supplierRating/supplierRatingSlice';
import Modal from '@/components/ui/Modal';

/*******************************************************************************************************************/
export default function SuppliersPage() {
    const dispatch = useAppDispatch();
    const { items, pagination, loading } = useAppSelector((state) => state.suppliers);

    const [filters, setFilters] = useState({ search: '' });

    const [currentPage, setCurrentPage] = useState(1);

    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | 'rating' | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const [formLoading, setFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    //Первичная загрузка
    useEffect(() => {
        dispatch(
            fetchSuppliers({
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
            fetchSuppliers({
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
            fetchSuppliers({
                page: 1,
                size: pagination?.size ?? 10,
            }),
        );
    };

    //CRUD
    const handleCreate = () => {
        setSelectedSupplier(null);
        setModal('create');
    };

    const handleRating = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setModal('rating');
    };

    const handleEdit = (suppliers: Supplier) => {
        setSelectedSupplier(suppliers);
        setModal('edit');
    };

    const handleDelete = (suppliers: Supplier) => {
        setSelectedSupplier(suppliers);
        setModal('delete');
    };

    const handleCreateSupplier = async (data: SupplierFormData) => {
        try {
            setFormLoading(true);

            await dispatch(createSupplier(data)).unwrap();

            toast.success(`Поставщик успешно создан: ${data.name}`);

            dispatch(
                fetchSuppliers({
                    page: pagination?.page ?? 1,
                    size: pagination?.size ?? 10,
                    ...filters,
                }),
            );

            setModal(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка создания поставщика');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateSupplier = async (data: SupplierFormData) => {
        if (!selectedSupplier) return;

        try {
            setFormLoading(true);

            await dispatch(
                updateSupplier({
                    id: selectedSupplier.id,
                    data,
                }),
            ).unwrap();

            toast.success(`Поставщик успешно  обновлён: ${data.name}`);

            dispatch(
                fetchSuppliers({
                    page: pagination?.page ?? 1,
                    size: pagination?.size ?? 10,
                    ...filters,
                }),
            );

            setModal(null);
            setSelectedSupplier(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка обновления поставщика');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteSupplier = async () => {
        if (!selectedSupplier) return;

        try {
            setDeleteLoading(true);

            await dispatch(deleteSupplier(selectedSupplier.id)).unwrap();

            toast.success(`Поставщик успешно удалён: ${selectedSupplier.name}`);

            dispatch(
                fetchSuppliers({
                    page: pagination?.page ?? 1,
                    size: pagination?.size ?? 10,
                    ...filters,
                }),
            );

            setModal(null);
            setSelectedSupplier(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка удаления поставщика');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleRatingSupplier = async (data: SupplierRatingFormData) => {
        if (!selectedSupplier) return;

        try {
            setFormLoading(true);

            await dispatch(
                createSupplierRating({
                    ...data,
                    supplier_id: selectedSupplier.id,
                }),
            ).unwrap();

            toast.success(`Рейтинг для ${selectedSupplier.name} добавлен`);

            dispatch(
                fetchSuppliers({
                    page: pagination?.page ?? 1,
                    size: pagination?.size ?? 10,
                    ...filters,
                }),
            );

            setModal(null);
            setSelectedSupplier(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка создания рейтинга');
        } finally {
            setFormLoading(false);
        }
    };

    /*******************************************************************************************************************/
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            <div className="mx-auto max-w-[1800px] px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-bold text-sky-800">Поставщики</h1>
                    <p className="text-sm text-sky-700">Панель управления по поставщикам</p>
                </div>

                {/* Фильтры */}
                <SupplierFiltersPanel
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onCreate={handleCreate}
                />

                {/* Таблица */}
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                    <SuppliersTable
                        suppliers={items}
                        loading={loading}
                        onRating={handleRating}
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
                                    fetchSuppliers({
                                        page: newPage,
                                        size: pagination.size,
                                        ...filters,
                                    }),
                                );
                            }}
                            onSizeChange={(newSize) => {
                                setCurrentPage(1);

                                dispatch(
                                    fetchSuppliers({
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
                <SupplierForm
                    onSubmit={handleCreateSupplier}
                    onCancel={() => setModal(null)}
                    loading={formLoading}
                />
            </Modal>

            {/* RATING */}
            <Modal
                isOpen={modal === 'rating'}
                onClose={() => setModal(null)}
                title="Оставить отзыв"
            >
                <SupplierRatingForm
                    supplier={selectedSupplier}
                    onSubmit={handleRatingSupplier}
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
                <SupplierForm
                    supplier={selectedSupplier}
                    onSubmit={handleUpdateSupplier}
                    onCancel={() => setModal(null)}
                    loading={formLoading}
                />
            </Modal>

            {/* DELETE */}
            <ConfirmDialogNew
                isOpen={modal === 'delete'}
                onClose={() => setModal(null)}
                onConfirm={handleDeleteSupplier}
                title="Удалить подрядчика?"
                message={`Вы уверены, что хотите удалить подрядчика "${selectedSupplier?.name}" (${selectedSupplier?.inn})?`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
}
