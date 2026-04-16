import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    TextField,
    Divider,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    MenuItem,
    Checkbox,
    ListItemText,
    DialogTitle,
    Button,
} from '@mui/material';
import { AiOutlineUpload } from 'react-icons/ai';
import { MdHistory, MdAttachFile } from 'react-icons/md';
import { useReference } from '@/features/reference/useReference';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { documentFormData } from '@/features/auditLog/metaData/document';
import { AuditLogTable } from '@/features/auditLog/AuditLogTable';
import { DocumentFilesList } from '../files/DocumentFilesList';
import toast from 'react-hot-toast';
import StatusChip from '@/components/ui/StatusChip';
import { fetchLegalDocuments, signDocument, type LegalDocumentForm } from './legalDocSlice';

interface LegalDocModalProps {
    open: boolean;
    onClose: () => void;
    documentId?: number;
    initialData: LegalDocumentForm;
    submitting?: boolean;
    onSubmit: (data: LegalDocumentForm, files: File[]) => void | Promise<void>;
}

export function LegalDocModal({
    open,
    onClose,
    documentId,
    initialData,
    submitting = false,
    onSubmit,
}: LegalDocModalProps) {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<LegalDocumentForm>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof LegalDocumentForm, string>>>({});
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [openHistory, setOpenHistory] = useState(false);

    const documentStatuses = useReference('documentStatuses');
    const users = useReference('users');
    const currentUser = useAppSelector((state) => state.auth.user);
    const lawyers = users.data?.filter((u) => u.role_id === String(currentUser?.role_id)) ?? [];

    useEffect(() => {
        if (open) {
            setFormData({
                ...initialData,
                status: documentId ? initialData.status : 1,
            });
            setErrors({});
            setPendingFiles([]);
        }
    }, [open, initialData, documentId]);

    const handleChange = (field: keyof LegalDocumentForm, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = () => {
        onSubmit(formData, pendingFiles);
        console.log('pendingFiles', pendingFiles);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setPendingFiles((prev) => [...prev, ...files]);
    };

    const handleSign = (documentId: number) => {
        const roleId = Number(currentUser?.role_id);

        if (roleId !== 1 && roleId !== 2) {
            toast.error('У вас нет прав на подписание документа');
            return;
        }

        dispatch(signDocument(documentId))
            .unwrap()
            .then(() => {
                dispatch(
                    fetchLegalDocuments({ page: 1, size: 10, entity_id: initialData.entity_id }),
                );
                toast.success('Документ успешно подписан');
            })
            .catch((err) => {
                toast.error(err || 'Ошибка при подписании');
            });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                {/* 📋 Шапка */}
                <div className="p-6 pb-4 border-b border-gray-200 bg-gradient-to-br from-blue-50/30 to-indigo-50/20">
                    <div className="flex flex-row flex-wrap items-start justify-between gap-4">
                        <div className="flex-1">
                            <h2 className="mb-1 text-lg font-bold tracking-wide text-blue-900 uppercase">
                                {documentId
                                    ? `Редактировать документ № ${documentId}`
                                    : 'Создать новый документ'}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                {documentId
                                    ? 'Обновите информацию о документе и управляйте файлами'
                                    : 'Заполните информацию о новом документе'}
                            </p>
                        </div>

                        {documentId && (
                            <button
                                onClick={() => setOpenHistory(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-900 transition-all duration-200 border border-transparent rounded-lg hover:bg-blue-100/60 hover:border-blue-200"
                            >
                                <MdHistory className="w-4 h-4" />
                                <span>История</span>
                            </button>
                        )}
                    </div>
                </div>

                <DialogContent dividers className="p-6">
                    {/* 📝 Основные поля */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextField
                            label="Название"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            size="small"
                            fullWidth
                            required
                        />

                        <TextField
                            label="Стоимость"
                            type="text"
                            value={formData.price ?? ''}
                            onChange={(e) => handleChange('price', Number(e.target.value))}
                            helperText={errors.price}
                            size="small"
                            fullWidth
                            required
                        />

                        <div className="col-span-full">
                            <TextField
                                label="Описание"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                size="small"
                                fullWidth
                            />
                        </div>

                        <FormControl
                            error={!!errors.responsible_users}
                            fullWidth
                            required
                            size="small"
                        >
                            <InputLabel>Исполнители</InputLabel>
                            <Select
                                multiple
                                label="Исполнители"
                                value={formData.responsible_users}
                                onChange={(e) =>
                                    handleChange('responsible_users', e.target.value as number[])
                                }
                                renderValue={(selected) =>
                                    lawyers
                                        ?.filter((u) => selected.includes(Number(u.id)))
                                        .map((u) => u.name)
                                        .join(', ')
                                }
                            >
                                {lawyers?.map((u) => {
                                    const id = Number(u.id);
                                    return (
                                        <MenuItem key={id} value={id}>
                                            <Checkbox
                                                checked={formData.responsible_users.includes(id)}
                                            />
                                            <ListItemText primary={u.name} />
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                            {errors.responsible_users && (
                                <FormHelperText>{errors.responsible_users}</FormHelperText>
                            )}
                        </FormControl>

                        <TextField
                            label="Крайний срок"
                            type="date"
                            value={formData.deadline || ''}
                            onChange={(e) => handleChange('deadline', e.target.value)}
                            error={!!errors.deadline}
                            helperText={errors.deadline}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* Статус */}
                        <div className="flex items-center justify-end gap-3 p-4 mt-2 border border-dashed rounded-lg col-span-full bg-blue-50/20 border-blue-200/50">
                            <span className="text-sm font-medium text-blue-900">
                                Статус документа:
                            </span>
                            <StatusChip
                                label={documentStatuses.lookup(formData.status)}
                                status={formData.status}
                            />
                        </div>
                    </div>

                    {/* 📎 Сохранённые файлы */}
                    {documentId && (
                        <>
                            <Divider className="my-6" />
                            <div className="flex items-center gap-2 mb-3">
                                <MdAttachFile className="w-5 h-5 text-blue-900" />
                                <h3 className="text-base font-semibold text-blue-900">
                                    Сохранённые файлы
                                </h3>
                            </div>
                            <DocumentFilesList documentId={documentId} />
                        </>
                    )}

                    <Divider className="my-6" />

                    {/* 📁 Прикреплённые файлы */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MdAttachFile className="w-5 h-5 text-blue-900" />
                            <h3 className="text-base font-semibold text-blue-900">
                                Прикреплённые файлы
                            </h3>
                        </div>

                        {pendingFiles.length === 0 ? (
                            <div className="px-4 py-8 text-center border border-gray-300 border-dashed rounded-lg bg-gray-50">
                                <p className="text-sm italic text-gray-500">
                                    Файлы ещё не добавлены
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 mb-4">
                                {pendingFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300"
                                    >
                                        <MdAttachFile className="w-4 h-4 text-blue-600" />
                                        <span className="text-gray-700">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-4 mt-4 border border-gray-200 bg-gray-50 rounded-xl">
                            <div className="flex flex-row flex-wrap items-center justify-between gap-4">
                                <label className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <AiOutlineUpload className="w-4 h-4" />
                                    <span>Добавить файлы</span>
                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        onChange={handleFileSelect}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                        disabled={submitting}
                                    />
                                </label>

                                <span className="text-xs text-gray-600">
                                    PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogContent>

                <DialogActions className="gap-2 p-6 border-t border-gray-200 bg-gray-50/50">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (documentId) {
                                handleSign(documentId);
                            }
                        }}
                        disabled={!documentId}
                        className="px-4 py-2 mr-auto font-medium text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Подписать
                    </button>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 font-medium text-gray-700 transition-colors duration-200 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Сохранить
                    </button>
                </DialogActions>
            </Dialog>

            {/* 📜 История изменений */}
            <Dialog
                open={openHistory}
                onClose={() => setOpenHistory(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle className="border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <MdHistory className="w-5 h-5 text-blue-900" />
                        <span className="text-lg font-semibold text-blue-900">
                            История изменений
                        </span>
                    </div>
                </DialogTitle>

                <DialogContent dividers>
                    <AuditLogTable
                        entity_type={'document'}
                        entity_id={documentId || 0}
                        formMetadata={documentFormData}
                    />
                </DialogContent>

                <DialogActions className="p-4">
                    <Button onClick={() => setOpenHistory(false)}>Закрыть</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
