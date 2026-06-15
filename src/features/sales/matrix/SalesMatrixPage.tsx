import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw, Upload, Download, Trash2, Info, X } from 'lucide-react';
import { apiRequest } from '@/utils/apiRequest';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/app/store';

// ---- Types (matching server shape) ----
interface UnitStatus {
    id: number;
    name: string;
    code: string;
    color: string;
}
interface OverviewUnit {
    id: number;
    unit_number: string;
    plan_code: string | null;
    external_code: string | null;
    status_id: number;
    lot_type: string;
    rooms: number | null;
    area_total: string | null;
    price_total: string | null;
}
interface OverviewFloor {
    id: number;
    floor_number: number;
    name: string | null;
    units: OverviewUnit[];
}
interface BlockOverview {
    block: { id: number; name: string; project_id: number };
    floors: OverviewFloor[];
}
interface DocFile {
    id: number;
    name: string;
    mime_type: string;
}

// ---- Constants ----
const isSvgFile = (f: DocFile) => f.mime_type === 'image/svg+xml' || /\.svg$/i.test(f.name || '');
const MIN_ZOOM = 0.5,
    MAX_ZOOM = 3;
const clampZoom = (v: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +v.toFixed(3) || 1));

const getFloorLabel = (f: OverviewFloor | null) => {
    if (!f) return '—';
    return String(f.name || '').trim() || `${f.floor_number} этаж`;
};

// ---- Touch helpers (exact from mobile) ----
const getTouchDistance = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
const getTouchCenter = (t: React.TouchList) => ({
    x: (t[0].clientX + t[1].clientX) / 2,
    y: (t[0].clientY + t[1].clientY) / 2,
});

