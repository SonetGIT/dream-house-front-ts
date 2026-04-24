import { useEffect, useMemo, useState } from 'react';
import { Button, LinearProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useParams } from 'react-router-dom';
import { useReference } from '@/features/reference/useReference';
import { fetchReportDefinitions, type ReportDefinition } from './reportDefinitionsSlice';
import { buildReportUrl, validateReportParams, type ReportFormValues } from './reportUtils';
import ReportParamsForm from './ReportParamsForm';

const REPORT_BASE_URL = 'http://77.235.27.71:8080';

/**********************************************************************************************************************/
export default function ReportsPage() {
    const { projectId, prjBlockId } = useParams();
    const dispatch = useAppDispatch();
    const { data, loading } = useAppSelector((state) => state.reportDefinitions);

    const [selectedCode, setSelectedCode] = useState<string>('');
    const [values, setValues] = useState<ReportFormValues>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [previewLoading, setPreviewLoading] = useState(false);

    const numericProjectId = Number(projectId || 0);
    const numericBlockId = Number(prjBlockId || 0);

    useEffect(() => {
        dispatch(fetchReportDefinitions());
    }, [dispatch]);

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

    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-4">
                <div className="p-4 bg-white border rounded-lg">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Отчет</label>

                    <select
                        value={selectedCode}
                        onChange={(e) => handleSelectReport(e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg ${
                            errors.report ? 'border-red-300' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Выберите отчет</option>

                        {reports.map((report) => (
                            <option key={report.id} value={report.code}>
                                {report.name}
                            </option>
                        ))}
                    </select>

                    {errors.report && <p className="mt-1 text-xs text-red-600">{errors.report}</p>}

                    {loading && (
                        <p className="mt-2 text-xs text-gray-500">Загрузка списка отчетов...</p>
                    )}
                </div>

                <div className="p-4 bg-white border rounded-lg">
                    <ReportParamsForm
                        definition={selectedReport}
                        values={values}
                        errors={errors}
                        refs={refs}
                        contextValues={contextValues}
                        onChange={handleChangeValue}
                    />
                </div>

                <div className="flex flex-wrap gap-2 p-4 bg-white border rounded-lg">
                    <Button variant="contained" onClick={handlePreview} disabled={!selectedReport}>
                        Превью
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => handleDownload('pdf')}
                        disabled={!selectedReport || !selectedReport.formats.pdf}
                    >
                        PDF
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => handleDownload('docx')}
                        disabled={!selectedReport || !selectedReport.formats.docx}
                    >
                        DOCX
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => handleDownload('xlsx')}
                        disabled={!selectedReport || !selectedReport.formats.xlsx}
                    >
                        XLSX
                    </Button>
                </div>

                {previewUrl && (
                    <div className="p-4 bg-white border rounded-lg">
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Открыть превью в новой вкладке
                        </a>
                    </div>
                )}
            </div>

            <div className="relative overflow-hidden bg-white border rounded-lg min-h-[720px]">
                {previewLoading && (
                    <div className="absolute top-0 left-0 right-0 z-10">
                        <LinearProgress />
                    </div>
                )}

                {previewUrl ? (
                    <iframe
                        key={previewUrl}
                        src={previewUrl}
                        title="report-preview"
                        className="w-full h-[720px]"
                        onLoad={() => setPreviewLoading(false)}
                    />
                ) : (
                    <div className="flex items-center justify-center h-[720px] text-sm text-gray-400">
                        Здесь будет превью отчета
                    </div>
                )}
            </div>
        </div>
    );
}
