import { LinearProgress } from '@mui/material';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { BiReset } from 'react-icons/bi';
import { CiEdit } from 'react-icons/ci';
import type { Pagination, Users } from './userSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { TablePagination } from '@/components/ui/TablePagination';
import { MdAdsClick } from 'react-icons/md';

interface PropsType {
    items: Users[];
    userRollName: (id: number | string) => string;
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
                                <td>{props.userRollName(item.role_id)}</td>
                                <td className="action-container">
                                    <StyledTooltip title="Редактировать">
                                        <CiEdit
                                            size={20}
                                            color="#2c7ecb"
                                            onClick={() => props.onEdit(item.id)}
                                        />
                                    </StyledTooltip>

                                    <StyledTooltip title="Удалить">
                                        <RiDeleteBin2Fill
                                            size={20}
                                            color="#c96161"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                props.onDelete(item.id);
                                            }}
                                        />
                                    </StyledTooltip>
                                    <StyledTooltip title="Сброс пароля">
                                        <BiReset
                                            size={20}
                                            color="#66a7da"
                                            onClick={() => props.onResetPass(item.id)}
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
