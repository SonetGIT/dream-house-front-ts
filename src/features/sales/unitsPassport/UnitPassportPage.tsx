import { type ChangeEvent, type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    createDocument,
    type Document,
} from '@/features/projects/documents/documentsSlice';
import {
    deleteDocumentFile,
    downloadDocumentFile,
    uploadDocumentFile,
    type DocumentFile,
} from '@/features/projects/legal_department/files/documentFilesSlice';
import {
    clearSalesUnitPassport,
    fetchSalesUnitPassport,
    type SalesDeal,
    type SalesReservation,
} from '@/features/sales/slices/salesUnitPassportSlice';
import { fetchSalesClients } from '@/features/sales/slices/salesClientsSlice';
import { fetchSalesDealTypes } from '@/features/sales/slices/salesDictionariesSlice';
import { useReference } from '@/features/reference/useReference';
import { apiRequest } from '@/utils/apiRequest';
import {
    createPayment,
    fetchPaymentArticles,
    fetchPaymentTypes,
    paymentCounterpartyTypes,
} from '@/features/projects/payments/paymentSlice';
import { REPORT_BASE_URL } from '@/features/projects/pto/workPerformed/workPerformedTs/downloadWorkPerformedReport';
import { getToken } from '@/features/auth/getToken';
import { generateSalesPaymentSchedule } from '@/features/sales/slices/salesPaymentSchedulesSlice';
import UnitPassportHeader from './UnitPassportHeader';
import { UnitPassportHistoryPanel } from './UnitPassportHistoryPanel';
import { ObjectsOverviewUnitForm } from '../objectsOverviewUnits/ObjectsOverviewUnitForm';
import type { SalesUnit } from '../slices/salesUnitsSlice';
import {
    DealFilesModal,
    DealModal,
    PaymentModal,
    ReservationModal,
    ScheduleModal,
    type DealFormState,
    type PaymentFormState,
    type ReservationFormState,
    type ScheduleFormState,
} from './UnitPassportModals';

type UnitPassportPageProps = {
    unitId: number;
    onClose?: () => void;
};

type ReservationClientOption = {
    id: number;
    full_name?: string | null;
    phone?: string | null;
};

const UNIT_DOCUMENT_ENTITY_TYPE = 'salesUnit';
const UNIT_FILE_TYPES = ['2d', '3d'] as const;

type UnitFileType = (typeof UNIT_FILE_TYPES)[number];
type UnitPreviewTab = UnitFileType | 'files';
type UnitFilesState = Record<
    UnitFileType,
    {
        documentId: number | null;
        files: DocumentFile[];
    }
>;
type UnitPreviewAsset = {
    file: DocumentFile;
    url: string;
};
type UnitPreviewGroups = Record<UnitFileType, UnitPreviewAsset[]>;

const EMPTY_UNIT_FILES: UnitFilesState = {
    '2d': {
        documentId: null,
        files: [],
    },
    '3d': {
        documentId: null,
        files: [],
    },
};
const EMPTY_UNIT_PREVIEW_GROUPS: UnitPreviewGroups = {
    '2d': [],
    '3d': [],
};

const getUnitFileDocumentMeta = (
    kind: UnitFileType,
    unitNumber: string | number | undefined,
    unitId: number,
) => {
    const title = kind === '2d' ? '2D План' : '3D План';
    const marker = `unit-file:${kind}`;

    return {
        title,
        marker,
        name: `${title} квартиры №${unitNumber || unitId}`,
        description: `${marker}; Материалы квартиры №${unitNumber || unitId}`,
    };
};

const isMatchingUnitFileDocument = (doc: Document, kind: UnitFileType) => {
    const marker = `unit-file:${kind}`;
    const docName = String(doc.name || '').toLowerCase();
    const docDescription = String(doc.description || '').toLowerCase();
    const aliases =
        kind === '2d'
            ? ['2d', '2d файл', '2d-файл', '2d план', '2d-план', '2d plan']
            : ['3d', '3d файл', '3d-файл', '3d план', '3d-план', '3d plan'];

    return (
        docDescription.includes(marker) ||
        aliases.some((alias) => docName.includes(alias) || docDescription.includes(alias))
    );
};

const isLegacyUnitFilesDocument = (doc: Document) => {
    const docName = String(doc.name || '').toLowerCase();
    const docDescription = String(doc.description || '').toLowerCase();

    return (
        docName.includes('файлы лота') ||
        docName.includes('файлы квартиры') ||
        docDescription.includes('планы и визуализации квартиры') ||
        docDescription.includes('материалы квартиры')
    );
};

const isImageFile = (file: DocumentFile) => {
    const mimeType = String(file.mime_type || '').toLowerCase();
    const fileName = String(file.name || '').toLowerCase();

    return (
        mimeType.startsWith('image/') ||
        /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(fileName)
    );
};

const getUnitFileKind = (file: DocumentFile): UnitFileType => {
    const name = String(file.name || '').toLowerCase();

    if (name.includes('3d') || name.includes('render') || name.includes('рендер')) {
        return '3d';
    }

    return '2d';
};

const fetchDocumentFilesDirect = async (documentId: number) => {
    const response = await apiRequest<DocumentFile[]>(`/documentFiles/files/${documentId}`, 'GET');
    return response.data || [];
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

const EMPTY_RESERVATION_FORM: ReservationFormState = {
    client_id: '',
    start_at: '',
    expires_at: '',
    reservation_amount: '',
    currency: '',
    comment: '',
};

const EMPTY_PAYMENT_FORM: PaymentFormState = {
    deal_id: '',
    reservation_id: '',
    client_id: '',
    title: '',
    amount: '',
    currency: '',
    planned_date: '',
    paid_date: '',
};

const EMPTY_DEAL_FORM: DealFormState = {
    client_id: '',
    reservation_id: '',
    deal_type_id: '',
    contract_number: '',
    contract_date: '',
    payment_type: '',
    total_amount: '',
    currency: '',
    note: '',
};

const EMPTY_SCHEDULE_FORM: ScheduleFormState = {
    deal_id: '',
    start_date: '',
    payments_count: '',
    interval_months: '1',
    payment_day: '',
    first_payment_amount: '',
    total_amount: '',
    comment: '',
};

const toDateInput = (value?: string | Date | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
};

const toNullableNumber = (value: string) => {
    const normalized = String(value || '')
        .trim()
        .replace(',', '.');

    if (!normalized) return null;

    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : null;
};

const getFileNameFromContentDisposition = (contentDisposition: string | null, fallback: string) => {
    if (!contentDisposition) return fallback;

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        try {
            return decodeURIComponent(utf8Match[1]);
        } catch {
            return utf8Match[1];
        }
    }

    const regularMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    return regularMatch?.[1] || fallback;
};

const getMonthDiff = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 1;

    const diff =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());

    return Math.max(diff || 1, 1);
};

const getSalesReportBaseUrls = () => {
    const candidates = [REPORT_BASE_URL];

    [import.meta.env.VITE_BASE_URL as string | undefined, window.location.origin].forEach(
        (value) => {
            if (!value) return;

            try {
                const url = new URL(value);
                candidates.push(`${url.protocol}//${url.hostname}:8080`);
            } catch {
                // Ignore malformed runtime URL values.
            }
        },
    );

    return Array.from(new Set(candidates.filter(Boolean)));
};

const statusTextHas = (reservation: SalesReservation | null | undefined, parts: string[]) => {
    const values = [reservation?.status_ref?.name, reservation?.status_ref?.code].map((value) =>
        String(value || '').toLowerCase(),
    );

    return parts.some((part) => values.some((value) => value.includes(part)));
};

const isReservationActiveOrConfirmed = (
    reservation: SalesReservation,
    activeStatusId: number,
) => {
    if (reservation.confirmed_at) return true;
    if (Number(reservation.status) === Number(activeStatusId)) return true;

    return statusTextHas(reservation, ['active', 'confirm', 'confirmed', 'Р°РєС‚РёРІ', 'РїРѕРґС‚РІРµСЂР¶']);
};

const isReservationActiveOnly = (
    reservation: SalesReservation,
    activeStatusId: number,
) => {
    if (reservation.confirmed_at) return false;
    if (Number(reservation.status) === Number(activeStatusId)) return true;

    return statusTextHas(reservation, ['active', 'Р°РєС‚РёРІ']);
};
const statusTextHasDeal = (deal: SalesDeal | null | undefined, parts: string[]) => {
    const values = [deal?.status_ref?.name, deal?.status_ref?.code].map((value) =>
        String(value || '').toLowerCase(),
    );

    return parts.some((part) => values.some((value) => value.includes(part)));
};

