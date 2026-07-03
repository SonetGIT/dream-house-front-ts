import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchSalesOverview,
    type SalesOverviewFloor,
    type SalesOverviewUnit,
} from '@/features/sales/slices/salesObjOverviewSlice';
import {
    downloadDocumentFile,
    type DocumentFile,
} from '@/features/projects/legal_department/files/documentFilesSlice';
import type { Document } from '@/features/projects/documents/documentsSlice';
import SalesMatrixHeader from './SalesMatrixHeader';
import SalesMatrixPlanManagerModal from './SalesMatrixPlanManagerModal';
import { fetchFileContent } from '@/features/projects/legal_department/files/downloadFile';
import { Paper } from '@mui/material';
import { UnitPassportPage } from '../unitsPassport/UnitPassportPage';
import { apiRequest } from '@/utils/apiRequest';

interface MatrixUnitStatus {
    id: number;
    name: string;
    code: string;
    color: string;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1;
const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +value.toFixed(3) || 1));

const isSvgFile = (file: DocumentFile) =>
    file.mime_type === 'image/svg+xml' || /.svg$/i.test(file.name || '');

const getFloorLabel = (floor: SalesOverviewFloor | null) => {
    if (!floor) return 'вЂ”';
    return String(floor.name || '').trim() || `${floor.floor_number} СЌС‚Р°Р¶`;
};

const searchDocumentsDirect = async (params: {
    entity_type: string;
    entity_id: number;
    page?: number;
    size?: number;
}) => {
    const response = await apiRequest<Document[]>('/documents/search', 'POST', params);
    return response.data || [];
};

const createDocumentDirect = async (payload: {
    name: string;
    status: number;
    entity_type: string;
    entity_id: number;
}) => {
    const response = await apiRequest<Document>('/documents/create', 'POST', payload);
    return response.data;
};

const fetchDocumentFilesDirect = async (documentId: number) => {
    const response = await apiRequest<DocumentFile[]>(`/documentFiles/files/${documentId}`, 'GET');
    return response.data || [];
};

const uploadDocumentFileDirect = async (documentId: number, file: File) => {
    const formData = new FormData();
    formData.append('files', file);
    await apiRequest(`/documentFiles/upload/${documentId}`, 'POST', formData);
};

