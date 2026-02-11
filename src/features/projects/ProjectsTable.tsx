import { LinearProgress } from '@mui/material';
import type { Project } from './projectsSlice';
import { RiArrowRightUpBoxFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { MdAdsClick } from 'react-icons/md';
import type { Pagination } from '../users/userSlice';
import { TablePagination } from '@/components/ui/TablePagination';
import type { ReferenceResult } from '../reference/referenceSlice';

interface PropsType {
    items: Project[];
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
    onPrevPage: () => void;
    onNextPage: () => void;
    refs: Record<string, ReferenceResult>;
}

/*******************************************************************************************************************************/
export default function ProjectsTable(props: PropsType) {
    const navigate = useNavigate();
    const handleRowClick = (project: Project) => {
        navigate(`/projects/${project.id}`, { state: { project } });
    };

    /*******************************************************************************************************************************/
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
                                    <StyledTooltip title="Открыть">
                                        <RiArrowRightUpBoxFill
                                            size={20}
                                            color="#66a7da"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRowClick(item);
                                            }}
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
