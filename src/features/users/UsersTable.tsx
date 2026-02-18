import { LinearProgress } from '@mui/material';
import type { Pagination, Users } from './userSlice';
import { TablePagination } from '@/components/ui/TablePagination';
import { MdAdsClick, MdDelete, MdEdit } from 'react-icons/md';
import type { ReferenceResult } from '../reference/referenceSlice';
import { TableRowActions } from '@/components/ui/TableRowActions';
import { BiReset } from 'react-icons/bi';

interface PropsType {
    items: Users[];
    refs: Record<string, ReferenceResult>;
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onResetPass: (id: number) => void;
    onPrevPage: () => void;
    onNextPage: () => void;
}

/*******************************************************************************************************************************/
export default function UsersTable(props: PropsType) {
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
                        <th>Пользователь</th>
                        <th>Имя</th>
                        <th>Фамилия</th>
                        <th>Отчество</th>
                        <th>email</th>
                        <th>Телефон</th>
                        <th>Роль</th>
                        <th>
                            <MdAdsClick size={20} style={{ verticalAlign: 'middle' }} />
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {props.items.length > 0 ? (
                        props.items.map((item) => (
                            <tr
                                key={item.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => props.onEdit(item.id)}
                            >
                                <td>{item.username}</td>
                                <td>{item.first_name}</td>
                                <td>{item.last_name}</td>
                                <td>{item.middle_name}</td>
                                <td>{item.email}</td>
                                <td>{item.phone}</td>
                                <td>{props.refs.userRoles.lookup(item.role_id)}</td>
                                <td className="action-container">
                                    <TableRowActions
                                        actions={[
                                            {
                                                key: 'edit',
                                                label: 'Редактировать',
                                                icon: <MdEdit size={18} />,
                                                onClick: () => props.onEdit(item.id),
                                            },
                                            {
                                                key: 'reset',
                                                label: 'Сброс пароля',
                                                icon: <BiReset size={18} />,
                                                onClick: () => props.onResetPass(item.id),
                                            },
                                            {
                                                key: 'delete',
                                                label: 'Удалить',
                                                icon: <MdDelete size={18} />,
                                                onClick: () => props.onDelete(item.id),
                                                color: 'error',
                                            },
                                        ]}
                                    />
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
