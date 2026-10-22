import { useEffect, useRef, useState } from 'react';
import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, MenuItem, TextField, Typography,
} from '@mui/material';
import { Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ProjectBlock } from './projectBlocksSlice';
import type { Project } from '@/features/projects/a_project/projectsSlice';
import {
    canCopyBlockStructure, copyBlockStructure, loadCopyStructureProjects, loadProjectBlockOptions,
} from './copyBlockStructure';

interface Props {
    source: ProjectBlock;
    onCopied: () => void;
}

export default function CopyBlockStructureButton({ source, onCopied }: Props) {
    const roleId = useAppSelector((state) => state.auth.user?.role_id);
    const copying = useAppSelector((state) => state.projectBlocks.copying);
    const [open, setOpen] = useState(false);
    if (!canCopyBlockStructure(roleId)) return null;

    return (
        <>
            <StyledTooltip title="Скопировать структуру" describeChild>
                <span style={{ display: 'inline-flex' }}>
                    <Button
                        variant="outlined"
                        disabled={copying}
                        aria-label="Скопировать структуру"
                        sx={{ minWidth: 32, width: 32, height: 32, p: 0 }}
                        onClick={() => setOpen(true)}
                    >
                        <Copy size={16} />
                    </Button>
                </span>
            </StyledTooltip>
            {open && <CopyBlockStructureDialog source={source} onCopied={onCopied}
                onClose={() => setOpen(false)} />}
        </>
    );
}

