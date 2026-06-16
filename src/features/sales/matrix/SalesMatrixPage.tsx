import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchSalesOverview,
    type SalesOverviewFloor,
    type SalesOverviewUnit,
} from '@/features/sales/slices/salesObjOverviewSlice';
import { createDocument, fetchDocuments } from '@/features/projects/documents/documentsSlice';
import {
    clearDocumentFiles,
    deleteDocumentFile,
    downloadDocumentFile,
    fetchDocumentFiles,
    uploadDocumentFile,
    type DocumentFile,
} from '@/features/projects/legal_department/files/documentFilesSlice';
import SalesMatrixHeader from './SalesMatrixHeader';
import SalesMatrixSidebar from './SalesMatrixSidebar';
import SalesMatrixPlanManagerModal from './SalesMatrixPlanManagerModal';
import { fetchFileContent } from '@/features/projects/legal_department/files/downloadFile';
import { Paper } from '@mui/material';

interface MatrixUnitStatus {
    id: number;
    name: string;
    code: string;
    color: string;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +value.toFixed(3) || 1));

const isSvgFile = (file: DocumentFile) =>
    file.mime_type === 'image/svg+xml' || /\.svg$/i.test(file.name || '');

const getFloorLabel = (floor: SalesOverviewFloor | null) => {
    if (!floor) return '—';
    return String(floor.name || '').trim() || `${floor.floor_number} этаж`;
};

const formatArea = (value: number | null) => (value != null ? `${value.toFixed(1)} м²` : '—');

const formatPrice = (value: number | null) => {
    if (value == null) return '—';
    return value >= 1_000_000
        ? `${(value / 1_000_000).toFixed(1)} млн`
        : value.toLocaleString('ru-RU');
};

const buildStatusMap = (units: SalesOverviewUnit[]) => {
    const map = new Map<number, MatrixUnitStatus>();

    units.forEach((unit) => {
        if (!unit.status_id) return;
        map.set(unit.status_id, {
            id: unit.status_id,
            name: unit.status_name,
            code: unit.status_code,
            color: unit.status_color,
        });
    });

    return map;
};

