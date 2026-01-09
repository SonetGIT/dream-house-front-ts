import { Box } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { getProjectById } from './projectsSlice';
import {
    clearMaterialRequests,
    fetchSearchMaterialReq,
} from './material_request/materialRequestsSlice';
import { useReference } from '../reference/useReference';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { CgPlayBackwards } from 'react-icons/cg';
import Dashboard from '@/components/ui/dashboard/Dashboard';

export default function ProjectDashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { id } = useParams<{ id: string }>();
    const { currentProject: project, loading: projectLoading } = useAppSelector(
        (state) => state.projects
    );

    const { lookup: getProjectTypeName } = useReference('0e86b36a-aa48-4993-874f-1ce21cd393d');
    const { lookup: getProjectStatusName } = useReference('231fec20-3f64-4343-8d49-b1d53e71ad4d');

    const getRefName = useMemo(
        () => ({ projectType: getProjectTypeName, projectStatus: getProjectStatusName }),
        [getProjectTypeName, getProjectStatusName]
    );
    const projectId = Number(id);

    useEffect(() => {
        if (!projectId) return;
        if (!project || project.id !== projectId) {
            dispatch(getProjectById(projectId));
        }
    }, [projectId, project, dispatch]);

    useEffect(() => {
        if (!project?.id) return;
        dispatch(clearMaterialRequests());
        dispatch(fetchSearchMaterialReq({ page: 1, size: 10, project_id: project.id }));
    }, [project?.id, dispatch]);

    if (projectLoading) return <div>Загрузка...</div>;
    if (!project) return <div>Проект не найден</div>;

    // Показываем Dashboard только если путь точно "/projects/:id"
    const isIndexRoute = location.pathname === `/projects/${id}`;

    return (
        <Box className="project-details-container" component="main">
            <StyledTooltip title="Назад">
                <CgPlayBackwards className="icon" onClick={() => navigate(-1)} />
            </StyledTooltip>

            <header className="project-header">
                <h1>{project.name}</h1>
                <div className="project-meta">
                    <span>
                        Код: <strong>{project.code}</strong>
                    </span>
                    <span>Тип: {getRefName.projectType(project.type)}</span>
                    <span>Статус: {getRefName.projectStatus(project.status)}</span>
                    <span>Адрес: {project.address}</span>
                </div>
            </header>

            {isIndexRoute ? <Dashboard /> : <Outlet />}
        </Box>
    );
}