export function InlineMetric({
    icon,
    label,
    value,
    tone,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    tone: 'blue' | 'green' | 'orange' | 'slate';
}) {
    const toneMap = {
        blue: 'bg-blue-50 text-blue-800',
        green: 'bg-emerald-50 text-emerald-800',
        orange: 'bg-orange-50 text-orange-800',
        slate: 'bg-violet-50 text-violet-800',
    };

    return (
        <div className="flex items-center min-w-0 gap-2 px-2 py-2 bg-white border rounded-xl border-stone-200">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${toneMap[tone]}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <div className="text-[12px] leading-none text-slate-500">
                    {label}:{' '}
                    <span className="mt-1 text-sm font-semibold truncate text-slate-700">
                        {value}{' '}
                    </span>
                </div>
            </div>
        </div>
    );
}
/******************************************************************************************************************/
export function UnitPassportPage({ unitId, onClose }: UnitPassportPageProps) {
    const dispatch = useAppDispatch();

    const { unit, clients, reservations, deals, loading, error } = useAppSelector(
        (state) => state.salesUnitPassport,
    );
    const { unitStatuses, finishTypes, dealTypes } = useAppSelector(
        (state) => state.salesDictionaries,
    );
    const salesClients = useAppSelector((state) => state.salesClients?.items ?? []);
    const paymentTypes = useAppSelector((state) => state.payments?.types ?? []);
    const paymentArticles = useAppSelector((state) => state.payments?.articles ?? []);
    const counterpartyTypes = useAppSelector((state) => state.payments?.counterpartyTypes ?? []);
    const currenciesRef = useReference('currencies');
    const reservationStatusesRef = useReference('reservationStatuses');
    const dealStatusesRef = useReference('dealStatuses');
    const dealPaymentTypesRef = useReference('dealPaymentTypes');
    const currencies = useMemo(() => currenciesRef.data ?? [], [currenciesRef.data]);
    const reservationStatuses = useMemo(
        () => reservationStatusesRef.data ?? [],
        [reservationStatusesRef.data],
    );
    const dealStatuses = useMemo(() => dealStatusesRef.data ?? [], [dealStatusesRef.data]);
    const dealPaymentTypes = useMemo(
        () => dealPaymentTypesRef.data ?? [],
        [dealPaymentTypesRef.data],
    );

    useEffect(() => {
        if (!unitId) return;

        void dispatch(fetchSalesUnitPassport(unitId));
        void dispatch(fetchSalesClients({ page: 1, size: 200 }));
        void dispatch(fetchSalesDealTypes());
        void dispatch(fetchPaymentTypes());
        void dispatch(fetchPaymentArticles());
        void dispatch(paymentCounterpartyTypes());

        return () => {
            dispatch(clearSalesUnitPassport());
        };
    }, [dispatch, unitId]);
    const [editUnitOpen, setEditUnitOpen] = useState(false);
    const [reservationModalOpen, setReservationModalOpen] = useState(false);
    const [dealModalOpen, setDealModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [dealFilesOpen, setDealFilesOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [filesLoading, setFilesLoading] = useState(false);
    const [unitFilesLoading, setUnitFilesLoading] = useState(false);
    const [unitFiles, setUnitFiles] = useState<UnitFilesState>(EMPTY_UNIT_FILES);
    const [unitPreviewLoading, setUnitPreviewLoading] = useState(false);
    const [unitPreviewTab, setUnitPreviewTab] = useState<UnitPreviewTab>('2d');
    const [unitPreviewOpen, setUnitPreviewOpen] = useState(false);
    const [unitPreviewGroups, setUnitPreviewGroups] =
        useState<UnitPreviewGroups>(EMPTY_UNIT_PREVIEW_GROUPS);
    const [resForm, setResForm] = useState<ReservationFormState>(EMPTY_RESERVATION_FORM);
    const [dealForm, setDealForm] = useState<DealFormState>(EMPTY_DEAL_FORM);
    const [paymentForm, setPaymentForm] = useState<PaymentFormState>(EMPTY_PAYMENT_FORM);
    const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>(EMPTY_SCHEDULE_FORM);
    const [editingReservation, setEditingReservation] = useState<SalesReservation | null>(null);
    const [editingDeal, setEditingDeal] = useState<SalesDeal | null>(null);
    const [dealFilesContext, setDealFilesContext] = useState<{
        deal: SalesDeal | null;
        documentId: number | null;
        files: DocumentFile[];
    }>({
        deal: null,
        documentId: null,
        files: [],
    });
    const prjName = useReference('projects');
    const blokName = useReference('projectBlocks');
    const refs = { prjName, blokName };
    const defaultCurrencyId = useMemo(() => {
        const kgs = currencies.find((item) => String(item.name || '').toUpperCase() === 'KGS');
        return String(kgs?.id || currencies[0]?.id || '');
    }, [currencies]);
    const activeReservationStatusId = useMemo(() => {
        const match = reservationStatuses.find((item) => {
            const name = String(item.name || '').toLowerCase();
            const code = String(item.code || '').toLowerCase();

            return (
                code.includes('active') ||
                name.includes('active') ||
                name.includes('Р°РєС‚РёРІ')
            );
        });

        return Number(match?.id || 2);
    }, [reservationStatuses]);
    const canceledReservationStatusId = useMemo(() => {
        const match = reservationStatuses.find((item) => {
            const name = String(item.name || '').toLowerCase();
            const code = String(item.code || '').toLowerCase();

            return (
                code.includes('cancel') ||
                code.includes('canceled') ||
                name.includes('РѕС‚РјРµРЅ') ||
                name.includes('СЃРЅСЏС‚')
            );
        });

        return Number(match?.id || 3);
    }, [reservationStatuses]);
    const blockingReservation = useMemo(
        () =>
            reservations.find((reservation) =>
                isReservationActiveOrConfirmed(reservation, activeReservationStatusId),
            ) || null,
        [activeReservationStatusId, reservations],
    );
    const incomePaymentType = useMemo(
        () => paymentTypes.find((item) => item.code === 'income') || paymentTypes[0] || null,
        [paymentTypes],
    );
    const salePaymentArticle = useMemo(
        () =>
            paymentArticles.find((item) => item.code === 'sale_apartment_income') ||
            paymentArticles.find(
                (item) => Number(item.payment_type) === Number(incomePaymentType?.id),
            ) ||
            paymentArticles[0] ||
            null,
        [incomePaymentType?.id, paymentArticles],
    );
    const clientCounterpartyType = useMemo(
        () => counterpartyTypes.find((item) => item.code === 'client') || counterpartyTypes[0] || null,
        [counterpartyTypes],
    );
    const getDealStatusIdByKey = (key: 'draft' | 'active' | 'signed' | 'closed' | 'canceled') => {
        const keywords = {
            draft: ['draft', 'С‡РµСЂРЅРѕРІ'],
            active: ['active', 'Р°РєС‚РёРІ'],
            signed: ['signed', 'РїРѕРґРїРёСЃ'],
            closed: ['closed', 'Р·Р°РєСЂС‹'],
            canceled: ['cancel', 'РѕС‚РјРµРЅ'],
        };
        const match = dealStatuses.find((item) => {
            const values = [item?.name, item?.code].map((value) =>
                String(value || '').toLowerCase(),
            );
            return keywords[key].some((part) => values.some((value) => value.includes(part)));
        });
        const fallback = { draft: 1, active: 2, signed: 3, closed: 4, canceled: 5 };
        return Number(match?.id || fallback[key] || 0);
    };
    const getDealStatusKey = (deal: SalesDeal | null | undefined) => {
        if (!deal) return '';
        const id = Number(deal.status || 0);
        if (statusTextHasDeal(deal, ['draft', 'С‡РµСЂРЅРѕРІ']) || id === 1) return 'draft';
        if (statusTextHasDeal(deal, ['active', 'Р°РєС‚РёРІ']) || id === 2) return 'active';
        if (statusTextHasDeal(deal, ['signed', 'РїРѕРґРїРёСЃ']) || id === 3) return 'signed';
        if (statusTextHasDeal(deal, ['closed', 'Р·Р°РєСЂС‹']) || id === 4) return 'closed';
        if (statusTextHasDeal(deal, ['canceled', 'cancel', 'РѕС‚РјРµРЅ']) || id === 5)
            return 'canceled';
        return '';
    };
    const isDealDraft = (deal: SalesDeal) => getDealStatusKey(deal) === 'draft';
    const getPreferredDealTypeId = () => {
        const match = dealTypes.find((type) => {
            const code = String(type.code || '').toLowerCase();
            const name = String(type.name || '').toLowerCase();
            return (
                ['buyout', 'sale', 'regular'].includes(code) ||
                ['РІС‹РєСѓРї', 'РѕР±С‹С‡', 'РїСЂРѕРґР°Р¶'].some((part) => name.includes(part))
            );
        });
        return String(match?.id || dealTypes[0]?.id || '');
    };
    const getPreferredDealPaymentTypeId = () => {
        const match = dealPaymentTypes.find((type) => {
            const name = String(type.name || '').toLowerCase();
            return ['РїРѕР»', 'РІС‹РєСѓРї', 'РµРґРёРЅ', 'РЅР°Р»'].some((part) => name.includes(part));
        });
        return String(match?.id || dealPaymentTypes[0]?.id || '');
    };
    const getReservationStatusName = (reservation: SalesReservation) =>
        reservation.status_ref?.name || 'Р‘СЂРѕРЅСЊ';
    const dealReservationOptions = useMemo(() => {
        const selectedClientId = Number(dealForm.client_id || 0);
        const selectedReservationId = Number(
            dealForm.reservation_id || editingDeal?.reservation_id || 0,
        );

        return reservations.filter((reservation) => {
            const sameClient = selectedClientId
                ? Number(reservation.client_id) === selectedClientId
                : true;
            const isCurrentReservation = Number(reservation.id) === selectedReservationId;

            return (
                sameClient &&
                (isReservationActiveOnly(reservation, activeReservationStatusId) ||
                    isCurrentReservation)
            );
        });
    }, [
        activeReservationStatusId,
        dealForm.client_id,
        dealForm.reservation_id,
        editingDeal?.reservation_id,
        reservations,
    ]);
    const clientOptions = useMemo(() => {
        const map = new Map<number, ReservationClientOption>();

        salesClients.forEach((client) => {
            map.set(Number(client.id), {
                id: client.id,
                full_name: client.full_name,
                phone: client.phone,
            });
        });

        clients.forEach((client) => {
            map.set(Number(client.id), {
                id: client.id,
                full_name: client.full_name,
                phone: client.phone,
            });
        });

        return Array.from(map.values()).sort((a, b) =>
            String(a.full_name || a.phone || '').localeCompare(
                String(b.full_name || b.phone || ''),
                'ru',
            ),
        );
    }, [clients, salesClients]);
    const getClientName = (clientId: number | string | null | undefined) => {
        const client = clientOptions.find((item) => Number(item.id) === Number(clientId));
        return client?.full_name || client?.phone || 'РљР»РёРµРЅС‚';
    };
    const getDealSchedules = (dealId: number) =>
        deals.find((deal) => Number(deal.id) === Number(dealId))?.payment_schedules ?? [];
    const loadUnitFiles = useCallback(async () => {
        if (!unit?.id) {
            setUnitFiles(EMPTY_UNIT_FILES);
            return;
        }

        setUnitFilesLoading(true);
        try {
            const docs = await searchDocumentsDirect({
                entity_type: UNIT_DOCUMENT_ENTITY_TYPE,
                entity_id: unit.id,
                page: 1,
                size: 50,
            });
            const nextState: UnitFilesState = {
                '2d': { documentId: null, files: [] },
                '3d': { documentId: null, files: [] },
            };
            const filesByKind = {
                '2d': new Map<number, DocumentFile>(),
                '3d': new Map<number, DocumentFile>(),
            };
            const matchedKindDocs: Partial<Record<UnitFileType, Document | null>> = {
                '2d': null,
                '3d': null,
            };

            for (const kind of UNIT_FILE_TYPES) {
                const matchedDoc = docs.find((doc) => isMatchingUnitFileDocument(doc, kind));
                matchedKindDocs[kind] = matchedDoc || null;

                if (matchedDoc?.id) {
                    const files = await fetchDocumentFilesDirect(matchedDoc.id);

                    nextState[kind].documentId = matchedDoc.id;
                    files.forEach((file) => filesByKind[kind].set(file.id, file));
                }
            }

            const legacyDocs = docs.filter(
                (doc) =>
                    isLegacyUnitFilesDocument(doc) &&
                    !UNIT_FILE_TYPES.some(
                        (kind) => Number(matchedKindDocs[kind]?.id) === Number(doc.id),
                    ),
            );

            for (const legacyDoc of legacyDocs) {
                if (!legacyDoc.id) continue;

                const files = await fetchDocumentFilesDirect(legacyDoc.id);

                files.forEach((file) => {
                    filesByKind[getUnitFileKind(file)].set(file.id, file);
                });
            }

            nextState['2d'].files = Array.from(filesByKind['2d'].values());
            nextState['3d'].files = Array.from(filesByKind['3d'].values());
            setUnitFiles(nextState);
        } catch (loadError) {
            toast.error(
                loadError instanceof Error
                    ? loadError.message
                    : 'РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ 2D/3D С„Р°Р№Р»С‹ РєРІР°СЂС‚РёСЂС‹',
            );
        } finally {
            setUnitFilesLoading(false);
        }
    }, [unit?.id]);
    const getOrCreateUnitFileDocument = useCallback(
        async (kind: UnitFileType) => {
            if (!unit?.id) {
                throw new Error('РљРІР°СЂС‚РёСЂР° РЅРµ РЅР°Р№РґРµРЅР°');
            }

            const docs = await searchDocumentsDirect({
                entity_type: UNIT_DOCUMENT_ENTITY_TYPE,
                entity_id: unit.id,
                page: 1,
                size: 50,
            });

            const existingDocument = docs.find((doc) =>
                isMatchingUnitFileDocument(doc, kind),
            );
            if (existingDocument?.id) {
                return existingDocument;
            }

            const meta = getUnitFileDocumentMeta(kind, unit.unit_number, unit.id);
            return await dispatch(
                createDocument({
                    entity_type: UNIT_DOCUMENT_ENTITY_TYPE,
                    entity_id: unit.id,
                    name: meta.name,
                    description: meta.description,
                    status: 1,
                }),
            ).unwrap();
        },
        [dispatch, unit?.id, unit?.unit_number],
    );

    useEffect(() => {
        if (!unit?.id) {
            setUnitFiles(EMPTY_UNIT_FILES);
            return;
        }

        void loadUnitFiles();
    }, [loadUnitFiles, unit?.id]);

    useEffect(() => {
        let disposed = false;
        const objectUrls: string[] = [];

        const loadUnitPreviews = async () => {
            const imageFilesExist = UNIT_FILE_TYPES.some((kind) =>
                unitFiles[kind].files.some(isImageFile),
            );

            if (!imageFilesExist) {
                setUnitPreviewGroups(EMPTY_UNIT_PREVIEW_GROUPS);
                setUnitPreviewLoading(false);
                setUnitPreviewOpen(false);
                setUnitPreviewTab('files');
                return;
            }

            setUnitPreviewLoading(true);
            try {
                const nextGroups: UnitPreviewGroups = {
                    '2d': [],
                    '3d': [],
                };

                for (const kind of UNIT_FILE_TYPES) {
                    const imageFiles = unitFiles[kind].files.filter(isImageFile);

                    for (const file of imageFiles) {
                        const response = await apiRequest<Blob>(
                            `/documentFiles/download/${file.id}`,
                            'GET',
                        );
                        const url = window.URL.createObjectURL(response.data);
                        objectUrls.push(url);
                        nextGroups[kind].push({ file, url });
                    }
                }

                if (disposed) return;

                setUnitPreviewGroups(nextGroups);
                setUnitPreviewTab((prev) => {
                    if (prev === 'files') return prev;
                    if (nextGroups[prev].length > 0) return prev;
                    if (nextGroups['2d'].length > 0) return '2d';
                    if (nextGroups['3d'].length > 0) return '3d';
                    return 'files';
                });
            } catch (previewError) {
                if (disposed) return;

                setUnitPreviewGroups(EMPTY_UNIT_PREVIEW_GROUPS);
                toast.error(
                    previewError instanceof Error
                        ? previewError.message
                        : 'Не удалось загрузить превью 2D/3D файла',
                );
            } finally {
                if (!disposed) {
                    setUnitPreviewLoading(false);
                }
            }
        };

        void loadUnitPreviews();

        return () => {
            disposed = true;
            objectUrls.forEach((url) => window.URL.revokeObjectURL(url));
        };
    }, [unitFiles]);

    const handleUploadUnitFile = async (
        kind: UnitFileType,
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        setUnitFilesLoading(true);
        try {
            const document = await getOrCreateUnitFileDocument(kind);
            await dispatch(
                uploadDocumentFile({
                    documentId: document.id,
                    file,
                }),
            ).unwrap();

            await loadUnitFiles();
            setUnitPreviewTab(kind);
            setUnitPreviewOpen(true);
            const meta = getUnitFileDocumentMeta(kind, unit?.unit_number, unit?.id || unitId);
            toast.success(`${meta.title} Р·Р°РіСЂСѓР¶РµРЅ`);
        } catch (uploadError) {
            toast.error(
                uploadError instanceof Error
                    ? uploadError.message
                    : 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё С„Р°Р№Р»Р° РєРІР°СЂС‚РёСЂС‹',
            );
        } finally {
            setUnitFilesLoading(false);
        }
    };
    const handleDownloadUnitFile = async (file: DocumentFile) => {
        try {
            await dispatch(
                downloadDocumentFile({
                    file_id: file.id,
                    filename: file.name || `file-${file.id}`,
                }),
            ).unwrap();
        } catch (downloadError) {
            toast.error(
                downloadError instanceof Error
                    ? downloadError.message
                    : 'РћС€РёР±РєР° СЃРєР°С‡РёРІР°РЅРёСЏ С„Р°Р№Р»Р°',
            );
        }
    };
    const handleDeleteUnitFile = async (kind: UnitFileType, fileId: number) => {
        if (!window.confirm('РЈРґР°Р»РёС‚СЊ С„Р°Р№Р»?')) return;

        setUnitFilesLoading(true);
        try {
            await dispatch(deleteDocumentFile(fileId)).unwrap();
            await loadUnitFiles();

            const meta = getUnitFileDocumentMeta(kind, unit?.unit_number, unit?.id || unitId);
            toast.success(`${meta.title} СѓРґР°Р»РµРЅ`);
        } catch (deleteError) {
            toast.error(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ С„Р°Р№Р»Р°',
            );
        } finally {
            setUnitFilesLoading(false);
        }
    };
    const currentPreviewKind: UnitFileType = unitPreviewTab === '3d' ? '3d' : '2d';
    const currentPreviewAssets = unitPreviewGroups[currentPreviewKind] ?? [];
    const currentPreviewAsset = currentPreviewAssets[0] ?? null;
    const handleUnitPreviewTabChange = (tab: UnitPreviewTab) => {
        setUnitPreviewTab(tab);
        setUnitPreviewOpen(tab !== 'files');
    };
    const refreshPassport = async () => {
        await dispatch(fetchSalesUnitPassport(unitId));
    };
    const openCreateReservation = (payload?: { client_id?: number | null }) => {
        if (blockingReservation) {
            toast.error('РџРѕ СЌС‚РѕРјСѓ Р»РѕС‚Сѓ СѓР¶Рµ РµСЃС‚СЊ Р°РєС‚РёРІРЅР°СЏ РёР»Рё РїРѕРґС‚РІРµСЂР¶РґРµРЅРЅР°СЏ Р±СЂРѕРЅСЊ');
            return;
        }

        setEditingReservation(null);
        setResForm({
            ...EMPTY_RESERVATION_FORM,
            client_id: payload?.client_id ? String(payload.client_id) : '',
            start_at: toDateInput(new Date()),
            currency: defaultCurrencyId,
        });
        setReservationModalOpen(true);
    };
    const openEditReservation = (reservation: SalesReservation) => {
        if (!isReservationActiveOnly(reservation, activeReservationStatusId)) {
            toast.error('Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ Р±СЂРѕРЅСЊ РјРѕР¶РЅРѕ С‚РѕР»СЊРєРѕ РєРѕРіРґР° СЃС‚Р°С‚СѓСЃ Р°РєС‚РёРІРЅС‹Р№');
            return;
        }

        setEditingReservation(reservation);
        setResForm({
            client_id: reservation.client_id ? String(reservation.client_id) : '',
            start_at: toDateInput(reservation.start_at),
            expires_at: toDateInput(reservation.expires_at),
            reservation_amount:
                reservation.reservation_amount === null ||
                reservation.reservation_amount === undefined
                    ? ''
                    : String(reservation.reservation_amount),
            currency: reservation.currency
                ? String(reservation.currency)
                : unit?.currency
                  ? String(unit.currency)
                  : defaultCurrencyId,
            comment: reservation.comment || '',
        });
        setReservationModalOpen(true);
    };
    const handleReservationChange = (patch: Partial<ReservationFormState>) => {
        setResForm((prev) => ({ ...prev, ...patch }));
    };
    const openCreateDeal = (payload?: { client_id?: number | null; reservation_id?: number | null }) => {
        const selectedReservation = payload?.reservation_id
            ? reservations.find((item) => Number(item.id) === Number(payload.reservation_id)) ||
              null
            : null;
        const nextClientId = payload?.client_id ?? selectedReservation?.client_id ?? null;

        setEditingDeal(null);
        setDealForm({
            ...EMPTY_DEAL_FORM,
            client_id: nextClientId ? String(nextClientId) : '',
            reservation_id: payload?.reservation_id ? String(payload.reservation_id) : '',
            deal_type_id: getPreferredDealTypeId(),
            contract_date: toDateInput(new Date()),
            payment_type: getPreferredDealPaymentTypeId(),
            total_amount:
                unit?.price_total === null || unit?.price_total === undefined
                    ? ''
                    : String(unit.price_total),
            currency: unit?.currency ? String(unit.currency) : defaultCurrencyId,
            note: '\u0412\u044b\u043a\u0443\u043f \u043a\u0432\u0430\u0440\u0442\u0438\u0440\u044b',
        });
        setDealModalOpen(true);
    };
    const openEditDeal = (deal: SalesDeal) => {
        if (!isDealDraft(deal)) {
            toast.error(
                '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u0434\u0435\u043b\u043a\u0443 \u043c\u043e\u0436\u043d\u043e \u0442\u043e\u043b\u044c\u043a\u043e \u0441\u043e \u0441\u0442\u0430\u0442\u0443\u0441\u043e\u043c "\u0427\u0435\u0440\u043d\u043e\u0432\u0438\u043a"',
            );
            return;
        }

        setEditingDeal(deal);
        setDealForm({
            client_id: deal.client_id ? String(deal.client_id) : '',
            reservation_id: deal.reservation_id ? String(deal.reservation_id) : '',
            deal_type_id: deal.deal_type_id ? String(deal.deal_type_id) : '',
            contract_number: deal.contract_number || '',
            contract_date: toDateInput(deal.contract_date),
            payment_type: deal.payment_type ? String(deal.payment_type) : '',
            total_amount:
                deal.total_amount === null || deal.total_amount === undefined
                    ? ''
                    : String(deal.total_amount),
            currency: deal.currency ? String(deal.currency) : defaultCurrencyId,
            note: deal.note || '',
        });
        setDealModalOpen(true);
    };
    const handleDealChange = (patch: Partial<DealFormState>) => {
        setDealForm((prev) => {
            const next = { ...prev, ...patch };

            if (Object.prototype.hasOwnProperty.call(patch, 'client_id') && next.reservation_id) {
                const selectedReservation =
                    reservations.find(
                        (reservation) =>
                            Number(reservation.id) === Number(next.reservation_id),
                    ) || null;

                if (
                    selectedReservation &&
                    Number(selectedReservation.client_id) !== Number(next.client_id || 0)
                ) {
                    next.reservation_id = '';
                }
            }

            return next;
        });
    };
    const saveDeal = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!unit?.id) return;

        setActionLoading(true);
        try {
            const selectedReservation = dealForm.reservation_id
                ? reservations.find(
                      (reservation) => Number(reservation.id) === Number(dealForm.reservation_id),
                  ) || null
                : null;

            if (!dealForm.client_id) {
                throw new Error(
                    '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u043b\u0438\u0435\u043d\u0442\u0430',
                );
            }

            if (editingDeal && !isDealDraft(editingDeal)) {
                throw new Error(
                    '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u0434\u0435\u043b\u043a\u0443 \u043c\u043e\u0436\u043d\u043e \u0442\u043e\u043b\u044c\u043a\u043e \u0441\u043e \u0441\u0442\u0430\u0442\u0443\u0441\u043e\u043c "\u0427\u0435\u0440\u043d\u043e\u0432\u0438\u043a"',
                );
            }

            if (
                selectedReservation &&
                !isReservationActiveOnly(selectedReservation, activeReservationStatusId) &&
                Number(selectedReservation.id) !== Number(editingDeal?.reservation_id || 0)
            ) {
                throw new Error(
                    '\u041d\u043e\u0432\u044b\u0439 \u0432\u044b\u043a\u0443\u043f \u043c\u043e\u0436\u043d\u043e \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u0442\u043e\u043b\u044c\u043a\u043e \u043f\u043e \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0439 \u0431\u0440\u043e\u043d\u0438',
                );
            }

            const payload = {
                unit_id: Number(unit.id),
                client_id: Number(dealForm.client_id),
                reservation_id: dealForm.reservation_id ? Number(dealForm.reservation_id) : null,
                deal_type_id: dealForm.deal_type_id ? Number(dealForm.deal_type_id) : null,
                status: Number(editingDeal?.status || getDealStatusIdByKey('draft')),
                deal_number: editingDeal?.deal_number || null,
                contract_number: dealForm.contract_number.trim() || null,
                contract_date: dealForm.contract_date || null,
                payment_type: dealForm.payment_type ? Number(dealForm.payment_type) : null,
                total_amount: toNullableNumber(dealForm.total_amount),
                currency: dealForm.currency ? Number(dealForm.currency) : null,
                note: dealForm.note.trim() || null,
                canceled_reason: editingDeal?.canceled_reason || null,
            };

            if (editingDeal?.id) {
                await apiRequest(`/sales/deals/update/${editingDeal.id}`, 'PUT', payload);
            } else {
                await apiRequest('/sales/deals/create', 'POST', payload);
            }

            toast.success(
                editingDeal
                    ? '\u0414\u043e\u0433\u043e\u0432\u043e\u0440 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d'
                    : '\u0414\u043e\u0433\u043e\u0432\u043e\u0440 \u0441\u043e\u0437\u0434\u0430\u043d',
            );
            setDealModalOpen(false);
            setEditingDeal(null);
            setDealForm(EMPTY_DEAL_FORM);
            await refreshPassport();
        } catch (saveError) {
            toast.error(
                saveError instanceof Error
                    ? saveError.message
                    : '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u0434\u043e\u0433\u043e\u0432\u043e\u0440\u0430',
            );
        } finally {
            setActionLoading(false);
        }
    };
    const changeDealStatus = async (deal: SalesDeal, nextStatus: 'signed' | 'canceled') => {
        if (!deal?.id || !unit?.id) return;

        if (nextStatus === 'signed' && !String(deal.contract_number || '').trim()) {
            toast.error(
                '\u0414\u043b\u044f \u043f\u043e\u0434\u043f\u0438\u0441\u0430\u043d\u0438\u044f \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u0443\u043a\u0430\u0436\u0438\u0442\u0435 \u043d\u043e\u043c\u0435\u0440 \u0434\u043e\u0433\u043e\u0432\u043e\u0440\u0430',
            );
            return;
        }

        setActionLoading(true);
        try {
            await apiRequest(`/sales/deals/update/${deal.id}`, 'PUT', {
                status: getDealStatusIdByKey(nextStatus),
                canceled_reason:
                    nextStatus === 'canceled'
                        ? deal.canceled_reason || 'РћС‚РјРµРЅРµРЅРѕ РёР· РїР°СЃРїРѕСЂС‚Р° Р»РѕС‚Р°'
                        : null,
            });

            if (editingDeal?.id === deal.id) {
                setDealModalOpen(false);
                setEditingDeal(null);
                setDealForm(EMPTY_DEAL_FORM);
            }

            toast.success(
                nextStatus === 'signed'
                    ? '\u0414\u043e\u0433\u043e\u0432\u043e\u0440 \u043f\u043e\u0434\u043f\u0438\u0441\u0430\u043d'
                    : '\u0414\u043e\u0433\u043e\u0432\u043e\u0440 \u043e\u0442\u043c\u0435\u043d\u0435\u043d',
            );
            await refreshPassport();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : nextStatus === 'signed'
                      ? 'РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕРґРїРёСЃР°С‚СЊ РґРѕРіРѕРІРѕСЂ'
                      : 'РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РјРµРЅРёС‚СЊ РґРѕРіРѕРІРѕСЂ',
            );
        } finally {
            setActionLoading(false);
        }
    };
    const getOrCreateDealDocument = async (deal: SalesDeal) => {
        const docs = await searchDocumentsDirect({
            entity_type: 'salesDeal',
            entity_id: deal.id,
            page: 1,
            size: 1,
        });

        const existingDocument = docs[0];
        if (existingDocument?.id) {
            return existingDocument;
        }

        return await dispatch(
            createDocument({
                entity_type: 'salesDeal',
                entity_id: deal.id,
                name: `Р¤Р°Р№Р»С‹ РґРѕРіРѕРІРѕСЂР° в„–${deal.contract_number || deal.id}`,
                description: `Р”РѕРєСѓРјРµРЅС‚С‹ РїРѕ Р»РѕС‚Сѓ ${unit?.unit_number || unitId}`,
                status: 1,
            }),
        ).unwrap();
    };
    const openDealFiles = async (deal: SalesDeal) => {
        setFilesLoading(true);
        try {
            const document = await getOrCreateDealDocument(deal);
            const files = await fetchDocumentFilesDirect(document.id);

            setDealFilesContext({
                deal,
                documentId: document.id,
                files,
            });
            setDealFilesOpen(true);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РєСЂС‹С‚СЊ С„Р°Р№Р»С‹ РґРѕРіРѕРІРѕСЂР°',
            );
        } finally {
            setFilesLoading(false);
        }
    };
    const handleUploadDealFiles = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!dealFilesContext.documentId || !files.length) return;

        setFilesLoading(true);
        try {
            for (const file of files) {
                await dispatch(
                    uploadDocumentFile({
                        documentId: dealFilesContext.documentId,
                        file,
                    }),
                ).unwrap();
            }

            const nextFiles = await fetchDocumentFilesDirect(dealFilesContext.documentId);
            setDealFilesContext((prev) => ({
                ...prev,
                files: nextFiles,
            }));
            toast.success('Р¤Р°Р№Р»С‹ Р·Р°РіСЂСѓР¶РµРЅС‹');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё С„Р°Р№Р»РѕРІ');
        } finally {
            event.target.value = '';
            setFilesLoading(false);
        }
    };
    const handleDownloadDealFile = async (file: DocumentFile) => {
        try {
            await dispatch(
                downloadDocumentFile({
                    file_id: file.id,
                    filename: file.name || `file-${file.id}`,
                }),
            ).unwrap();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'РћС€РёР±РєР° СЃРєР°С‡РёРІР°РЅРёСЏ С„Р°Р№Р»Р°');
        }
    };
    const handleDeleteDealFile = async (fileId: number) => {
        if (!window.confirm('РЈРґР°Р»РёС‚СЊ С„Р°Р№Р»?')) return;

        setFilesLoading(true);
        try {
            await dispatch(deleteDocumentFile(fileId)).unwrap();

            if (dealFilesContext.documentId) {
                const nextFiles = await fetchDocumentFilesDirect(dealFilesContext.documentId);
                setDealFilesContext((prev) => ({
                    ...prev,
                    files: nextFiles,
                }));
            }

            toast.success('Р¤Р°Р№Р» СѓРґР°Р»РµРЅ');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ С„Р°Р№Р»Р°');
        } finally {
            setFilesLoading(false);
        }
    };
    const handleSaveReservation = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!unit?.id) return;

        setActionLoading(true);
        try {
            if (!resForm.client_id) {
                throw new Error('Р’С‹Р±РµСЂРёС‚Рµ РєР»РёРµРЅС‚Р°');
            }

            if (
                !editingReservation &&
                blockingReservation
            ) {
                throw new Error('РџРѕ СЌС‚РѕРјСѓ Р»РѕС‚Сѓ СѓР¶Рµ РµСЃС‚СЊ Р°РєС‚РёРІРЅР°СЏ РёР»Рё РїРѕРґС‚РІРµСЂР¶РґРµРЅРЅР°СЏ Р±СЂРѕРЅСЊ');
            }

            if (
                editingReservation &&
                !isReservationActiveOnly(editingReservation, activeReservationStatusId)
            ) {
                throw new Error('Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ Р±СЂРѕРЅСЊ РјРѕР¶РЅРѕ С‚РѕР»СЊРєРѕ РєРѕРіРґР° СЃС‚Р°С‚СѓСЃ Р°РєС‚РёРІРЅС‹Р№');
            }

            const payload = {
                unit_id: Number(unit.id),
                client_id: Number(resForm.client_id),
                start_at: resForm.start_at || null,
                expires_at: resForm.expires_at || null,
                reservation_amount: toNullableNumber(resForm.reservation_amount),
                currency: resForm.currency ? Number(resForm.currency) : null,
                comment: resForm.comment.trim() || null,
                status: editingReservation
                    ? Number(editingReservation.status || activeReservationStatusId)
                    : activeReservationStatusId,
                cancel_reason: null,
            };

            if (editingReservation?.id) {
                await apiRequest(
                    `/sales/reservations/update/${editingReservation.id}`,
                    'PUT',
                    payload,
                );
            } else {
                await apiRequest('/sales/reservations/create', 'POST', payload);
            }

            toast.success(editingReservation ? 'Р‘СЂРѕРЅСЊ РѕР±РЅРѕРІР»РµРЅР°' : 'Р‘СЂРѕРЅСЊ СЃРѕР·РґР°РЅР°');
            setReservationModalOpen(false);
            setEditingReservation(null);
            setResForm(EMPTY_RESERVATION_FORM);
            await refreshPassport();
        } catch (saveError) {
            toast.error(
                saveError instanceof Error ? saveError.message : 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ Р±СЂРѕРЅРё',
            );
        } finally {
            setActionLoading(false);
        }
    };
    const cancelReservation = async (reservation: SalesReservation) => {
        if (!reservation?.id) return;

        if (!isReservationActiveOnly(reservation, activeReservationStatusId)) {
            toast.error('РЎРЅСЏС‚СЊ Р±СЂРѕРЅСЊ РјРѕР¶РЅРѕ С‚РѕР»СЊРєРѕ РєРѕРіРґР° СЃС‚Р°С‚СѓСЃ Р°РєС‚РёРІРЅС‹Р№');
            return;
        }

        setActionLoading(true);
        try {
            await apiRequest(`/sales/reservations/update/${reservation.id}`, 'PUT', {
                status: canceledReservationStatusId,
                cancel_reason: 'Р‘СЂРѕРЅСЊ СЃРЅСЏС‚Р° РёР· РїР°СЃРїРѕСЂС‚Р° Р»РѕС‚Р°',
            });

            toast.success('Р‘СЂРѕРЅСЊ СЃРЅСЏС‚Р°');
            await refreshPassport();
        } catch (cancelError) {
            toast.error(
                cancelError instanceof Error ? cancelError.message : 'РћС€РёР±РєР° СЃРЅСЏС‚РёСЏ Р±СЂРѕРЅРё',
            );
        } finally {
            setActionLoading(false);
        }
    };
    const openReservationPaymentModal = (reservation: SalesReservation, clientId: number) => {
        if (!isReservationActiveOnly(reservation, activeReservationStatusId)) {
            toast.error('РџР»Р°С‚РµР¶ РїРѕ Р±СЂРѕРЅРё РјРѕР¶РЅРѕ РґРѕР±Р°РІРёС‚СЊ С‚РѕР»СЊРєРѕ РґР»СЏ Р°РєС‚РёРІРЅРѕР№ Р±СЂРѕРЅРё');
            return;
        }

        setPaymentForm({
            ...EMPTY_PAYMENT_FORM,
            reservation_id: String(reservation.id),
            client_id: String(clientId || reservation.client_id || ''),
            title: `РџР»Р°С‚РµР¶ РїРѕ Р±СЂРѕРЅРё в„–${reservation.id}`,
            currency: reservation.currency
                ? String(reservation.currency)
                : defaultCurrencyId,
            planned_date: toDateInput(new Date()),
        });
        setPaymentModalOpen(true);
    };
    const handlePaymentChange = (patch: Partial<PaymentFormState>) => {
        setPaymentForm((prev) => ({ ...prev, ...patch }));
    };
    const handlePaymentDealChange = (dealId: string) => {
        setPaymentForm((prev) => ({ ...prev, deal_id: dealId }));
    };
    const saveReservationPayment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!unit?.project_id || !unit?.block_id) return;

        setActionLoading(true);
        try {
            const selectedReservation =
                reservations.find(
                    (item) => Number(item.id) === Number(paymentForm.reservation_id),
                ) || null;

            if (!selectedReservation?.id) {
                throw new Error('РџР»Р°С‚РµР¶ РјРѕР¶РЅРѕ СЃРѕР·РґР°С‚СЊ С‚РѕР»СЊРєРѕ РїРѕ РІС‹Р±СЂР°РЅРЅРѕР№ Р±СЂРѕРЅРё');
            }

            if (!isReservationActiveOnly(selectedReservation, activeReservationStatusId)) {
                throw new Error('РџР»Р°С‚РµР¶ РїРѕ Р±СЂРѕРЅРё РјРѕР¶РЅРѕ РґРѕР±Р°РІРёС‚СЊ С‚РѕР»СЊРєРѕ РґР»СЏ Р°РєС‚РёРІРЅРѕР№ Р±СЂРѕРЅРё');
            }

            const amount = toNullableNumber(paymentForm.amount);
            if (!amount || amount <= 0) {
                throw new Error('РЈРєР°Р¶РёС‚Рµ СЃСѓРјРјСѓ РїР»Р°С‚РµР¶Р°');
            }

            if (!incomePaymentType?.id) {
                throw new Error('РќРµ РЅР°Р№РґРµРЅ С‚РёРї РїР»Р°С‚РµР¶Р° "РїСЂРёС…РѕРґ"');
            }

            if (!salePaymentArticle?.id) {
                throw new Error('РќРµ РЅР°Р№РґРµРЅР° СЃС‚Р°С‚СЊСЏ РїР»Р°С‚РµР¶Р° РґР»СЏ РїСЂРѕРґР°Р¶Рё РєРІР°СЂС‚РёСЂС‹');
            }

            await dispatch(
                createPayment({
                    project_id: Number(unit.project_id),
                    block_id: Number(unit.block_id),
                    payment_type: Number(incomePaymentType.id),
                    article_id: Number(salePaymentArticle.id),
                    entity_type: 'salesReservation',
                    entity_id: Number(selectedReservation.id),
                    title:
                        paymentForm.title.trim() ||
                        `РџР»Р°С‚РµР¶ РїРѕ Р±СЂРѕРЅРё в„–${selectedReservation.id}`,
                    amount,
                    currency: Number(
                        paymentForm.currency || selectedReservation.currency || defaultCurrencyId,
                    ),
                    planned_date: paymentForm.planned_date || null,
                    paid_date: paymentForm.paid_date || null,
                    counterparty_type: clientCounterpartyType?.id
                        ? String(clientCounterpartyType.id)
                        : null,
                    counterparty_id: selectedReservation.client_id || null,
                    counterparty_name: getClientName(
                        selectedReservation.client_id || paymentForm.client_id,
                    ),
                    is_manual: false,
                }),
            ).unwrap();

            toast.success('РџР»Р°С‚РµР¶ СЃРѕР·РґР°РЅ');
            setPaymentModalOpen(false);
            setPaymentForm(EMPTY_PAYMENT_FORM);
            await refreshPassport();
        } catch (paymentError) {
            toast.error(
                paymentError instanceof Error ? paymentError.message : 'РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ РїР»Р°С‚РµР¶Р°',
            );
        } finally {
            setActionLoading(false);
        }
    };
    const openDealPaymentModal = (deal: SalesDeal) => {
        setPaymentForm({
            ...EMPTY_PAYMENT_FORM,
            deal_id: String(deal.id),
            reservation_id: deal.reservation_id ? String(deal.reservation_id) : '',
            client_id: deal.client_id ? String(deal.client_id) : '',
            title: `РџР»Р°С‚РµР¶ РїРѕ РґРѕРіРѕРІРѕСЂСѓ в„–${deal.contract_number || deal.id}`,
            currency: deal.currency ? String(deal.currency) : defaultCurrencyId,
            planned_date: toDateInput(new Date()),
        });
        setPaymentModalOpen(true);
    };
    const handlePaymentDealSelection = (dealId: string) => {
        if (!dealId) {
            setPaymentForm((prev) => ({ ...prev, deal_id: '' }));
            return;
        }

        const selectedDeal = deals.find((deal) => Number(deal.id) === Number(dealId)) || null;
        if (!selectedDeal) {
            setPaymentForm((prev) => ({ ...prev, deal_id: dealId }));
            return;
        }

        setPaymentForm((prev) => ({
            ...prev,
            deal_id: String(selectedDeal.id),
            reservation_id: selectedDeal.reservation_id ? String(selectedDeal.reservation_id) : '',
            client_id: selectedDeal.client_id ? String(selectedDeal.client_id) : prev.client_id,
            title: `РџР»Р°С‚РµР¶ РїРѕ РґРѕРіРѕРІРѕСЂСѓ в„–${selectedDeal.contract_number || selectedDeal.id}`,
            currency: selectedDeal.currency ? String(selectedDeal.currency) : prev.currency,
        }));
    };
    const savePayment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!unit?.project_id || !unit?.block_id) return;

        setActionLoading(true);
        try {
            const selectedDeal =
                deals.find((deal) => Number(deal.id) === Number(paymentForm.deal_id)) || null;
            const selectedReservation =
                reservations.find(
                    (reservation) => Number(reservation.id) === Number(paymentForm.reservation_id),
                ) || null;

            if (!selectedDeal?.id && !selectedReservation?.id) {
                throw new Error('РџР»Р°С‚РµР¶ РјРѕР¶РЅРѕ СЃРѕР·РґР°С‚СЊ С‚РѕР»СЊРєРѕ РїРѕ Р°РєС‚РёРІРЅРѕР№ Р±СЂРѕРЅРё РёР»Рё РґРѕРіРѕРІРѕСЂСѓ');
            }

            if (
                !selectedDeal?.id &&
                selectedReservation &&
                !isReservationActiveOnly(selectedReservation, activeReservationStatusId)
            ) {
                throw new Error('РџР»Р°С‚РµР¶ РїРѕ Р±СЂРѕРЅРё РјРѕР¶РЅРѕ РґРѕР±Р°РІРёС‚СЊ С‚РѕР»СЊРєРѕ РґР»СЏ Р°РєС‚РёРІРЅРѕР№ Р±СЂРѕРЅРё');
            }

            const amount = toNullableNumber(paymentForm.amount);
            if (!amount || amount <= 0) {
                throw new Error('РЈРєР°Р¶РёС‚Рµ СЃСѓРјРјСѓ РїР»Р°С‚РµР¶Р°');
            }

            if (!incomePaymentType?.id) {
                throw new Error('РќРµ РЅР°Р№РґРµРЅ С‚РёРї РїР»Р°С‚РµР¶Р° "РїСЂРёС…РѕРґ"');
            }

            if (!salePaymentArticle?.id) {
                throw new Error('РќРµ РЅР°Р№РґРµРЅР° СЃС‚Р°С‚СЊСЏ РїР»Р°С‚РµР¶Р° РґР»СЏ РїСЂРѕРґР°Р¶Рё РєРІР°СЂС‚РёСЂС‹');
            }

            await dispatch(
                createPayment({
                    project_id: Number(unit.project_id),
                    block_id: Number(unit.block_id),
                    payment_type: Number(incomePaymentType.id),
                    article_id: Number(salePaymentArticle.id),
                    entity_type: selectedDeal?.id ? 'salesDeal' : 'salesReservation',
                    entity_id: Number(selectedDeal?.id || selectedReservation?.id),
                    title:
                        paymentForm.title.trim() ||
                        (selectedDeal?.id
                            ? `РџР»Р°С‚РµР¶ РїРѕ РґРѕРіРѕРІРѕСЂСѓ в„–${selectedDeal.contract_number || selectedDeal.id}`
                            : `РџР»Р°С‚РµР¶ РїРѕ Р±СЂРѕРЅРё в„–${selectedReservation?.id}`),
                    amount,
                    currency: Number(
                        paymentForm.currency ||
                            selectedDeal?.currency ||
                            selectedReservation?.currency ||
                            defaultCurrencyId,
                    ),
                    planned_date: paymentForm.planned_date || null,
                    paid_date: paymentForm.paid_date || null,
                    counterparty_type: clientCounterpartyType?.id
                        ? String(clientCounterpartyType.id)
                        : null,
                    counterparty_id:
                        selectedDeal?.client_id ||
                        selectedReservation?.client_id ||
                        Number(paymentForm.client_id || 0) ||
                        null,
                    counterparty_name: getClientName(
                        selectedDeal?.client_id ||
                            selectedReservation?.client_id ||
                            paymentForm.client_id,
                    ),
                    is_manual: false,
                }),
            ).unwrap();

            toast.success('РџР»Р°С‚РµР¶ СЃРѕР·РґР°РЅ');
            setPaymentModalOpen(false);
            setPaymentForm(EMPTY_PAYMENT_FORM);
            await refreshPassport();
        } catch (paymentError) {
            toast.error(
                paymentError instanceof Error ? paymentError.message : 'РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ РїР»Р°С‚РµР¶Р°',
            );
        } finally {
            setActionLoading(false);
        }
    };
    const openScheduleModal = (deal: SalesDeal) => {
        const schedules = getDealSchedules(deal.id);
        const firstSchedule = schedules[0] || null;
        const secondSchedule = schedules[1] || null;
        const startDate =
            firstSchedule?.planned_date || deal.contract_date || toDateInput(new Date());

        setScheduleForm({
            deal_id: String(deal.id),
            start_date: toDateInput(startDate),
            payments_count: String(schedules.length || 12),
            interval_months:
                firstSchedule && secondSchedule
                    ? String(
                          getMonthDiff(
                              firstSchedule.planned_date || '',
                              secondSchedule.planned_date || '',
                          ),
                      )
                    : '1',
            payment_day: startDate ? String(new Date(startDate).getDate()) : '',
            first_payment_amount: firstSchedule?.planned_amount
                ? String(firstSchedule.planned_amount)
                : '',
            total_amount:
                deal.total_amount || unit?.price_total
                    ? String(deal.total_amount || unit?.price_total)
                    : '',
            comment: '',
        });
        setScheduleModalOpen(true);
    };
    const handleScheduleChange = (patch: Partial<ScheduleFormState>) => {
        setScheduleForm((prev) => ({ ...prev, ...patch }));
    };
    const saveSchedule = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setActionLoading(true);
        try {
            const dealId = Number(scheduleForm.deal_id || 0);
            const paymentsCount = Number(scheduleForm.payments_count || 0);

            if (!dealId) {
                throw new Error('Р’С‹Р±РµСЂРёС‚Рµ РґРѕРіРѕРІРѕСЂ');
            }
            if (!paymentsCount || paymentsCount < 1) {
                throw new Error('РЈРєР°Р¶РёС‚Рµ РєРѕР»РёС‡РµСЃС‚РІРѕ РїР»Р°С‚РµР¶РµР№');
            }

            await dispatch(
                generateSalesPaymentSchedule({
                    deal_id: dealId,
                    start_date: scheduleForm.start_date || toDateInput(new Date()),
                    payments_count: paymentsCount,
                    interval_months: Number(scheduleForm.interval_months || 1),
                    payment_day: scheduleForm.payment_day ? Number(scheduleForm.payment_day) : null,
                    first_payment_amount: toNullableNumber(scheduleForm.first_payment_amount),
                    total_amount: toNullableNumber(scheduleForm.total_amount),
                    comment: scheduleForm.comment.trim() || null,
                }),
            ).unwrap();

            toast.success('Р“СЂР°С„РёРє СЃС„РѕСЂРјРёСЂРѕРІР°РЅ');
            setScheduleModalOpen(false);
            setScheduleForm(EMPTY_SCHEDULE_FORM);
            await refreshPassport();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'РћС€РёР±РєР° С„РѕСЂРјРёСЂРѕРІР°РЅРёСЏ РіСЂР°С„РёРєР°',
            );
        } finally {
            setActionLoading(false);
        }
    };
    const downloadScheduleReport = async (deal: SalesDeal) => {
        const token = getToken();
        const fallbackName = `Р“СЂР°С„РёРє РїР»Р°С‚РµР¶РµР№ РґРѕРіРѕРІРѕСЂ в„–${deal.contract_number || deal.id}.xlsx`;

        try {
            const [baseUrl] = getSalesReportBaseUrls();
            const response = await fetch(
                `${baseUrl}/report/sales-payment-schedule?dealId=${deal.id}`,
                {
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                },
            );

            const contentType = response.headers.get('Content-Type');
            if (!response.ok) {
                let message = 'РќРµ СѓРґР°Р»РѕСЃСЊ СЃРєР°С‡Р°С‚СЊ РіСЂР°С„РёРє РїР»Р°С‚РµР¶РµР№';

                if (contentType?.includes('application/json')) {
                    const json = await response.json();
                    message = json?.message || json?.error || message;
                }

                throw new Error(message);
            }

            const blob = await response.blob();
            const fileName = getFileNameFromContentDisposition(
                response.headers.get('Content-Disposition'),
                fallbackName,
            );

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Excel РІС‹РіСЂСѓР¶РµРЅ');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё Excel');
        } finally {
            // no-op
        }
    };
    void handlePaymentDealChange;
    void saveReservationPayment;
    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
                Р—Р°РіСЂСѓР·РєР° РїР°СЃРїРѕСЂС‚Р° РєРІР°СЂС‚РёСЂС‹...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
                {error}
            </div>
        );
    }

    if (!unit) {
        return (
            <div className="p-6 text-sm border border-dashed rounded-xl border-slate-300 text-slate-500">
                Р”Р°РЅРЅС‹Рµ РїРѕ РєРІР°СЂС‚РёСЂРµ РЅРµ РЅР°Р№РґРµРЅС‹
            </div>
        );
    }

    /************************************************************************************************/
    return (
        <div>
            <div>
                {/* UNIT HEADER */}
                <UnitPassportHeader
                    unit={unit}
                    refs={refs}
                    onEditUnit={() => setEditUnitOpen(true)}
                    onClose={onClose}
                />
            </div>
            {/* ЗАГРУЗКА 2D и 3D */}
            <div className="border-b border-stone-200 bg-white px-2 py-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                        <div className="text-sm font-semibold text-slate-800">Файлы квартиры</div>
                        <p className="text-xs text-slate-500">
                            Загрузка 2D и 3D файлов по этой квартире
                        </p>
                    </div>
                    {unitFilesLoading ? (
                        <span className="text-xs font-medium text-slate-500">Загрузка...</span>
                    ) : null}
                </div>

                <div className="rounded-xl border border-stone-200 bg-stone-50 p-1.5">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleUnitPreviewTabChange('2d')}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                unitPreviewTab === '2d'
                                    ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                                    : 'bg-white text-slate-600 ring-1 ring-stone-200 hover:bg-stone-100'
                            }`}
                        >
                            2D План
                        </button>
                        <button
                            type="button"
                            onClick={() => handleUnitPreviewTabChange('3d')}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                unitPreviewTab === '3d'
                                    ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                                    : 'bg-white text-slate-600 ring-1 ring-stone-200 hover:bg-stone-100'
                            }`}
                        >
                            3D План
                        </button>
                        <button
                            type="button"
                            onClick={() => handleUnitPreviewTabChange('files')}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                unitPreviewTab === 'files'
                                    ? 'bg-sky-100 text-sky-700 ring-1 ring-sky-200'
                                    : 'bg-white text-slate-600 ring-1 ring-stone-200 hover:bg-stone-100'
                            }`}
                        >
                            Файлы
                        </button>
                    </div>
                </div>

                {unitPreviewTab === 'files' ? (
                    <div className="grid gap-3 pt-3 md:grid-cols-2">
                        {UNIT_FILE_TYPES.map((kind) => {
                            const meta = getUnitFileDocumentMeta(
                                kind,
                                unit.unit_number,
                                unit.id,
                            );
                            const files = unitFiles[kind].files;

                            return (
                                <div
                                    key={kind}
                                    className="rounded-xl border border-stone-200 bg-slate-50 p-3"
                                >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <div className="text-sm font-semibold text-slate-700">
                                            {meta.title}
                                        </div>
                                        <label className="inline-flex cursor-pointer items-center rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700">
                                            Загрузить
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(event) =>
                                                    void handleUploadUnitFile(kind, event)
                                                }
                                            />
                                        </label>
                                    </div>

                                    {files.length ? (
                                        <div className="space-y-2">
                                            {files.map((file) => (
                                                <div
                                                    key={file.id}
                                                    className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-2.5 py-2"
                                                >
                                                    <div className="min-w-0 truncate text-xs font-medium text-slate-700">
                                                        {file.name || `Файл #${file.id}`}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            title="Скачать файл"
                                                            onClick={() =>
                                                                void handleDownloadUnitFile(file)
                                                            }
                                                            className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200"
                                                        >
                                                            Скачать
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Удалить файл"
                                                            onClick={() =>
                                                                void handleDeleteUnitFile(
                                                                    kind,
                                                                    file.id,
                                                                )
                                                            }
                                                            className="rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 transition hover:bg-red-100"
                                                        >
                                                            Удалить
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-stone-300 bg-white px-3 py-4 text-center text-xs text-slate-500">
                                            Файл пока не загружен
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : !unitPreviewOpen ? (
                    <div className="pt-3">
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                            <div className="text-xs text-slate-500">
                                {unitPreviewTab === '3d'
                                    ? 'Предпросмотр 3D плана скрыт'
                                    : 'Предпросмотр 2D плана скрыт'}
                            </div>
                            <button
                                type="button"
                                onClick={() => setUnitPreviewOpen(true)}
                                className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-stone-200 transition hover:bg-stone-100"
                            >
                                Открыть
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="pt-3">
                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-2">
                            <div className="mb-2 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 ring-1 ring-stone-100">
                                <div className="text-xs font-medium text-slate-600">
                                    {unitPreviewTab === '3d' ? '3D План' : '2D План'}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setUnitPreviewOpen(false)}
                                    className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-stone-200 transition hover:bg-stone-100"
                                >
                                    Скрыть
                                </button>
                            </div>

                            <div className="min-h-[260px] rounded-lg bg-white p-3 sm:min-h-[320px] sm:p-4">
                                {unitPreviewLoading ? (
                                    <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500 sm:min-h-[280px]">
                                        Загружаем {unitPreviewTab === '3d' ? '3D план' : '2D план'}...
                                    </div>
                                ) : currentPreviewAsset ? (
                                    <div className="flex min-h-[220px] items-center justify-center sm:min-h-[280px]">
                                        <img
                                            src={currentPreviewAsset.url}
                                            alt={
                                                currentPreviewAsset.file.name ||
                                                (unitPreviewTab === '3d'
                                                    ? '3D план'
                                                    : '2D план')
                                            }
                                            className="max-h-[420px] w-auto max-w-full object-contain sm:max-h-[520px]"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center text-slate-500 sm:min-h-[280px]">
                                        <div className="text-sm font-medium">
                                            {unitPreviewTab === '3d'
                                                ? '3D план пока не загружен'
                                                : '2D план пока не загружен'}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleUnitPreviewTabChange('files')}
                                            className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
                                        >
                                            Перейти к файлам
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div>
                <UnitPassportHistoryPanel
                    clients={clients}
                    hasBlockedReservation={Boolean(blockingReservation)}
                    onCreateReservation={openCreateReservation}
                    onCreateDeal={openCreateDeal}
                    onAddReservationPayment={openReservationPaymentModal}
                    onEditReservation={openEditReservation}
                    onCancelReservation={cancelReservation}
                    isReservationActive={(reservation) =>
                        isReservationActiveOnly(reservation, activeReservationStatusId)
                    }
                    onEditDeal={openEditDeal}
                    isDealDraft={isDealDraft}
                    onSignDeal={(deal) => void changeDealStatus(deal, 'signed')}
                    onCancelDeal={(deal) => void changeDealStatus(deal, 'canceled')}
                    onDealFiles={(deal) => void openDealFiles(deal)}
                    onAddDealPayment={openDealPaymentModal}
                    onOpenDealSchedule={openScheduleModal}
                    onDownloadDealSchedule={(deal) => void downloadScheduleReport(deal)}
                />
            </div>
            {editUnitOpen && (
                <ObjectsOverviewUnitForm
                    mode="edit"
                    unit={unit as SalesUnit}
                    unitStatuses={unitStatuses}
                    finishTypes={finishTypes}
                    refs={refs}
                    onClose={() => setEditUnitOpen(false)}
                    onSuccess={refreshPassport}
                />
            )}
            <ReservationModal
                open={reservationModalOpen}
                unitNumber={unit.unit_number}
                isEditing={Boolean(editingReservation)}
                actionLoading={actionLoading}
                resForm={resForm}
                clients={clientOptions}
                currencies={currencies}
                onChange={handleReservationChange}
                onSubmit={handleSaveReservation}
                onClose={() => {
                    if (actionLoading) return;
                    setReservationModalOpen(false);
                    setEditingReservation(null);
                    setResForm(EMPTY_RESERVATION_FORM);
                }}
            />
            <DealModal
                open={dealModalOpen}
                unitNumber={unit.unit_number}
                editingDeal={editingDeal}
                actionLoading={actionLoading}
                dealForm={dealForm}
                clients={clientOptions}
                dealReservationOptions={dealReservationOptions}
                dealTypes={dealTypes}
                dealPaymentTypes={dealPaymentTypes}
                currencies={currencies}
                getReservationStatusName={getReservationStatusName}
                onChange={handleDealChange}
                onSubmit={saveDeal}
                onClose={() => {
                    if (actionLoading) return;
                    setDealModalOpen(false);
                    setEditingDeal(null);
                    setDealForm(EMPTY_DEAL_FORM);
                }}
            />
            <PaymentModal
                open={paymentModalOpen}
                unitNumber={unit.unit_number}
                deals={deals}
                paymentForm={paymentForm}
                reservationOptionLabel={
                    paymentForm.reservation_id
                        ? `Р‘СЂРѕРЅСЊ в„–${paymentForm.reservation_id}`
                        : 'Р’С‹Р±РµСЂРёС‚Рµ Р±СЂРѕРЅСЊ'
                }
                currencies={currencies}
                actionLoading={actionLoading}
                onDealChange={handlePaymentDealSelection}
                onChange={handlePaymentChange}
                onSubmit={savePayment}
                onClose={() => {
                    if (actionLoading) return;
                    setPaymentModalOpen(false);
                    setPaymentForm(EMPTY_PAYMENT_FORM);
                }}
            />
            <ScheduleModal
                open={scheduleModalOpen}
                unitNumber={unit.unit_number}
                scheduleForm={scheduleForm}
                actionLoading={actionLoading}
                onChange={handleScheduleChange}
                onSubmit={saveSchedule}
                onClose={() => {
                    if (actionLoading) return;
                    setScheduleModalOpen(false);
                    setScheduleForm(EMPTY_SCHEDULE_FORM);
                }}
            />
            <DealFilesModal
                open={dealFilesOpen}
                unitNumber={unit.unit_number}
                filesLoading={filesLoading}
                dealFilesContext={dealFilesContext}
                onUpload={(event) => void handleUploadDealFiles(event)}
                onDownload={(file) => void handleDownloadDealFile(file)}
                onDelete={(fileId) => void handleDeleteDealFile(fileId)}
                onClose={() => {
                    if (filesLoading) return;
                    setDealFilesOpen(false);
                    setDealFilesContext({
                        deal: null,
                        documentId: null,
                        files: [],
                    });
                }}
            />
        </div>
    );
}
