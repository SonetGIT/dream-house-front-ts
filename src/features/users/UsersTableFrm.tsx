import { LinearProgress, IconButton } from '@mui/material';
import { RiFileExcel2Fill, RiDeleteBin2Fill } from 'react-icons/ri';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { BiReset } from 'react-icons/bi';
import { CiEdit } from 'react-icons/ci';

import type { Users } from './userSlice';
import type { Pagination } from '../projects/projectsSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

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
export default function UsersTableFrm(props: PropsType) {
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
                        <th>Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {props.items.length > 0 ? (
                        props.items.map((item) => (
                            <tr key={item.id}>
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
                                            size={15}
                                            color="#66a7da"
                                            onClick={() => props.onEdit(item.id)}
                                        />
                                    </StyledTooltip>

                                    <StyledTooltip title="Удалить">
                                        <RiDeleteBin2Fill
                                            size={15}
                                            color="#c96161"
                                            onClick={() => props.onDelete(item.id)}
                                        />
                                    </StyledTooltip>
                                    <StyledTooltip title="Сброс пароля">
                                        <BiReset
                                            size={15}
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
            <div className="table-footer-container">
                <div className="pagination">
                    <StyledTooltip title="Предыдущая страница">
                        <span>
                            <IconButton
                                size="small"
                                className="table-page-button"
                                onClick={props.onPrevPage}
                                disabled={!props.pagination?.hasPrev}
                            >
                                <MdSkipPrevious />
                            </IconButton>
                        </span>
                    </StyledTooltip>

                    <span className="page-text">стр. {props.pagination?.page}</span>
                    <span className="page-text"> из {props.pagination?.pages}</span>

                    <StyledTooltip title="Следующая страница">
                        <span>
                            <IconButton
                                size="small"
                                className="table-page-button"
                                onClick={props.onNextPage}
                                disabled={!props.pagination?.hasNext}
                            >
                                <MdSkipNext />
                            </IconButton>
                        </span>
                    </StyledTooltip>

                    <span className="page-count">
                        Кол-во:{' '}
                        {props.pagination && props.pagination.total !== null
                            ? props.pagination.total
                            : 0}
                    </span>

                    {!props.loading && (
                        <RiFileExcel2Fill className="table-excelabtn" title="Excel" />
                    )}
                </div>
            </div>
        </div>
    );
}
