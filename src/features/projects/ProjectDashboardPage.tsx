import { Box } from '@mui/material';
import { useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { getProjectById } from './projectsSlice';
import {
    clearMaterialRequests,
    fetchSearchMaterialReq,
} from './material_request/materialRequestsSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { CgPlayBackwards } from 'react-icons/cg';
import Dashboard from '@/components/ui/dashboard/Dashboard';
import { useReferenceMap } from '../reference/useReferenceMap';

export default function ProjectDashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { projectId } = useParams<{ projectId: string }>();

    const { currentProject: project, loading: projectLoading } = useAppSelector(
        (state) => state.projects,
    );
    const refs = useReferenceMap({
        projectTypes: ['name'],
        projectStatuses: ['name'],
    });

    useEffect(() => {
        if (projectId) {
            dispatch(getProjectById(Number(projectId)));
        }
    }, [projectId, dispatch]);

    useEffect(() => {
        if (!project?.id) return;
        dispatch(clearMaterialRequests());
        dispatch(fetchSearchMaterialReq({ page: 1, size: 10, project_id: project.id }));
    }, [project?.id, dispatch]);

    if (projectLoading) return <div>Загрузка...</div>;
    if (!project) return <div>Проект не найден</div>;

    const isIndexRoute = location.pathname === `/projects/${projectId}`;

    return (
        <Box component="main" className="project-details-container">
            {/* BACK BUTTON */}
            <div>
                <StyledTooltip title="Назад">
                    <CgPlayBackwards className="icon" onClick={() => navigate(-1)} />
                </StyledTooltip>
            </div>

            {/* HEADER */}
            <header className="project-header">
                <h1>{project.name}</h1>

                <div className="project-meta">
                    <span>
                        Код: <span className="text-strong">{project.code}</span>
                    </span>

                    <span>
                        Тип: <span className="text-strong">{refs.projectTypes(project.type)}</span>
                    </span>

                    <span>
                        Статус:{' '}
                        <span className="text-strong">{refs.projectStatuses(project.status)}</span>
                    </span>

                    <span>
                        Адрес: <span className="text-strong">{project.address}</span>
                    </span>
                </div>
            </header>

            {/* CONTENT */}
            <section className="dashboard-grid">
                {isIndexRoute ? <Dashboard /> : <Outlet context={{ projectId: project.id }} />}
            </section>
        </Box>
    );
}
