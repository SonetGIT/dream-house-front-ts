import { LinearProgress, IconButton } from '@mui/material';
import type { Project } from './projectsSlice';
import { RiFileExcel2Fill, RiArrowRightUpBoxFill } from 'react-icons/ri';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { Pagination } from '../users/userSlice';

interface PropsType {
    items: Project[];
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
    onPrevPage: () => void;
    onNextPage: () => void;
    getRefName: {
        [key: string]: (id: number | string) => string;
    };
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
                        <th>Действия</th>
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
                                <td>{props.getRefName.type(item.type)}</td>
                                <td>{props.getRefName.status(item.status)}</td>
                                <td>{item.address}</td>
                                <td className="action-container">
                                    <StyledTooltip title="Открыть">
                                        <RiArrowRightUpBoxFill
                                            size={15}
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

                    <span className="page-count">Кол-во: {props.pagination?.total}</span>

                    {!props.loading && (
                        <StyledTooltip title="скачать в Excel">
                            <RiFileExcel2Fill className="table-excelabtn" />
                        </StyledTooltip>
                    )}
                </div>
            </div>
        </div>
    );
}
