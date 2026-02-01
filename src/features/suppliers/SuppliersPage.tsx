import { useEffect, useState } from 'react';
import SuppliersTable from './SuppliersTable';
import { createSupplier, deleteSupplier, fetchSuppliers, updateSupplier } from './suppliersSlice';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { MdGroupAdd } from 'react-icons/md';
import InputSearch from '@/components/ui/InputSearch';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SupplierCreateEditForm, { type Supplier } from './SupplierCreateEditForm';
import toast from 'react-hot-toast';
import type { ConfirmAction } from '../users/UsersPage';

/***********************************************************************************************************/
export default function SuppliersPage() {
    const dispatch = useAppDispatch();
    const suppliersState = useAppSelector((state) => state.suppliers);

    //Локальные состояния
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
    const [searchText, setSearchText] = useState('');
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>();
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchSuppliers({ page: 1, size: 10 }));
    }, [dispatch]);

    //Поиск
    const handleSearch = (text: string) => {
        setSearchText(text);
        dispatch(fetchSuppliers({ page: 1, size: 10, search: text }));
    };

    const handleAdd = () => {
        setEditingSupplier(null);
        setIsFormOpen(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsFormOpen(true);
    };

    //Отмена формы
    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingSupplier(null);
    };

    //Сохранение формы (создание или редактирование)
    const handleSubmit = (formData: any) => {
        if (editingSupplier) {
            dispatch(updateSupplier({ id: editingSupplier.id, data: formData }))
                .unwrap()
                .then(() => {
                    dispatch(fetchSuppliers({ page: 1, size: 10 }));
                    toast.success('Поставщик успешно обновлён');
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при обновлении поставщика');
                });
        } else {
            dispatch(createSupplier(formData))
                .unwrap()
                .then(() => {
                    dispatch(fetchSuppliers({ page: 1, size: 10 }));
                    toast.success('Поставщик успешно создан', {
                        duration: 3000,
                    });
                })
                .catch((err: string) => {
                    console.log('err', err);
                    toast.error(err || 'Ошибка при создании поставщика');
                });
        }
        setIsFormOpen(false);
    };

    //DELETE
    const handleDelete = (id: number) => {
        setSelectedSupplierId(id);
        setConfirmAction('delete');
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        if (!selectedSupplierId || !confirmAction) return;

        if (confirmAction === 'delete') {
            dispatch(deleteSupplier(selectedSupplierId))
                .unwrap()
                .then(() => {
                    dispatch(
                        fetchSuppliers({
                            page: 1,
                            size: 10,
                        }),
                    );
                    toast.success('Поставщик успешно удалён');
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при удалении поставщика');
                });
        }

        setConfirmOpen(false);
        setSelectedSupplierId(null);
        setConfirmAction(null);
    };

    //Пагинация
    const handleNextPage = () => {
        if (!suppliersState.pagination?.hasNext) return;
        dispatch(
            fetchSuppliers({
                page: suppliersState.pagination.page + 1,
                size: suppliersState.pagination.size,
                search: searchText,
            }),
        );
    };

    const handlePrevPage = () => {
        if (!suppliersState.pagination?.hasPrev) return;
        dispatch(
            fetchSuppliers({
                page: suppliersState.pagination.page - 1,
                size: suppliersState.pagination.size,
                search: searchText,
            }),
        );
    };

    /*********************************************************************************************************************************/
    return (
        <>
            {!isFormOpen && (
                <div>
                    <div className="filter-container">
                        <StyledTooltip title="Добавить поставщика">
                            <MdGroupAdd className="icon" onClick={handleAdd} />
                        </StyledTooltip>
                        <InputSearch value={searchText} onChange={handleSearch} />
                    </div>
                    <SuppliersTable
                        data={suppliersState.data}
                        pagination={suppliersState.pagination}
                        loading={suppliersState.loading}
                        error={suppliersState.error}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onPrevPage={handlePrevPage}
                        onNextPage={handleNextPage}
                    />
                </div>
            )}
            {isFormOpen && (
                <SupplierCreateEditForm
                    supplier={editingSupplier || undefined}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    //     userRoles={userRoles || []}
                />
            )}

            {/* Диалог подтверждения */}
            <ConfirmDialog
                open={confirmOpen}
                title={confirmAction === 'delete' ? 'Удалить поставщика?' : ''}
                message={
                    confirmAction === 'delete' ? 'Вы уверены, что хотите удалить поставщика?' : ''
                }
                onConfirm={handleConfirm}
                onCancel={() => {
                    setConfirmOpen(false);
                    setConfirmAction(null);
                }}
            />
        </>
    );
}