/********************************************************************************************************************************************/
export default function SalesMatrixPage() {
    const dispatch = useAppDispatch();

    const {
        projects,
        blocks,
        units,
        loading: overviewLoading,
        error: overviewError,
    } = useAppSelector((state) => state.salesObjOverview);

    const { items: documents, loading: documentsLoading } = useAppSelector(
        (state) => state.documents,
    );
    console.log('doc', documents);
    const { data: documentFiles, loading: documentFilesLoading } = useAppSelector(
        (state) => state.documentFiles,
    );
    console.log('documentFiles', documentFiles);

    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
    const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

    const [planManagerOpen, setPlanManagerOpen] = useState(false);
    const [planFilesSaving, setPlanFilesSaving] = useState(false);
    const [loadingFloorPlan, setLoadingFloorPlan] = useState(false);
    const [floorPlanSvgRaw, setFloorPlanSvgRaw] = useState('');
    const [floorPlanZoom, setFloorPlanZoom] = useState(1);

    const scrollRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const zoomRef = useRef(1);

    useEffect(() => {
        dispatch(
            fetchSalesOverview({
                include_units: true,
                page: 1,
                size: 5000,
            }),
        );
    }, [dispatch]);

    useEffect(() => {
        if (!projects.length || selectedProjectId) return;
        setSelectedProjectId(projects[0].id);
    }, [projects, selectedProjectId]);

    const filteredBlocks = useMemo(
        () =>
            selectedProjectId == null
                ? []
                : blocks.filter((block) => block.project_id === selectedProjectId),
        [blocks, selectedProjectId],
    );

    useEffect(() => {
        if (!filteredBlocks.length) {
            setSelectedBlockId(null);
            return;
        }

        const exists = filteredBlocks.some((block) => block.id === selectedBlockId);
        if (!exists) {
            setSelectedBlockId(filteredBlocks[0].id);
        }
    }, [filteredBlocks, selectedBlockId]);

    const selectedBlock = useMemo(
        () => filteredBlocks.find((block) => block.id === selectedBlockId) ?? null,
        [filteredBlocks, selectedBlockId],
    );

    const floors = useMemo(() => selectedBlock?.floors ?? [], [selectedBlock]);

    useEffect(() => {
        if (!floors.length) {
            setSelectedFloorId(null);
            return;
        }

        const exists = floors.some((floor) => floor.id === selectedFloorId);
        if (!exists) {
            setSelectedFloorId(floors[0].id);
        }
    }, [floors, selectedFloorId]);

    const selectedFloor = useMemo(
        () => floors.find((floor) => floor.id === selectedFloorId) ?? null,
        [floors, selectedFloorId],
    );

    const filteredUnits = useMemo(
        () =>
            units.filter((unit) => {
                if (selectedProjectId != null && unit.project_id !== selectedProjectId)
                    return false;
                if (selectedBlockId != null && unit.block_id !== selectedBlockId) return false;
                if (selectedFloorId != null && unit.floor_id !== selectedFloorId) return false;
                return true;
            }),
        [units, selectedProjectId, selectedBlockId, selectedFloorId],
    );

    const statusMap = useMemo(() => buildStatusMap(filteredUnits), [filteredUnits]);

    const selectedUnit = useMemo(
        () => filteredUnits.find((unit) => unit.id === selectedUnitId) ?? null,
        [filteredUnits, selectedUnitId],
    );

    useEffect(() => {
        setSelectedUnitId(null);
    }, [selectedFloorId]);

    useEffect(() => {
        if (!selectedFloorId) {
            dispatch(clearDocumentFiles());
            setFloorPlanSvgRaw('');
            setLoadingFloorPlan(false);
            return;
        }

        dispatch(
            fetchDocuments({
                entity_type: 'salesFloorPlan',
                entity_id: selectedFloorId,
                page: 1,
                size: 20,
            }),
        );
    }, [dispatch, selectedFloorId]);

    const selectedFloorDocument = useMemo(
        () =>
            documents.find(
                (doc) => doc.entity_type === 'salesFloorPlan' && doc.entity_id === selectedFloorId,
            ) ?? null,
        [documents, selectedFloorId],
    );

    const selectedFloorFiles = useMemo(
        () =>
            selectedFloorDocument?.id
                ? documentFiles.filter((file) => file.document_id === selectedFloorDocument.id)
                : [],
        [documentFiles, selectedFloorDocument?.id],
    );

    useEffect(() => {
        if (!selectedFloorDocument?.id) {
            dispatch(clearDocumentFiles());
            setFloorPlanSvgRaw('');
            setLoadingFloorPlan(false);
            return;
        }

        setFloorPlanSvgRaw('');
        dispatch(fetchDocumentFiles(selectedFloorDocument.id));
    }, [dispatch, selectedFloorDocument?.id]);

    useEffect(() => {
        let cancelled = false;

        const loadSvg = async () => {
            const svgFile = selectedFloorFiles.find(isSvgFile);

            if (!svgFile) {
                setFloorPlanSvgRaw('');
                setLoadingFloorPlan(false);
                return;
            }

            try {
                setLoadingFloorPlan(true);

                // Используем новую функцию
                const blob = await fetchFileContent(
                    `/documentFiles/download/${svgFile.id}`,
                    localStorage.getItem('token') || undefined,
                );

                if (cancelled) return;

                // Конвертируем Blob в текст
                const text = await blob.text();
                setFloorPlanSvgRaw(text.includes('<svg') ? text : '');
            } catch (error) {
                if (!cancelled) {
                    console.error('load svg error', error);
                    setFloorPlanSvgRaw('');
                }
            } finally {
                if (!cancelled) {
                    setLoadingFloorPlan(false);
                }
            }
        };

        void loadSvg();

        return () => {
            cancelled = true;
        };
    }, [selectedFloorFiles]);

    const getStatusMeta = useCallback(
        (unit: { status_id: number | null }) => {
            const status = unit.status_id ? statusMap.get(unit.status_id) : null;
            const code = String(status?.code || '').toLowerCase();
            const label = String(status?.name || '').toLowerCase();

            if (code === 'reserved' || label.includes('брон')) {
                return {
                    svgFill: '#facc15',
                    svgFillOpacity: '0.55',
                    svgStroke: '#eab308',
                    svgStrokeOpacity: '0.95',
                };
            }

            if (
                code === 'sold' ||
                code === 'buyout' ||
                label.includes('продан') ||
                label.includes('выкуп')
            ) {
                return {
                    svgFill: '#4b5563',
                    svgFillOpacity: '0.72',
                    svgStroke: '#1f2937',
                    svgStrokeOpacity: '0.95',
                };
            }

            if (
                [
                    'offmarket',
                    'off_market',
                    'off_sale',
                    'not_for_sale',
                    'removed',
                    'withdrawn',
                    'inactive',
                ].includes(code) ||
                label.includes('снят') ||
                label.includes('продаж')
            ) {
                return {
                    svgFill: '#64748b',
                    svgFillOpacity: '0.64',
                    svgStroke: '#475569',
                    svgStrokeOpacity: '0.9',
                };
            }

            if (code === 'free' || label.includes('свобод')) {
                return {
                    svgFill: 'none',
                    svgFillOpacity: '0',
                    svgStroke: 'none',
                    svgStrokeOpacity: '0',
                };
            }

            return {
                svgFill: '#e2e8f0',
                svgFillOpacity: '0.2',
                svgStroke: '#94a3b8',
                svgStrokeOpacity: '0.7',
            };
        },
        [statusMap],
    );

    const renderedFloorPlanSvg = useMemo(() => {
        if (!floorPlanSvgRaw || typeof DOMParser === 'undefined') return '';

        try {
            const parser = new DOMParser();
            const xml = parser.parseFromString(floorPlanSvgRaw, 'image/svg+xml');
            const svg = xml.querySelector('svg');
            if (!svg) return '';

            svg.setAttribute('data-sales-floor-plan', 'true');
            svg.setAttribute(
                'preserveAspectRatio',
                svg.getAttribute('preserveAspectRatio') || 'xMidYMid meet',
            );

            if (!svg.getAttribute('viewBox')) {
                const width = svg.getAttribute('width') || '1180';
                const height = svg.getAttribute('height') || '760';
                svg.setAttribute(
                    'viewBox',
                    `0 0 ${parseFloat(width) || 1180} ${parseFloat(height) || 760}`,
                );
            }

            svg.setAttribute('width', '100%');
            svg.removeAttribute('height');
            svg.setAttribute('style', 'display:block;width:100%;height:auto;');

            const style = xml.createElementNS('http://www.w3.org/2000/svg', 'style');
            style.textContent = `
                [data-sales-floor-unit="true"],
                [data-sales-floor-unit="true"] * { cursor: pointer; pointer-events: all; }
                [data-sales-floor-unit="true"] { transition: opacity .2s ease; }
                [data-sales-floor-unit="true"]:hover { opacity: .88; }
                [data-sales-floor-unit="true"][data-selected="true"] rect,
                [data-sales-floor-unit="true"][data-selected="true"] path,
                [data-sales-floor-unit="true"][data-selected="true"] polygon,
                [data-sales-floor-unit="true"][data-selected="true"] polyline,
                [data-sales-floor-unit="true"][data-selected="true"] ellipse,
                [data-sales-floor-unit="true"][data-selected="true"] circle {
                    stroke: #0ea5e9 !important;
                    stroke-width: 4 !important;
                    stroke-opacity: 1 !important;
                }
            `;
            svg.insertBefore(style, svg.firstChild);

            filteredUnits.forEach((unit) => {
                const keys = [unit.plan_code, unit.external_code, unit.unit_number]
                    .map((value) => (value == null ? '' : String(value).trim()))
                    .filter(Boolean);

                const selectorKeys = [
                    ...new Set(
                        keys.flatMap((key) => {
                            const normalized = /^\d+$/.test(key) ? String(Number(key)) : '';
                            return [key, normalized].filter(Boolean);
                        }),
                    ),
                ];

                let root: Element | null = null;

                for (const key of keys) {
                    root = xml.getElementById(key);
                    if (root) break;
                }

                if (!root) {
                    for (const key of selectorKeys) {
                        const safe = key.replace(/"/g, '\\"');
                        root = svg.querySelector(
                            `[data-unit-number="${safe}"],[data-unit-code="${safe}"],[data-plan-code="${safe}"],[data-external-code="${safe}"]`,
                        );
                        if (root) break;
                    }
                }

                if (!root) return;

                const meta = getStatusMeta(unit);
                root.setAttribute('data-sales-floor-unit', 'true');
                root.setAttribute('data-unit-id', String(unit.id));
                root.setAttribute('pointer-events', 'all');

                if (unit.id === selectedUnitId) root.setAttribute('data-selected', 'true');
                else root.removeAttribute('data-selected');

                const shapeQuery = 'path, polygon, rect, polyline, ellipse, circle';
                const shapes = root.matches?.(shapeQuery)
                    ? [root]
                    : Array.from(root.querySelectorAll(shapeQuery));
                const targets = shapes.length ? shapes : [root];

                targets.forEach((shape) => {
                    const strokeWidth = shape.getAttribute('stroke-width') || '2';
                    shape.setAttribute('fill', meta.svgFill);
                    shape.setAttribute('fill-opacity', meta.svgFillOpacity);
                    shape.setAttribute('stroke', meta.svgStroke);
                    shape.setAttribute('stroke-opacity', meta.svgStrokeOpacity);
                    shape.setAttribute('stroke-width', strokeWidth);
                    shape.setAttribute('vector-effect', 'non-scaling-stroke');
                    shape.setAttribute('pointer-events', 'all');
                });
            });

            return new XMLSerializer().serializeToString(svg);
        } catch (error) {
            console.error('svg render error', error);
            return '';
        }
    }, [filteredUnits, floorPlanSvgRaw, getStatusMeta, selectedUnitId]);

    const applyFloorPlanZoomToNode = (zoom: number) => {
        const node = contentRef.current;
        if (!node) return;
        node.style.width = `${zoom * 100}%`;
        node.style.maxWidth = `${1180 * zoom}px`;
        node.style.minWidth = zoom > 1 ? `${100 * zoom}%` : '100%';
    };

    const changeFloorPlanZoom = (delta: number) => {
        setFloorPlanZoom((prev) => {
            const next = clampZoom(prev + delta);
            zoomRef.current = next;
            requestAnimationFrame(() => applyFloorPlanZoomToNode(next));
            return next;
        });
    };

    const resetZoom = () => {
        zoomRef.current = 1;
        setFloorPlanZoom(1);
        requestAnimationFrame(() => applyFloorPlanZoomToNode(1));
    };

    const handleWheel = useCallback((event: WheelEvent) => {
        const scroller = scrollRef.current;
        if (!scroller) return;

        if (event.cancelable) {
            event.preventDefault();
        }

        const delta = event.deltaY < 0 ? 0.1 : -0.1;
        const prev = zoomRef.current;
        const next = clampZoom(prev + delta);

        const rect = scroller.getBoundingClientRect();
        const centerX = event.clientX - rect.left;
        const centerY = event.clientY - rect.top;
        const ratio = next / prev;

        const nextScrollLeft = (scroller.scrollLeft + centerX) * ratio - centerX;
        const nextScrollTop = (scroller.scrollTop + centerY) * ratio - centerY;

        zoomRef.current = next;
        setFloorPlanZoom(next);

        requestAnimationFrame(() => {
            applyFloorPlanZoomToNode(next);
            scroller.scrollLeft = nextScrollLeft;
            scroller.scrollTop = nextScrollTop;
        });
    }, []);

    useEffect(() => {
        const scroller = scrollRef.current;
        if (!scroller) return;

        scroller.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            scroller.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel]);

    const handleExternalSvgClick = (event: React.MouseEvent) => {
        const unitNode = (event.target as Element)?.closest?.('[data-unit-id]');
        if (!unitNode) return;

        const unitId = Number(unitNode.getAttribute('data-unit-id'));
        const unit = filteredUnits.find((item) => item.id === unitId);
        if (unit) {
            setSelectedUnitId((prev) => (prev === unit.id ? null : unit.id));
        }
    };

    const ensureFloorDocument = useCallback(async () => {
        if (!selectedFloor?.id) return null;
        if (selectedFloorDocument) return selectedFloorDocument;

        const created = await dispatch(
            createDocument({
                name: `План этажа ${getFloorLabel(selectedFloor)}`,
                status: 1,
                entity_type: 'salesFloorPlan',
                entity_id: selectedFloor.id,
            }),
        ).unwrap();

        await dispatch(
            fetchDocuments({
                entity_type: 'salesFloorPlan',
                entity_id: selectedFloor.id,
                page: 1,
                size: 20,
            }),
        );

        return created;
    }, [dispatch, selectedFloor, selectedFloorDocument]);

    const openPlanManager = async () => {
        if (!selectedFloor?.id) {
            toast.error('Сначала выберите этаж');
            return;
        }

        try {
            await ensureFloorDocument();
            setPlanManagerOpen(true);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `${error}`);
        }
    };

    const handleUploadPlan = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file || !selectedFloor?.id) return;

        if (!/\.svg$/i.test(file.name) && file.type !== 'image/svg+xml') {
            toast.error('Допускается только SVG-файл плана этажа');
            return;
        }

        try {
            setPlanFilesSaving(true);

            const doc = await ensureFloorDocument();
            if (!doc?.id) throw new Error('Документ этажа не создан');

            await dispatch(uploadDocumentFile({ documentId: doc.id, file })).unwrap();
            await dispatch(fetchDocumentFiles(doc.id));

            toast.success('SVG-план загружен');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `${error}`);
        } finally {
            setPlanFilesSaving(false);
        }
    };

    const handleDeletePlanFile = async (fileId: number) => {
        if (!window.confirm('Удалить SVG-план этажа?')) return;

        try {
            await dispatch(deleteDocumentFile(fileId)).unwrap();

            if (selectedFloorDocument?.id) {
                await dispatch(fetchDocumentFiles(selectedFloorDocument.id));
            }

            toast.success('План удалён');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `${error}`);
        }
    };

    const handleDownloadPlanFile = (file: DocumentFile) => {
        void dispatch(downloadDocumentFile({ file_id: file.id, filename: file.name }));
    };

    const floorPlanLimitReached = selectedFloorFiles.some(isSvgFile);

    if (overviewLoading && !projects.length) {
        return (
            <div className="flex items-center justify-center h-screen text-sm bg-white text-slate-500">
                Загружаем матрицу продаж...
            </div>
        );
    }

    if (overviewError && !projects.length) {
        return (
            <div className="flex items-center justify-center h-screen text-sm text-red-500 bg-white">
                {overviewError}
            </div>
        );
    }

    return (
        <Paper sx={{ p: 1, borderRadius: 3 }}>
            <SalesMatrixHeader
                projects={projects}
                blocks={filteredBlocks}
                floors={floors}
                selectedProjectId={selectedProjectId}
                selectedBlockId={selectedBlockId}
                selectedFloorId={selectedFloorId}
                onProjectChange={setSelectedProjectId}
                onBlockChange={setSelectedBlockId}
                onFloorChange={setSelectedFloorId}
                onOpenPlanManager={() => void openPlanManager()}
                planLoading={documentsLoading || documentFilesLoading}
                planDisabled={!selectedFloor}
            />

            <div className="flex flex-1 overflow-hidden">
                <div className="relative flex flex-col flex-1 overflow-hidden">
                    <div className="absolute z-10 flex items-center justify-between gap-2 pointer-events-none left-2 right-2">
                        <div className="pointer-events-auto flex flex-wrap items-center gap-2.5 rounded-xl border border-stone-200 bg-white/90 px-2 py-1.5 text-[11px] text-slate-700 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border rounded-full border-slate-600 bg-slate-500/80" />
                                <span>Продано</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border border-yellow-500 rounded-full bg-yellow-300/80" />
                                <span>Бронь</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border rounded-full border-slate-400 bg-slate-300/80" />
                                <span>Снято</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 bg-white border border-gray-300 rounded-full" />
                                <span>Свободно</span>
                            </div>
                        </div>

                        {renderedFloorPlanSvg ? (
                            <div className="pointer-events-auto flex items-center gap-0.5 rounded-xl bg-white/90 p-0.5 shadow-sm ring-1 ring-stone-200 backdrop-blur-sm">
                                <button
                                    onClick={() => changeFloorPlanZoom(-0.1)}
                                    className="rounded-lg px-2 py-1.5 text-slate-700 transition-transform hover:bg-slate-100 active:scale-95"
                                >
                                    <Minus size={13} />
                                </button>
                                <button
                                    onClick={resetZoom}
                                    className="flex min-w-[56px] items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-700 transition-transform hover:bg-slate-100 active:scale-95"
                                >
                                    <RotateCcw size={11} />
                                    {Math.round(floorPlanZoom * 100)}%
                                </button>
                                <button
                                    onClick={() => changeFloorPlanZoom(0.1)}
                                    className="rounded-lg px-2 py-1.5 text-slate-700 transition-transform hover:bg-slate-100 active:scale-95"
                                >
                                    <Plus size={13} />
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-auto bg-[#f8f5ef]">
                        {loadingFloorPlan ? (
                            <div className="flex min-h-[300px] w-full items-center justify-center text-sm text-slate-500">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 border-2 rounded-full animate-spin border-sky-400 border-t-transparent" />
                                    Загружаем план этажа...
                                </div>
                            </div>
                        ) : renderedFloorPlanSvg ? (
                            <div
                                ref={contentRef}
                                className="mx-auto bg-[#fcfbf7]"
                                style={{ width: '100%', maxWidth: '1180px', minWidth: '100%' }}
                            >
                                <div
                                    className="w-full mx-auto"
                                    onClick={handleExternalSvgClick}
                                    dangerouslySetInnerHTML={{ __html: renderedFloorPlanSvg }}
                                />
                            </div>
                        ) : (
                            <div className="m-4 mx-auto flex min-h-[420px] w-full max-w-5xl items-center justify-center rounded-xl border border-dashed border-stone-300 bg-[#fcfbf7] p-4 text-center">
                                <div className="max-w-sm space-y-3 text-slate-500">
                                    <div className="text-lg font-semibold text-slate-700">
                                        SVG-план не найден
                                    </div>
                                    <div className="text-sm">
                                        По выбранному этажу еще нет SVG-файла. Поиск идет так:
                                        <br />
                                        `documents/search` по `entity_type = salesFloorPlan` и
                                        `entity_id = floorId`
                                        <br />
                                        потом `documentFiles/files/{'documentId'}`
                                        <br />
                                        потом `documentFiles/download/{'fileId'}`
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <SalesMatrixSidebar
                    floorLabel={getFloorLabel(selectedFloor)}
                    units={filteredUnits}
                    selectedUnit={selectedUnit}
                    selectedUnitId={selectedUnitId}
                    statusMap={statusMap}
                    onSelectUnit={setSelectedUnitId}
                    formatArea={formatArea}
                    formatPrice={formatPrice}
                />
            </div>

            <SalesMatrixPlanManagerModal
                open={planManagerOpen}
                onClose={() => setPlanManagerOpen(false)}
                blockName={selectedBlock?.name || 'Блок'}
                floorLabel={getFloorLabel(selectedFloor)}
                files={selectedFloorFiles}
                loading={documentsLoading || documentFilesLoading}
                saving={planFilesSaving}
                limitReached={floorPlanLimitReached}
                onUpload={handleUploadPlan}
                onDownload={handleDownloadPlanFile}
                onDelete={handleDeletePlanFile}
            />
        </Paper>
    );
}
