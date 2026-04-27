import { useEffect, useMemo, useState } from 'react';
import { Button, LinearProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useOutletContext, useParams } from 'react-router-dom';
import { useReference } from '@/features/reference/useReference';
import { fetchReportDefinitions, type ReportDefinition } from './reportDefinitionsSlice';
import { buildReportUrl, validateReportParams, type ReportFormValues } from './reportUtils';
import ReportParamsForm from './ReportParamsForm';
import type { ProjectOutletContext } from '../pto/PtoPage';
import { fetchProjectBlocks } from '../pto/projectBlocks/projectBlocksSlice';
import { FaFileExcel, FaFilePdf, FaFileWord } from 'react-icons/fa';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { REPORT_BASE_URL } from '../pto/workPerformed/workPerformedTs/downloadWorkPerformedReport';

/**********************************************************************************************************************/
export default function ReportsPage() {
    const outletContext = useOutletContext<ProjectOutletContext | null>();
    const params = useParams();

    const dispatch = useAppDispatch();
    const { data, loading } = useAppSelector((state) => state.reportDefinitions);
    const { data: projectBlocks } = useAppSelector((state) => state.projectBlocks);

    const [selectedCode, setSelectedCode] = useState<string>('');
    const [values, setValues] = useState<ReportFormValues>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [previewLoading, setPreviewLoading] = useState(false);

    const contextProjectId = Number(outletContext?.projectId || 0);
    const paramsProjectId = Number(params.projectId || 0);
    const numericProjectId = contextProjectId || paramsProjectId || 0;
    const numericBlockId = Number(params.prjBlockId || 0);

    useEffect(() => {
        dispatch(fetchReportDefinitions());
    }, [dispatch]);

    useEffect(() => {
        if (!numericProjectId) return;

        dispatch(
            fetchProjectBlocks({
                project_id: numericProjectId,
                page: 1,
                size: 1000,
            }),
        );
    }, [dispatch, numericProjectId]);

    const refs = {
        projectBlocks: useReference('projectBlocks'),
        projects: useReference('projects'),
    };

    const reports = useMemo(() => {
        return (data ?? [])
            .filter((item) => item.active)
            .sort((a, b) => a.sort_order - b.sort_order);
    }, [data]);

    const selectedReport = useMemo<ReportDefinition | null>(() => {
        return reports.find((item) => item.code === selectedCode) ?? null;
    }, [reports, selectedCode]);

    const contextValues = useMemo(() => {
        return {
            projectId: numericProjectId || undefined,
            blockId: numericBlockId || undefined,
        };
    }, [numericProjectId, numericBlockId]);

    const projectBlockOptions = useMemo(() => {
        return (projectBlocks ?? []).map((item) => ({
            id: item.id,
            name: item.name,
        }));
    }, [projectBlocks]);

    const handleSelectReport = (code: string) => {
        setSelectedCode(code);
        setValues({});
        setErrors({});
        setPreviewUrl('');
        setPreviewLoading(false);
    };

    const handleChangeValue = (name: string, value: string | number) => {
        setValues((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: '',
            report: '',
        }));
    };

    const runValidation = () => {
        const result = validateReportParams(selectedReport, values, contextValues);
        setErrors(result.errors);
        return result.valid;
    };

    const handlePreview = () => {
        if (!runValidation() || !selectedReport) return;

        const url = buildReportUrl(selectedReport, 'html', values, contextValues, REPORT_BASE_URL);

        setPreviewLoading(true);
        setPreviewUrl(url);
    };

    const handleDownload = (format: 'pdf' | 'docx' | 'xlsx') => {
        if (!runValidation() || !selectedReport) return;

        const url = buildReportUrl(selectedReport, format, values, contextValues, REPORT_BASE_URL);

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    /******************************************************************************************************************/
    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[310px_minmax(0,1fr)]">
            <div className="space-y-4">
                <div className="border border-blue-200 shadow-sm rounded-xl bg-gradient-to-b from-blue-50 to-white">
                    <div className="px-4 py-3 border-b border-blue-100">
                        <h3 className="text-sm font-semibold tracking-wide text-blue-900 uppercase">
                            Отчет
                        </h3>
                    </div>

                    <div className="p-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Выберите отчет
                        </label>

                        <select
                            value={selectedCode}
                            onChange={(e) => handleSelectReport(e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors ${
                                errors.report
                                    ? 'border-red-300 focus:border-red-400'
                                    : 'border-blue-200 focus:border-blue-400'
                            }`}
                        >
                            <option value="">Выберите отчет</option>

                            {reports.map((report) => (
                                <option key={report.id} value={report.code}>
                                    {report.name}
                                </option>
                            ))}
                        </select>

                        {errors.report && (
                            <p className="mt-1 text-xs text-red-600">{errors.report}</p>
                        )}

                        {loading && (
                            <p className="mt-2 text-xs text-gray-500">Загрузка списка отчетов...</p>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-blue-200 shadow-sm rounded-xl">
                    {/* <div className="px-4 py-3 border-b border-blue-100">
                        <h3 className="text-sm font-semibold tracking-wide text-blue-900 uppercase">
                            Параметры отчета
                        </h3>
                    </div> */}

                    <div className="p-4">
                        <ReportParamsForm
                            definition={selectedReport}
                            values={values}
                            errors={errors}
                            refs={refs}
                            contextValues={contextValues}
                            projectBlockOptions={projectBlockOptions}
                            onChange={handleChangeValue}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-center p-4">
                        <Button
                            variant="contained"
                            onClick={handlePreview}
                            disabled={!selectedReport}
                            sx={{
                                minWidth: 220,
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: '10px',
                                boxShadow: 'none',
                                backgroundColor: '#2563eb',
                                '&:hover': {
                                    backgroundColor: '#1d4ed8',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            Сформировать
                        </Button>
                    </div>
                </div>

                <div className="bg-white border border-blue-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between gap-3 px-4 py-4">
                        <p className="text-sm font-medium text-gray-700">Скачать в формате:</p>

                        <div className="flex items-center gap-2">
                            <StyledTooltip title="Скачать PDF">
                                <span>
                                    <button
                                        type="button"
                                        className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload('pdf');
                                        }}
                                        disabled={!selectedReport || !selectedReport.formats.pdf}
                                    >
                                        <FaFilePdf className="w-5 h-5" />
                                    </button>
                                </span>
                            </StyledTooltip>

                            <StyledTooltip title="Скачать DOCX">
                                <span>
                                    <button
                                        type="button"
                                        className="p-2 text-blue-500 transition-colors rounded-lg hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload('docx');
                                        }}
                                        disabled={!selectedReport || !selectedReport.formats.docx}
                                    >
                                        <FaFileWord className="w-5 h-5" />
                                    </button>
                                </span>
                            </StyledTooltip>
                            <StyledTooltip title="Скачать XLSX">
                                <span>
                                    <button
                                        type="button"
                                        className="p-2 text-green-600 transition-colors rounded-lg hover:bg-green-50 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload('xlsx');
                                        }}
                                        disabled={!selectedReport || !selectedReport.formats.xlsx}
                                    >
                                        <FaFileExcel className="w-5 h-5" />
                                    </button>
                                </span>
                            </StyledTooltip>
                        </div>
                    </div>
                </div>

                {previewUrl && (
                    <div className="p-4 text-center bg-white border border-blue-200 shadow-sm rounded-xl">
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                        >
                            Открыть превью в новой вкладке
                        </a>
                    </div>
                )}
            </div>

            <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm min-h-[720px]">
                {previewLoading && (
                    <div className="absolute left-0 right-0 top-[49px] z-10">
                        <LinearProgress />
                    </div>
                )}

                {previewUrl ? (
                    <iframe
                        key={previewUrl}
                        src={previewUrl}
                        title="report-preview"
                        className="h-[720px] w-full"
                        onLoad={() => setPreviewLoading(false)}
                    />
                ) : (
                    <div className="flex h-[720px] items-center justify-center text-sm text-gray-400">
                        Здесь будет превью отчета
                    </div>
                )}
            </div>
        </div>
    );
}