function CopyBlockStructureDialog({ source, onCopied, onClose }: Props & { onClose: () => void }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const copying = useAppSelector((state) => state.projectBlocks.copying);
    const currentProject = useAppSelector((state) => state.projects.currentProject);
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState<string | null>(null);
    const [projectsAttempt, setProjectsAttempt] = useState(0);
    const [projectTo, setProjectTo] = useState<number | ''>('');
    const [blocks, setBlocks] = useState<ProjectBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [blockTo, setBlockTo] = useState<number | ''>('');
    const [confirming, setConfirming] = useState(false);
    const submitting = useRef(false);
    const mounted = useRef(false);
    const destinationProject = projects.find((project) => project.id === projectTo);
    const destination = blocks.find((block) =>
        block.id === blockTo && block.project_id === projectTo && block.id !== source.id,
    );
    const sourceProjectName = (currentProject?.id === source.project_id ? currentProject.name :
        projects.find((project) => project.id === source.project_id)?.name) ?? `Объект №${source.project_id}`;

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    useEffect(() => {
        let active = true;
        setProjectsLoading(true);
        setProjectsError(null);
        void loadCopyStructureProjects().then((options) => {
            if (active) setProjects(options);
        }).catch((reason: unknown) => {
            if (active) setProjectsError(reason instanceof Error ? reason.message : 'Ошибка загрузки объектов');
        }).finally(() => {
            if (active) setProjectsLoading(false);
        });
        return () => { active = false; };
    }, [projectsAttempt]);

    useEffect(() => {
        if (!projectTo) return;
        let active = true;
        setLoading(true);
        setLoadError(null);
        void loadProjectBlockOptions(projectTo).then((options) => {
            if (active) setBlocks(options.filter((block) => block.id !== source.id));
        }).catch((reason: unknown) => {
            if (active) setLoadError(reason instanceof Error ? reason.message : 'Ошибка загрузки блоков');
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, [source.id, projectTo, attempt]);

    const close = () => {
        if (!copying && !submitting.current) onClose();
    };

    const submit = async () => {
        if (!destinationProject || !destination || !confirming || copying || submitting.current ||
            projectsLoading || loading || projectsError || loadError) return;
        submitting.current = true;
        setError(null);
        try {
            const result = await dispatch(copyBlockStructure({
                blockFrom: source.id, blockTo: destination.id,
            })).unwrap();
            toast.success(`Скопировано: этапов — ${result.stages}, подэтапов — ${result.subsections}, позиций сметы — ${result.items}`, {
                duration: 7000,
            });
            if (!mounted.current) return;
            onClose();
            onCopied();
            navigate(`/projects/${destination.project_id}/prjBlocks/${destination.id}`, { replace: true });
        } catch (reason: unknown) {
            if (mounted.current) setError(typeof reason === 'string' ? reason : 'Ошибка копирования структуры');
        } finally {
            submitting.current = false;
        }
    };

    return (
        <Dialog open onClose={close} disableEscapeKeyDown={copying} fullWidth maxWidth="sm"
            aria-labelledby="copy-structure-title">
            <DialogTitle id="copy-structure-title">
                {confirming ? 'Подтверждение копирования' : 'Копирование структуры'}
            </DialogTitle>
            <DialogContent aria-busy={copying}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {sourceProjectName}: {source.name} → {destinationProject?.name ?? 'Выберите объект'}:
                    {' '}{destination?.name ?? 'Выберите блок'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Будут скопированы этапы, подэтапы и позиции сметы. В блоке назначения
                    не должно быть действующих этапов, а смета должна быть пустым черновиком
                    без подписей и согласований. Если сметы нет, сервер создаст её при копировании позиций.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField select fullWidth label="Объект назначения" value={projectTo}
                        slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
                        disabled={copying || confirming || projectsLoading || !!projectsError || projects.length === 0}
                        helperText={projectsLoading ? 'Загрузка объектов…' : undefined}
                        onChange={(event) => {
                            setProjectTo(Number(event.target.value));
                            setBlockTo('');
                            setBlocks([]);
                            setLoading(true);
                            setLoadError(null);
                            setConfirming(false);
                            setError(null);
                        }}>
                        <MenuItem value="" disabled>Выберите объект</MenuItem>
                        {projects.map((project) => <MenuItem key={project.id} value={project.id}>
                            {project.name} (№{project.id})
                        </MenuItem>)}
                    </TextField>
                    {projectsError && <Alert severity="error" action={
                        <Button color="inherit" onClick={() => setProjectsAttempt((value) => value + 1)}>Повторить</Button>
                    }>{projectsError}</Alert>}
                    {!projectsLoading && !projectsError && projects.length === 0 && (
                        <Alert severity="info">Нет доступных объектов назначения.</Alert>
                    )}
                    <TextField select fullWidth label="Блок объекта" value={blockTo}
                        slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
                        disabled={copying || confirming || !destinationProject || projectsLoading || !!projectsError ||
                            loading || !!loadError || blocks.length === 0}
                        helperText={loading ? 'Загрузка блоков…' : undefined}
                        onChange={(event) => {
                            setBlockTo(Number(event.target.value));
                            setError(null);
                        }}>
                        <MenuItem value="" disabled>Выберите блок</MenuItem>
                        {blocks.map((block) => <MenuItem key={block.id} value={block.id}>
                            {block.name} (№{block.id})
                        </MenuItem>)}
                    </TextField>
                    {loadError && <Alert severity="error" action={
                        <Button color="inherit" onClick={() => setAttempt((value) => value + 1)}>Повторить</Button>
                    }>{loadError}</Alert>}
                    {!!projectTo && !loading && !loadError && blocks.length === 0 && (
                        <Alert severity="info">В выбранном объекте нет доступных блоков для копирования.</Alert>
                    )}
                </Box>
                {confirming && destinationProject && destination && <Alert severity="warning" sx={{ mt: 2 }}>
                    Скопировать структуру и позиции сметы из объекта «{sourceProjectName}» (№{source.project_id}),
                    блока «{source.name}» (№{source.id}) в объект «{destinationProject.name}» (№{destinationProject.id}),
                    блок «{destination.name}» (№{destination.id})?
                </Alert>}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={close} disabled={copying}>Отмена</Button>
                {confirming && <Button disabled={copying} onClick={() => setConfirming(false)}>Назад</Button>}
                <Button variant="contained" disabled={copying || projectsLoading || !!projectsError ||
                    loading || !!loadError || !destinationProject || !destination}
                    startIcon={copying ? <CircularProgress size={16} color="inherit" /> : undefined}
                    onClick={confirming ? submit : () => setConfirming(true)}>
                    {copying ? 'Копирование…' : confirming ? 'Подтвердить копирование' : 'Копировать'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
