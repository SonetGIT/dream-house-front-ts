import { useAppDispatch } from '@/app/store';
import { createProject, updateProject, type Project } from './projectsSlice';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { ProjectForm } from './ProjectForm';

interface Props {
    open: boolean;
    project: Project | null;
    onClose: () => void;
}

export function ProjectCreateEditDialog({ open, project, onClose }: Props) {
    const dispatch = useAppDispatch();

    const handleSubmit = async (data: any) => {
        if (project) {
            await dispatch(updateProject({ id: project.id, data }));
        } else {
            await dispatch(createProject(data));
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{project ? 'Редактировать проект' : 'Создать проект'}</DialogTitle>

            <DialogContent dividers>
                <ProjectForm initialData={project} onSubmit={handleSubmit} />
            </DialogContent>
        </Dialog>
    );
}
