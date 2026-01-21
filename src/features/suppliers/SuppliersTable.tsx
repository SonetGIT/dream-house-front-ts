import { TablePagination } from '@/components/ui/TablePagination';
import type { Suppliers } from './SuppliersSlice';
import type { Pagination } from '../users/userSlice';
import { LinearProgress } from '@mui/material';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { CiEdit } from 'react-icons/ci';
import { RiDeleteBin2Fill } from 'react-icons/ri';

interface SuppliersPtopsType {
    data: Suppliers[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    // onEdit: (id: number) => void;
    // onDelete: (id: number) => void;
    onPrevPage: () => void;
    onNextPage: () => void;
}
export default function SuppliersTable(props: SuppliersPtopsType) {
    return (
        <div className="table-container">
            {props.loading && (
                <LinearProgress
                    style={{
                        width: '100%',
                        height: '2px',
                    }}
                />
            )}

            <table className="table">
                <thead>
                    <tr>
                        <th>Поставщик</th>
                        <th>ИНН</th>
                        <th>КПП</th>
                        <th>ОГРН</th>
                        <th>Адрес</th>
                        <th>Телефон</th>
                        <th>email</th>
                        <th>Контактное лицо</th>
                        <th>Рейтинг</th>
                        <th>Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {props.data.length > 0 ? (
                        props.data.map((item) => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.inn}</td>
                                <td>{item.kpp}</td>
                                <td>{item.ogrn}</td>
                                <td>{item.address}</td>
                                <td>{item.phone}</td>
                                <td>{item.email}</td>
                                <td>{item.contact_person}</td>
                                <td>{item.rating}</td>
                                <td className="action-container">
                                    <StyledTooltip title="Редактировать">
                                        <CiEdit
                                            size={15}
                                            color="#66a7da"
                                            // onClick={() => props.onEdit(item.id)}
                                        />
                                    </StyledTooltip>

                                    <StyledTooltip title="Удалить">
                                        <RiDeleteBin2Fill
                                            size={15}
                                            color="#c96161"
                                            // onClick={() => props.onDelete(item.id)}
                                        />
                                    </StyledTooltip>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: 'red' }}>
                                Ничего не найдено
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/*Пагинация******************************************************************************************************************************/}
            <TablePagination
                pagination={props.pagination}
                onPrev={props.onPrevPage}
                onNext={props.onNextPage}
            />
        </div>
    );
}
