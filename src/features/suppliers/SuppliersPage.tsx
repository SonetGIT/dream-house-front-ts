import { useEffect, useState } from 'react';
import SuppliersTable from './SuppliersTable';
import { createSupplier, fetchSuppliers, updateSupplier, type Suppliers } from './SuppliersSlice';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { MdGroupAdd } from 'react-icons/md';
import InputSearch from '@/components/ui/InputSearch';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SupplierCreateEditForm, { type Supplier } from './SupplierCreateEditForm';

export default function SuppliersPage() {
    const dispatch = useAppDispatch();
    const suppliersState = useAppSelector((state) => state.suppliers);

    //Локальные состояния
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();

    useEffect(() => {
        dispatch(fetchSuppliers({ page: 1, size: 10 }));
    }, [dispatch]);

    //Поиск
    const handleSearch = (text: string) => {
        setSearchText(text);
        dispatch(fetchSuppliers({ page: 1, size: 10, search: text }));
    };

    const handleAdd = () => {
        setEditingSupplier(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (supplier: Suppliers) => {
        setEditingSupplier(supplier);
        setIsFormOpen(true);
    };

    const handleSubmit = (data: any) => {
        if (editingSupplier?.id) {
            dispatch(updateSupplier({ id: editingSupplier.id, data }));
        } else {
            dispatch(createSupplier(data));
        }
        setModalOpen(false);
    };

    const handleConfirm = () => {
        console.log('handleConfirm');
    };

    //Пагинация
    const handleNextPage = () => {
        if (!suppliersState.pagination?.hasNext) return;
        dispatch(
            fetchSuppliers({
                page: suppliersState.pagination.page + 1,
                size: suppliersState.pagination.size,
                search: searchText,
            })
        );
    };

    const handlePrevPage = () => {
        if (!suppliersState.pagination?.hasPrev) return;
        dispatch(
            fetchSuppliers({
                page: suppliersState.pagination.page - 1,
                size: suppliersState.pagination.size,
                search: searchText,
            })
        );
    };

    /********************************************************************************************************************/
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
                        onPrevPage={handlePrevPage}
                        onNextPage={handleNextPage}
                        loading={suppliersState.loading}
                        error={suppliersState.error}
                    />
                </div>
            )}
            {isFormOpen && (
                <SupplierCreateEditForm
                    supplier={editingSupplier || undefined}
                    onSubmit={handleSubmit}
                    onCancel={() => {}}
                    //     userRoles={userRoles || []}
                />
            )}
            {/* Диалог подтверждения */}
            {/* <ConfirmDialog
                open={confirmOpen}
                title={
                    confirmAction === 'delete'
                        ? 'Удалить поставщика?'
                        : 'Подтверждаем редактирование поставщика?'
                }
                message={
                    confirmAction === 'delete'
                        ? 'Вы уверены, что хотите удалить этого поставщика?'
                        : 'Данные поставщика будет изменены. Продолжить?'
                }
                onConfirm={handleConfirm}
                onCancel={() => {
                    setConfirmOpen(false);
                    setConfirmAction(null);
                }}
            /> */}
        </>
    );
}
