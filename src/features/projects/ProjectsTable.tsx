import { LinearProgress } from '@mui/material';
import type { Project } from './projectsSlice';
import { useNavigate } from 'react-router-dom';
import { MdAdsClick, MdDelete, MdEdit } from 'react-icons/md';
import type { Pagination } from '../users/userSlice';
import { TablePagination } from '@/components/ui/TablePagination';
import type { ReferenceResult } from '../reference/referenceSlice';
import { TableRowActions } from '@/components/ui/TableRowActions';

interface PropsType {
    items: Project[];
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
    onPrevPage: () => void;
    onNextPage: () => void;
    onEdit: (project: Project) => void;
    onDelete: (id: number) => void;
    refs: Record<string, ReferenceResult>;
}

/*******************************************************************************************************************************/
export default function ProjectsTable(props: PropsType) {
    const navigate = useNavigate();
    const handleRowClick = (project: Project) => {
        navigate(`/projects/${project.id}`, { state: { project } });
    };

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
                        <th>Наименование проекта</th>
                        <th>Код</th>
                        <th>Тип</th>
                        <th>Статус</th>
                        <th>Адрес</th>
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
                                onClick={() => handleRowClick(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{item.name}</td>
                                <td>{item.code}</td>
                                <td>{props.refs.projectTypes.lookup(item.type)}</td>
                                <td>{props.refs.projectStatuses.lookup(item.status)}</td>
                                <td>{item.address}</td>
                                <td className="action-container">
                                    {' '}
                                    <TableRowActions
                                        actions={[
                                            {
                                                key: 'edit',
                                                label: 'Редактировать',
                                                icon: <MdEdit size={18} />,
                                                onClick: () => props.onEdit(item),
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