// ============================================================
export function SalesMatrixPage() {
    //  const { projects, blocks } = useAppSelector((s) => s.salesObjOverview);

    //   const projectBlocks = useMemo(
    //          () => blocks.filter((b) => b.project_id === form.project_id),
    //          [blocks, form.project_id],
    //      );
    // ---- Navigation ----
    // const [projectId, setProjectId] = useState<number>(PROJECTS_DEF[0].id);
    // const [blockId, setBlockId] = useState<number>(
    //     BLOCKS_DEF.find((b) => b.project_id === PROJECTS_DEF[0].id)?.id ?? BLOCKS_DEF[0].id,
    // );
    const [overview, setOverview] = useState<BlockOverview | null>(null);
    const [unitStatuses, setUnitStatuses] = useState<UnitStatus[]>([]);
    const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

    // ---- SVG plan ----
    const [floorPlanSvgRaw, setFloorPlanSvgRaw] = useState(''); // real uploaded
    const [floorPlanDemo, setFloorPlanDemo] = useState(''); // auto-generated
    const [floorPlanFiles, setFloorPlanFiles] = useState<DocFile[]>([]);
    const [loadingFloorPlan, setLoadingFloorPlan] = useState(false);

    // ---- Plan manager modal ----
    const [planManagerOpen, setPlanManagerOpen] = useState(false);
    const [planFilesLoading, setPlanFilesLoading] = useState(false);
    const [planFilesSaving, setPlanFilesSaving] = useState(false);

    // ---- Unit selection (right panel) ----
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

    // ---- Zoom (width-manipulation approach, matches mobile) ----
    const [floorPlanZoom, setFloorPlanZoom] = useState(1);
    const scrollRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const zoomRef = useRef(1);
    const pinchRef = useRef<{
        startDistance: number;
        startZoom: number;
        centerX: number;
        centerY: number;
        startScrollLeft: number;
        startScrollTop: number;
        latestZoom: number;
        latestRatio: number;
    } | null>(null);
    const zoomFrameRef = useRef<number | null>(null);

    // ---- Derived ----
    // const projectBlocks = BLOCKS_DEF.filter((b) => b.project_id === projectId);
    const floors = overview?.floors ?? [];
    const selectedFloor = useMemo(
        () => floors.find((f) => f.id === selectedFloorId) ?? floors[0] ?? null,
        [floors, selectedFloorId],
    );
    const units = selectedFloor?.units ?? [];

    const statusMap = useMemo(() => {
        const m = new Map<number, UnitStatus>();
        unitStatuses.forEach((s) => m.set(s.id, s));
        return m;
    }, [unitStatuses]);

    const selectedUnit = useMemo(
        () => units.find((u) => u.id === selectedUnitId) ?? null,
        [units, selectedUnitId],
    );

    // ---- getStatusMeta — EXACT PORT from mobile SalesFloorPlan.jsx ----
    const getStatusMeta = useCallback(
        (unit: { status_id: number | null }) => {
            const status = statusMap.get(Number(unit?.status_id));
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

    // ---- renderedFloorPlanSvg — EXACT PORT from mobile ----
    const renderedFloorPlanSvg = useMemo(() => {
        const raw = floorPlanSvgRaw || floorPlanDemo;
        if (!raw || typeof DOMParser === 'undefined') return '';
        try {
            const parser = new DOMParser();
            const xml = parser.parseFromString(raw, 'image/svg+xml');
            const svg = xml.querySelector('svg');
            if (!svg) return '';

            svg.setAttribute('data-sales-floor-plan', 'true');
            svg.setAttribute(
                'preserveAspectRatio',
                svg.getAttribute('preserveAspectRatio') || 'xMidYMid meet',
            );
            if (!svg.getAttribute('viewBox')) {
                const w = svg.getAttribute('width') || '1180';
                const h = svg.getAttribute('height') || '760';
                svg.setAttribute('viewBox', `0 0 ${parseFloat(w) || 1180} ${parseFloat(h) || 760}`);
            }
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', 'auto');
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

            units.forEach((unit) => {
                // Key search order: plan_code → external_code → unit_number (exact mobile logic)
                const keys = [unit.plan_code, unit.external_code, unit.unit_number]
                    .map((v) => (v == null ? '' : String(v).trim()))
                    .filter(Boolean);

                const selectorKeys = [
                    ...new Set(
                        keys.flatMap((key) => {
                            const norm = /^\d+$/.test(key) ? String(Number(key)) : '';
                            return [key, norm].filter(Boolean);
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

                const shapeQ = 'path, polygon, rect, polyline, ellipse, circle';
                const shapes = root.matches?.(shapeQ)
                    ? [root]
                    : Array.from(root.querySelectorAll(shapeQ));
                const targets = shapes.length ? shapes : [root];

                targets.forEach((shape) => {
                    const sw = shape.getAttribute('stroke-width') || '2';
                    shape.setAttribute('fill', meta.svgFill);
                    shape.setAttribute('fill-opacity', meta.svgFillOpacity);
                    shape.setAttribute('stroke', meta.svgStroke);
                    shape.setAttribute('stroke-opacity', meta.svgStrokeOpacity);
                    shape.setAttribute('stroke-width', sw);
                    shape.setAttribute('vector-effect', 'non-scaling-stroke');
                    shape.setAttribute('pointer-events', 'all');
                    const cur = shape.getAttribute('style') || '';
                    shape.setAttribute(
                        'style',
                        `${cur};fill:${meta.svgFill}!important;fill-opacity:${meta.svgFillOpacity}!important;` +
                            `stroke:${meta.svgStroke}!important;stroke-opacity:${meta.svgStrokeOpacity}!important;` +
                            `stroke-width:${sw}px!important;vector-effect:non-scaling-stroke;pointer-events:all;`,
                    );
                });
            });

            return new XMLSerializer().serializeToString(svg);
        } catch (err) {
            console.error('SalesFloorPlan svg render error', err);
            return '';
        }
    }, [floorPlanSvgRaw, floorPlanDemo, units, unitStatuses, selectedUnitId, getStatusMeta]);

    // ---- Load overview + statuses ----
    const loadOverview = useCallback(async (bid: number) => {
        try {
            const [overviewRes, statusesRes] = await Promise.all([
                apiRequest<BlockOverview>(`/sales/blocks/${bid}/overview`, 'GET'),
                apiRequest<UnitStatus[]>('/sales/unit-statuses', 'GET'),
            ]);
            setOverview(overviewRes.data);
            setUnitStatuses(statusesRes.data ?? []);
            setSelectedFloorId(overviewRes.data.floors[0]?.id ?? null);
        } catch (e) {
            toast.error(`Ошибка загрузки обзора: ${e}`);
        }
    }, []);

    useEffect(() => {
        // loadOverview(blockId);
    }, []);

    // ---- Load floor plan document + SVG ----
    const loadFloorPlanDocument = useCallback(
        async (
            targetFloorId: number,
            { createIfMissing = false } = {},
        ): Promise<{ doc: { id: number } | null; files: DocFile[] }> => {
            const docsRes = await apiRequest<{ id: number }[]>('/documents/search', 'POST', {
                entity_type: 'salesFloorPlan',
                entity_id: targetFloorId,
                page: 1,
                size: 20,
            });
            let doc = docsRes.data[0] ?? null;

            if (!doc && createIfMissing) {
                const createRes = await apiRequest<{ id: number }>('/documents/create', 'POST', {
                    entity_type: 'salesFloorPlan',
                    entity_id: targetFloorId,
                    name: `План этажа ${getFloorLabel(selectedFloor)}`,
                });
                doc = createRes.data ?? null;
            }

            if (!doc) {
                setFloorPlanFiles([]);
                return { doc: null, files: [] };
            }

            const filesRes = await apiRequest<DocFile[]>(`/documentFiles/files/${doc.id}`, 'GET');
            const files = filesRes.data ?? [];
            setFloorPlanFiles(files);
            return { doc, files };
        },
        [selectedFloor],
    );

    const loadFloorPlanAssets = useCallback(
        async (targetFloorId: number) => {
            if (!targetFloorId) {
                setFloorPlanSvgRaw('');
                setFloorPlanDemo('');
                return;
            }
            try {
                setLoadingFloorPlan(true);
                const { files } = await loadFloorPlanDocument(targetFloorId);
                const svgFile = files.find(isSvgFile);

                if (svgFile) {
                    const svgRes = await apiRequest<string>(
                        `/documentFiles/download/${svgFile.id}`,
                        'GET',
                    );
                    const raw = svgRes.data;
                    setFloorPlanSvgRaw(typeof raw === 'string' && raw.includes('<svg') ? raw : '');
                    setFloorPlanDemo('');
                } else {
                    setFloorPlanSvgRaw('');
                    // Generate demo from current floor units
                    const floorData = overview?.floors.find((f) => f.id === targetFloorId);
                    // if (floorData?.units.length)
                    //     setFloorPlanDemo(generateDemoFloorSvg(floorData.units));
                }
            } catch (e) {
                console.error('load floor plan error', e);
                setFloorPlanSvgRaw('');
            } finally {
                setLoadingFloorPlan(false);
            }
        },
        [loadFloorPlanDocument, overview],
    );

    useEffect(() => {
        if (selectedFloorId) loadFloorPlanAssets(selectedFloorId);
    }, [selectedFloorId]);

    // Update demo SVG when units change (e.g. first overview load)
    useEffect(() => {
        if (!floorPlanSvgRaw && selectedFloor?.units.length) {
            // setFloorPlanDemo(generateDemoFloorSvg(selectedFloor.units));
        }
    }, [selectedFloor, floorPlanSvgRaw]);

    // ---- Zoom: width-manipulation approach (matches mobile, adds wheel) ----
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
        const next = 1;
        zoomRef.current = next;
        setFloorPlanZoom(next);
        requestAnimationFrame(() => applyFloorPlanZoomToNode(next));
    };

    // Mouse-wheel zoom (web addition) — zoom toward cursor
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const scroller = scrollRef.current;
        if (!scroller) return;
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        const prev = zoomRef.current;
        const next = clampZoom(prev + delta);
        const rect = scroller.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const ratio = next / prev;
        const newSL = (scroller.scrollLeft + cx) * ratio - cx;
        const newST = (scroller.scrollTop + cy) * ratio - cy;
        zoomRef.current = next;
        setFloorPlanZoom(next);
        requestAnimationFrame(() => {
            applyFloorPlanZoomToNode(next);
            scroller.scrollLeft = newSL;
            scroller.scrollTop = newST;
        });
    }, []);

    // Touch pinch — EXACT PORT from mobile
    const handleFloorPlanTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 2 || !scrollRef.current) return;
        const scroller = scrollRef.current;
        const center = getTouchCenter(e.touches);
        const rect = scroller.getBoundingClientRect();
        pinchRef.current = {
            startDistance: getTouchDistance(e.touches),
            startZoom: zoomRef.current,
            centerX: center.x - rect.left,
            centerY: center.y - rect.top,
            startScrollLeft: scroller.scrollLeft,
            startScrollTop: scroller.scrollTop,
            latestZoom: zoomRef.current,
            latestRatio: 1,
        };
    };

    const handleFloorPlanTouchMove = (e: React.TouchEvent) => {
        const pinch = pinchRef.current;
        const scroller = scrollRef.current;
        if (e.touches.length !== 2 || !pinch || !scroller) return;
        e.preventDefault();
        const distance = getTouchDistance(e.touches);
        if (!pinch.startDistance || !distance) return;
        const next = clampZoom(pinch.startZoom * (distance / pinch.startDistance));
        pinch.latestZoom = +next.toFixed(3);
        pinch.latestRatio = pinch.latestZoom / pinch.startZoom;
        zoomRef.current = pinch.latestZoom;
        if (zoomFrameRef.current) return;
        zoomFrameRef.current = requestAnimationFrame(() => {
            zoomFrameRef.current = null;
            const p = pinchRef.current;
            if (!p) return;
            applyFloorPlanZoomToNode(p.latestZoom);
            scroller.scrollLeft = (p.startScrollLeft + p.centerX) * p.latestRatio - p.centerX;
            scroller.scrollTop = (p.startScrollTop + p.centerY) * p.latestRatio - p.centerY;
        });
    };

    const handleFloorPlanTouchEnd = (e: React.TouchEvent) => {
        if (e.touches.length < 2) {
            setFloorPlanZoom(zoomRef.current);
            pinchRef.current = null;
        }
    };

    // ---- SVG click handler — EXACT PORT from mobile ----
    const handleExternalSvgClick = (event: React.MouseEvent) => {
        const unitNode = (event.target as Element)?.closest?.('[data-unit-id]');
        if (!unitNode) return;
        const unitId = Number(unitNode.getAttribute('data-unit-id'));
        const unit = units.find((u) => Number(u.id) === unitId);
        if (unit) setSelectedUnitId((prev) => (prev === unit.id ? null : unit.id));
    };

    // ---- Plan manager ----
    const openPlanManager = async () => {
        if (!selectedFloor?.id) {
            toast.error('Сначала выберите этаж');
            return;
        }
        try {
            setPlanFilesLoading(true);
            await loadFloorPlanDocument(selectedFloor.id, { createIfMissing: true });
            setPlanManagerOpen(true);
        } catch (e) {
            toast.error(`${e}`);
        } finally {
            setPlanFilesLoading(false);
        }
    };

    const handleUploadPlan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !selectedFloor?.id) return;
        if (!/\.svg$/i.test(file.name) && file.type !== 'image/svg+xml') {
            toast.error('Допускается только SVG-файл плана этажа');
            return;
        }
        try {
            setPlanFilesSaving(true);
            const { doc } = await loadFloorPlanDocument(selectedFloor.id, {
                createIfMissing: true,
            });
            if (!doc?.id) throw new Error('Документ этажа не создан');
            // await uploadPlanFile(doc.id, file);
            toast.success('SVG-план загружен');
            await loadFloorPlanAssets(selectedFloor.id);
            if (planManagerOpen) await loadFloorPlanDocument(selectedFloor.id);
        } catch (e) {
            toast.error(`${e}`);
        } finally {
            setPlanFilesSaving(false);
        }
    };

    const handleDeletePlanFile = async (fileId: number) => {
        if (!confirm('Удалить SVG-план этажа?')) return;
        try {
            await apiRequest(`/documentFiles/${fileId}`, 'DELETE');
            toast.success('План удалён');
            setFloorPlanSvgRaw('');
            if (selectedFloor?.id) {
                await loadFloorPlanAssets(selectedFloor.id);
                await loadFloorPlanDocument(selectedFloor.id);
            }
        } catch (e) {
            toast.error(`${e}`);
        }
    };

    const handleDownloadPlanFile = (file: DocFile) => {
        const raw = floorPlanSvgRaw;
        if (!raw) {
            toast.error('SVG недоступен');
            return;
        }
        const blob = new Blob([raw], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), {
            href: url,
            download: file.name || 'floor-plan.svg',
        });
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const floorPlanLimitReached = floorPlanFiles.length > 0;

    // ---- Helpers for unit panel ----
    const fmtArea = (v: string | null) => (v ? `${parseFloat(v).toFixed(1)} м²` : '—');
    const fmtPrice = (v: string | null) => {
        if (!v) return '—';
        const n = parseFloat(v);
        return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} млн` : n.toLocaleString('ru-RU');
    };

    // ---- Render ----
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            {/* ══ HEADER ══ */}
            <header className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
                <span className="hidden text-sm font-semibold text-gray-700 sm:block">
                    Планировка этажа
                </span>
                <span className="hidden text-gray-200 sm:block">/</span>

                {/* Project */}
                {/* <select
                    value={projectId}
                    onChange={(e) => {
                        const pid = +e.target.value;
                        setProjectId(pid);
                        const firstBlock = BLOCKS_DEF.find((b) => b.project_id === pid);
                        if (firstBlock) setBlockId(firstBlock.id);
                    }}
                    className="text-sm text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                >
                    {PROJECTS_DEF.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select> */}

                {/* Block */}
                {/* <select
                    value={blockId}
                    onChange={(e) => setBlockId(+e.target.value)}
                    className="text-sm text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                >
                    {projectBlocks.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select> */}

                {/* Floor selector */}
                {/* {floors.length > 0 && (
                    <div className="flex items-center flex-shrink-0 max-w-xs gap-1 overflow-x-auto">
                        {floors.slice(0, 15).map((f) => (
                            <button
                                key={f.id}
                                onClick={() => {
                                    setSelectedFloorId(f.id);
                                    setSelectedUnitId(null);
                                }}
                                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors flex-shrink-0 ${f.id === selectedFloorId ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {f.floor_number}
                            </button>
                        ))}
                        {floors.length > 15 && (
                            <select
                                value={selectedFloorId ?? ''}
                                onChange={(e) => {
                                    setSelectedFloorId(+e.target.value);
                                    setSelectedUnitId(null);
                                }}
                                className="px-2 py-1 text-xs text-gray-600 bg-gray-100 border-none rounded-lg focus:outline-none"
                            >
                                {floors.slice(15).map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.floor_number} эт.
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )} */}

                {/* <div className="flex-shrink-0 ml-auto">
                    <button
                        onClick={openPlanManager}
                        disabled={planFilesLoading || !selectedFloor}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-40"
                    >
                        <Upload size={14} />
                        {planFilesLoading ? 'Загрузка...' : 'SVG-план'}
                    </button>
                </div> */}
            </header>

            {/* ══ MAIN ══ */}
            <div className="flex flex-1 overflow-hidden">
                {/* ── SVG CANVAS ── */}
                <div className="relative flex flex-col flex-1 overflow-hidden">
                    {/* Floating controls bar */}
                    <div className="absolute z-10 flex items-center justify-between gap-2 pointer-events-none top-2 left-2 right-2">
                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-stone-200 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[11px] text-slate-700 shadow-sm pointer-events-auto">
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
                            {!floorPlanSvgRaw && (floorPlanDemo || renderedFloorPlanSvg) && (
                                <span className="border-l border-stone-200 pl-2.5 text-amber-500 font-medium">
                                    Demo
                                </span>
                            )}
                        </div>

                        {/* Zoom controls */}
                        {renderedFloorPlanSvg && (
                            <div className="flex items-center gap-0.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-stone-200 p-0.5 pointer-events-auto">
                                <button
                                    onClick={() => changeFloorPlanZoom(-0.1)}
                                    className="rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-100 active:scale-95 transition-transform"
                                >
                                    <Minus size={13} />
                                </button>
                                <button
                                    onClick={resetZoom}
                                    className="flex min-w-[56px] items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-transform"
                                >
                                    <RotateCcw size={11} />
                                    {Math.round(floorPlanZoom * 100)}%
                                </button>
                                <button
                                    onClick={() => changeFloorPlanZoom(0.1)}
                                    className="rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-100 active:scale-95 transition-transform"
                                >
                                    <Plus size={13} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Scroll + SVG container */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-auto bg-[#f8f5ef] pt-10"
                        style={{ touchAction: 'pan-x pan-y' }}
                        onWheel={handleWheel}
                        onTouchStart={handleFloorPlanTouchStart}
                        onTouchMove={handleFloorPlanTouchMove}
                        onTouchEnd={handleFloorPlanTouchEnd}
                        onTouchCancel={handleFloorPlanTouchEnd}
                    >
                        {loadingFloorPlan ? (
                            <div className="flex min-h-[400px] w-full items-center justify-center text-sm text-slate-500">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 border-2 rounded-full border-sky-400 border-t-transparent animate-spin" />
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
                            <div className="mx-auto flex min-h-[420px] w-full max-w-5xl items-center justify-center border border-dashed border-stone-300 bg-[#fcfbf7] m-4 rounded-xl text-center p-4">
                                <div className="max-w-sm space-y-3 text-slate-500">
                                    <div className="text-lg font-semibold text-slate-700">
                                        SVG-план не загружен
                                    </div>
                                    <div className="text-sm">
                                        Нажмите «SVG-план» в шапке, загрузите файл с зонами квартир.
                                        У каждой зоны должен быть{' '}
                                        <code className="px-1 text-xs rounded bg-slate-100">
                                            id
                                        </code>{' '}
                                        совпадающий с номером лота.
                                    </div>
                                    <button
                                        onClick={openPlanManager}
                                        className="px-4 py-2 mt-2 text-sm text-white transition-colors rounded-lg bg-sky-500 hover:bg-sky-600"
                                    >
                                        Загрузить SVG
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT PANEL: units ── */}
                <div className="flex flex-col flex-shrink-0 overflow-hidden bg-white border-l border-gray-200 w-60">
                    {/* Panel header */}
                    <div className="px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-800">
                                {selectedFloor ? getFloorLabel(selectedFloor) : 'Лоты'}
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {units.length}
                            </span>
                        </div>
                        {units.length > 0 && (
                            <div className="mt-2 flex h-1.5 rounded-full overflow-hidden gap-px">
                                {unitStatuses.map((st) => {
                                    const c = units.filter((u) => u.status_id === st.id).length;
                                    return c ? (
                                        <div
                                            key={st.id}
                                            style={{ flex: c, backgroundColor: st.color }}
                                            title={st.name}
                                        />
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>

                    {/* Selected unit card */}
                    {selectedUnit && (
                        <div className="flex-shrink-0 p-3 mx-3 my-2 border bg-sky-50 rounded-xl border-sky-100">
                            <div className="flex items-start justify-between gap-1 mb-1.5">
                                <span className="text-base font-bold text-sky-900">
                                    №{selectedUnit.unit_number}
                                </span>
                                <button
                                    onClick={() => setSelectedUnitId(null)}
                                    className="text-gray-300 hover:text-gray-500"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                            {(() => {
                                const st = statusMap.get(selectedUnit.status_id);
                                return (
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                                        style={{
                                            backgroundColor: (st?.color ?? '#999') + '18',
                                            borderColor: (st?.color ?? '#999') + '60',
                                            color: st?.color ?? '#666',
                                        }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: st?.color ?? '#999' }}
                                        />
                                        {st?.name ?? '—'}
                                    </span>
                                );
                            })()}
                            <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                                <div>
                                    <span className="block text-gray-400">Площадь</span>
                                    <span className="font-medium text-gray-800">
                                        {fmtArea(selectedUnit.area_total)}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-gray-400">Цена</span>
                                    <span className="font-medium text-gray-800">
                                        {fmtPrice(selectedUnit.price_total)}
                                    </span>
                                </div>
                                {selectedUnit.rooms && (
                                    <div>
                                        <span className="block text-gray-400">Комнат</span>
                                        <span className="font-medium text-gray-800">
                                            {selectedUnit.rooms}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <span className="block text-gray-400">Тип</span>
                                    <span className="font-medium text-gray-800 capitalize">
                                        {selectedUnit.lot_type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Unit list */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {units.length === 0 ? (
                            <div className="p-6 text-xs text-center text-gray-400">
                                Нет лотов на этом этаже
                            </div>
                        ) : (
                            units.map((unit) => {
                                const st = statusMap.get(unit.status_id);
                                const isSelected = unit.id === selectedUnitId;
                                return (
                                    <button
                                        key={unit.id}
                                        onClick={() =>
                                            setSelectedUnitId((p) =>
                                                p === unit.id ? null : unit.id,
                                            )
                                        }
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${isSelected ? 'bg-sky-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <span
                                            className="flex-shrink-0 w-2 h-2 rounded-full"
                                            style={{ backgroundColor: st?.color ?? '#d1d5db' }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div
                                                className={`text-sm font-medium truncate ${isSelected ? 'text-sky-700' : 'text-gray-800'}`}
                                            >
                                                №{unit.unit_number}
                                            </div>
                                            <div className="text-xs text-gray-400 truncate">
                                                {fmtArea(unit.area_total)}
                                            </div>
                                        </div>
                                        <span
                                            className="text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 font-medium"
                                            style={{
                                                backgroundColor: (st?.color ?? '#999') + '15',
                                                borderColor: (st?.color ?? '#999') + '40',
                                                color: st?.color ?? '#666',
                                            }}
                                        >
                                            {st?.name ?? '—'}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* ══ PLAN MANAGER MODAL ══ */}
            {planManagerOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
                    onClick={(e) => e.target === e.currentTarget && setPlanManagerOpen(false)}
                >
                    <div className="w-full max-w-md p-5 text-white bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <div className="text-lg font-semibold">Планы этажа</div>
                                <div className="mt-0.5 text-sm text-gray-400">
                                    {overview?.block?.name} · {getFloorLabel(selectedFloor)}
                                </div>
                            </div>
                            <button
                                onClick={() => setPlanManagerOpen(false)}
                                className="rounded-lg bg-gray-800 p-1.5 hover:bg-gray-700 text-gray-300"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Instruction */}
                        <div className="flex gap-2 p-3 mb-4 text-sm text-gray-300 border border-gray-700 rounded-xl bg-gray-800/60">
                            <Info size={14} className="flex-shrink-0 mt-0.5 text-blue-400" />
                            <span>
                                У зон в SVG должен быть <strong className="text-white">id</strong>,
                                совпадающий с <strong className="text-white">номером лота</strong>.
                                На этаж — один SVG. Для замены удалите старый.
                            </span>
                        </div>

                        {/* Upload button */}
                        <label
                            className={`mb-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${floorPlanLimitReached || planFilesSaving ? 'cursor-not-allowed bg-gray-700 opacity-60' : 'bg-blue-600 hover:bg-blue-500'} transition-colors`}
                        >
                            <Upload size={15} />
                            {floorPlanLimitReached
                                ? 'SVG уже загружен'
                                : planFilesSaving
                                  ? 'Загрузка...'
                                  : 'Загрузить SVG'}
                            <input
                                type="file"
                                accept=".svg,image/svg+xml"
                                className="hidden"
                                onChange={handleUploadPlan}
                                disabled={floorPlanLimitReached || planFilesSaving}
                            />
                        </label>

                        {/* File list */}
                        <div className="space-y-2">
                            {floorPlanFiles.length ? (
                                floorPlanFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="p-3 border border-gray-700 rounded-xl bg-gray-800/50"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-white truncate">
                                                    {file.name}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                                    <span className="rounded-full border border-gray-600 px-2 py-0.5">
                                                        SVG
                                                    </span>
                                                    <span>Активный план</span>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1.5">
                                                <button
                                                    onClick={() => handleDownloadPlanFile(file)}
                                                    className="p-2 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
                                                    title="Скачать"
                                                >
                                                    <Download size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePlanFile(file.id)}
                                                    className="p-2 transition-colors bg-red-700 rounded-lg hover:bg-red-600"
                                                    title="Удалить"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-sm text-center text-gray-500 border border-gray-700 border-dashed rounded-xl">
                                    Для этого этажа пока не загружен SVG-план
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
