import { Breadcrumbs, Typography, Link } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';

export default function PrjBreadcrumbs() {
    const { projectId, blockId } = useParams();

    return (
        <Breadcrumbs
            separator="›"
            aria-label="breadcrumb"
            sx={{
                fontSize: 14,
                color: 'text.secondary',
            }}
        >
            <Link component={RouterLink} to="/projects" underline="hover" color="inherit">
                Проекты
            </Link>

            <Link
                component={RouterLink}
                to={`/projects/${projectId}`}
                underline="hover"
                color="inherit"
            >
                Фламинго
            </Link>

            <Link
                component={RouterLink}
                to={`/projects/${projectId}/blocks/${blockId}`}
                underline="hover"
                color="inherit"
            >
                Блок A
            </Link>

            <Typography color="text.primary">Смета Черн. - Системы Админ</Typography>
        </Breadcrumbs>
    );
}