const deleteDocumentFileDirect = async (fileId: number) => {
    await apiRequest(`/documentFiles/${fileId}`, 'DELETE');
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

/***********************************************************************************************************************/
export default function SalesMatrixPage() {
    const dispatch = useAppDispatch();
    const {
        projects,
        blocks,
        units,
        loading: overviewLoading,
        error: overviewError,
    } = useAppSelector((state) => state.salesObjOverview);

    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
    const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

    const [planManagerOpen, setPlanManagerOpen] = useState(false);
    const [planFilesSaving, setPlanFilesSaving] = useState(false);
    const [floorDocumentsLoading, setFloorDocumentsLoading] = useState(false);
    const [floorFilesLoading, setFloorFilesLoading] = useState(false);
    const [loadingFloorPlan, setLoadingFloorPlan] = useState(false);
    const [floorPlanSvgRaw, setFloorPlanSvgRaw] = useState('');
    const [floorPlanZoom, setFloorPlanZoom] = useState(0.7);
    const [selectedFloorDocument, setSelectedFloorDocument] = useState<Document | null>(null);
    const [selectedFloorFiles, setSelectedFloorFiles] = useState<DocumentFile[]>([]);

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

    // const selectedUnit = useMemo(
    //     () => filteredUnits.find((unit) => unit.id === selectedUnitId) ?? null,
    //     [filteredUnits, selectedUnitId],
    // );

    useEffect(() => {
        setSelectedUnitId(null);
    }, [selectedFloorId]);

    const reloadSelectedFloorPlanResources = useCallback(async () => {
        if (!selectedFloorId) {
            setSelectedFloorDocument(null);
            setSelectedFloorFiles([]);
            setFloorPlanSvgRaw('');
            setLoadingFloorPlan(false);
            setFloorDocumentsLoading(false);
            setFloorFilesLoading(false);
            return;
        }

        setFloorDocumentsLoading(true);
        try {
            const docs = await searchDocumentsDirect({
                entity_type: 'salesFloorPlan',
                entity_id: selectedFloorId,
                page: 1,
                size: 20,
            });
            const floorDocument =
                docs.find(
                    (doc) =>
                        doc.entity_type === 'salesFloorPlan' &&
                        Number(doc.entity_id) === Number(selectedFloorId),
                ) ?? null;

            setSelectedFloorDocument(floorDocument);

            if (!floorDocument?.id) {
                setSelectedFloorFiles([]);
                setFloorPlanSvgRaw('');
                setLoadingFloorPlan(false);
                return;
            }

            setFloorFilesLoading(true);
            try {
                const files = await fetchDocumentFilesDirect(floorDocument.id);
                setSelectedFloorFiles(files);
            } finally {
                setFloorFilesLoading(false);
            }
        } catch (error) {
            setSelectedFloorDocument(null);
            setSelectedFloorFiles([]);
            setFloorPlanSvgRaw('');
            setLoadingFloorPlan(false);
            toast.error(error instanceof Error ? error.message : `${error}`);
        } finally {
            setFloorDocumentsLoading(false);
        }
    }, [selectedFloorId]);

    useEffect(() => {
        void reloadSelectedFloorPlanResources();
    }, [reloadSelectedFloorPlanResources]);

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

                // Load SVG content directly as blob text.
                const blob = await fetchFileContent(
                    `/documentFiles/download/${svgFile.id}`,
                    localStorage.getItem('token') || undefined,
                );

                if (cancelled) return;

                // Convert blob to raw SVG text.
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

            // Reserved units are yellow.
            if (code === 'reserved' || label.includes('Р±СЂРѕРЅ')) {
                return {
                    svgFill: '#facc15',
                    svgFillOpacity: '0.6',
                    svgStroke: '#eab308',
                    svgStrokeOpacity: '0.95',
                };
            }

            // Sold units are dark gray.
            if (
                code === 'sold' ||
                code === 'buyout' ||
                label.includes('РїСЂРѕРґР°РЅ') ||
                label.includes('РІС‹РєСѓРї')
            ) {
                return {
                    svgFill: '#4b5563',
                    svgFillOpacity: '0.75',
                    svgStroke: '#1f2937',
                    svgStrokeOpacity: '0.95',
                };
            }

            // Off-market units are gray.
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
                label.includes('СЃРЅСЏС‚') ||
                label.includes('РїСЂРѕРґР°Р¶')
            ) {
                return {
                    svgFill: '#9ca3af',
                    svgFillOpacity: '0.7',
                    svgStroke: '#6b7280',
                    svgStrokeOpacity: '0.9',
                };
            }

            // Free units are green.
            if (code === 'free' || label.includes('СЃРІРѕР±РѕРґ')) {
                return {
                    svgFill: '#22c55e',
                    svgFillOpacity: '0.5',
                    svgStroke: '#16a34a',
                    svgStrokeOpacity: '0.95',
                };
            }

            // Р‘Р•Р— РЎРўРђРўРЈРЎРђ - СЃРІРµС‚Р»Рѕ-СЃРµСЂС‹Р№
            return {
                svgFill: '#e2e8f0',
                svgFillOpacity: '0.3',
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
                    const strokeWidth =
                        shape.getAttribute('stroke-width') ||
                        (shape instanceof SVGElement ? shape.style.strokeWidth : '') ||
                        '2';

                    shape.setAttribute('data-colored-by-sales', 'true');
                    shape.setAttribute('pointer-events', 'all');

                    if (shape instanceof SVGElement) {
                        shape.style.setProperty('fill', meta.svgFill, 'important');
                        shape.style.setProperty('fill-opacity', meta.svgFillOpacity, 'important');
                        shape.style.setProperty('stroke', meta.svgStroke, 'important');
                        shape.style.setProperty(
                            'stroke-opacity',
                            meta.svgStrokeOpacity,
                            'important',
                        );
                        shape.style.setProperty('stroke-width', strokeWidth, 'important');
                        shape.style.setProperty('vector-effect', 'non-scaling-stroke', 'important');
                        shape.style.setProperty('pointer-events', 'all', 'important');
                    } else {
                        shape.setAttribute('fill', meta.svgFill);
                        shape.setAttribute('fill-opacity', meta.svgFillOpacity);
                        shape.setAttribute('stroke', meta.svgStroke);
                        shape.setAttribute('stroke-opacity', meta.svgStrokeOpacity);
                        shape.setAttribute('stroke-width', strokeWidth);
                        shape.setAttribute('vector-effect', 'non-scaling-stroke');
                        shape.setAttribute('pointer-events', 'all');
                    }
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
        node.style.maxWidth = `${900 * zoom}px`;
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

        const delta = event.deltaY < 0 ? 0.05 : -0.05;
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

    // const handleExternalSvgClick = (event: React.MouseEvent) => {
    //     const unitNode = (event.target as Element)?.closest?.('[data-unit-id]');
    //     if (!unitNode) return;
    //     const unitId = Number(unitNode.getAttribute('data-unit-id'));
    //     const unit = filteredUnits.find((item) => item.id === unitId);
    //     if (unit) {
    //         setSelectedUnitId((prev) => (prev === unit.id ? null : unit.id));
    //     }
    // };
    const handleExternalSvgClick = (event: React.MouseEvent) => {
        const unitNode = (event.target as Element)?.closest?.('[data-unit-id]');
        if (!unitNode) return;
        const unitId = Number(unitNode.getAttribute('data-unit-id'));
        setSelectedUnitId((prev) => (prev === unitId ? null : unitId));
    };
    const ensureFloorDocument = useCallback(async () => {
        if (!selectedFloor?.id) return null;
        if (selectedFloorDocument) return selectedFloorDocument;

        const created = await createDocumentDirect({
            name: `РџР»Р°РЅ СЌС‚Р°Р¶Р° ${getFloorLabel(selectedFloor)}`,
            status: 1,
            entity_type: 'salesFloorPlan',
            entity_id: selectedFloor.id,
        });

        setSelectedFloorDocument(created);
        return created;
    }, [selectedFloor, selectedFloorDocument]);

    const openPlanManager = async () => {
        if (!selectedFloor?.id) {
            toast.error('РЎРЅР°С‡Р°Р»Р° РІС‹Р±РµСЂРёС‚Рµ СЌС‚Р°Р¶');
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
            toast.error('Р”РѕРїСѓСЃРєР°РµС‚СЃСЏ С‚РѕР»СЊРєРѕ SVG-С„Р°Р№Р» РїР»Р°РЅР° СЌС‚Р°Р¶Р°');
            return;
        }

        try {
            setPlanFilesSaving(true);

            const doc = await ensureFloorDocument();
            if (!doc?.id) throw new Error('Р”РѕРєСѓРјРµРЅС‚ СЌС‚Р°Р¶Р° РЅРµ СЃРѕР·РґР°РЅ');

            await uploadDocumentFileDirect(doc.id, file);
            await reloadSelectedFloorPlanResources();

            toast.success('SVG-РїР»Р°РЅ Р·Р°РіСЂСѓР¶РµРЅ');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `${error}`);
        } finally {
            setPlanFilesSaving(false);
        }
    };

    const handleDeletePlanFile = async (fileId: number) => {
        if (!window.confirm('РЈРґР°Р»РёС‚СЊ SVG-РїР»Р°РЅ СЌС‚Р°Р¶Р°?')) return;

        try {
            await deleteDocumentFileDirect(fileId);
            await reloadSelectedFloorPlanResources();

            toast.success('РџР»Р°РЅ СѓРґР°Р»С‘РЅ');
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
                Загружаем шахматку продаж...
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
        <Paper sx={{ borderRadius: 3 }}>
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
                planLoading={floorDocumentsLoading || floorFilesLoading}
                planDisabled={!selectedFloor}
            />

            <div className="flex flex-1 overflow-hidden">
                <div className="relative flex flex-col flex-1 overflow-hidden">
                    <div className="absolute z-10 flex items-center justify-between gap-2 pt-2 pointer-events-none left-2 right-2">
                        <div className=" pointer-events-auto flex flex-wrap items-center gap-2.5 rounded-xl border border-stone-200 bg-white/90 px-3 py-1.5 text-[11px] text-slate-700 shadow-sm backdrop-blur-sm">
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
                                <span className="w-3 h-3 border border-green-500 rounded-full bg-green-500/60" />
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
                            <div className="flex min-h-[400px] w-full items-center justify-center text-sm text-slate-500">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 border-2 rounded-full animate-spin border-sky-400 border-t-transparent" />
                                    Загружаем план этажа...
                                </div>
                            </div>
                        ) : renderedFloorPlanSvg ? (
                            <div
                                ref={contentRef}
                                className="mx-auto bg-[#fcfbf7]"
                                style={{ width: '100%', maxWidth: '900px', minWidth: '100%' }}
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
                                        <code>documents/search</code> по{' '}
                                        <code>entity_type = salesFloorPlan</code> и{' '}
                                        <code>entity_id = floorId</code>
                                        <br />
                                        затем <code>documentFiles/files/{'{documentId}'}</code>
                                        <br />
                                        затем <code>documentFiles/download/{'{fileId}'}</code>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {selectedUnitId && (
                    <UnitPassportPage
                        unitId={selectedUnitId}
                        onClose={() => setSelectedUnitId(null)}
                    />
                )}
            </div>

            <SalesMatrixPlanManagerModal
                open={planManagerOpen}
                onClose={() => setPlanManagerOpen(false)}
                blockName={selectedBlock?.name || 'Р‘Р»РѕРє'}
                floorLabel={getFloorLabel(selectedFloor)}
                files={selectedFloorFiles}
                loading={floorDocumentsLoading || floorFilesLoading}
                saving={planFilesSaving}
                limitReached={floorPlanLimitReached}
                onUpload={handleUploadPlan}
                onDownload={handleDownloadPlanFile}
                onDelete={handleDeletePlanFile}
            />
        </Paper>
    );
}
