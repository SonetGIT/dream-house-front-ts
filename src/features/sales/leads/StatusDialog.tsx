import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Layers } from 'lucide-react';
import type { SalesLeadStatus } from '../slices/salesDictionariesSlice';

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (payload: { name: string; color: string; sort_order?: number }) => Promise<void>;
    saving: boolean;
    status?: SalesLeadStatus | null;
}

export default function StatusDialog({ open, onClose, onSave, saving, status }: Props) {
    const { register, handleSubmit, watch, setValue, reset } = useForm({
        defaultValues: { name: '', color: STATUS_PALETTE[0], sort_order: '' as string | number },
    });

    const color = watch('color');

    useEffect(() => {
        if (!open) return;
        reset(
            status
                ? {
                      name: status.name,
                      color: status.color || STATUS_PALETTE[0],
                      sort_order: status.sort_order ?? '',
                  }
                : { name: '', color: STATUS_PALETTE[0], sort_order: '' },
        );
    }, [open, status]);

    const onSubmit = async (data: { name: string; color: string; sort_order: string | number }) => {
        await onSave({
            name: data.name.trim(),
            color: data.color,
            sort_order: data.sort_order !== '' ? Number(data.sort_order) : undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        {status ? 'Редактировать статус' : 'Новый статус'}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {status ? 'Настройки колонки воронки' : 'Новая колонка воронки лидов'}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Название *</Label>
                        <Input
                            className="text-sm h-9"
                            placeholder="Например: Нет WhatsApp"
                            {...register('name', { required: true })}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Порядок сортировки</Label>
                        <Input
                            className="text-sm h-9"
                            type="number"
                            placeholder="10"
                            {...register('sort_order')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Цвет</Label>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_PALETTE.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setValue('color', c)}
                                    className="w-8 h-8 transition-transform rounded-full hover:scale-110"
                                    style={{
                                        backgroundColor: c,
                                        outline: color === c ? `2px solid ${c}` : 'none',
                                        outlineOffset: 2,
                                    }}
                                    title={c}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div
                                className="w-6 h-6 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                            />
                            <Input
                                className="w-32 h-8 font-mono text-sm"
                                value={color}
                                onChange={(e) => setValue('color', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Отмена
                        </Button>
                        <Button type="submit" size="sm" disabled={saving} className="flex-1">
                            {saving ? 'Сохраняем...' : status ? 'Сохранить' : 'Создать'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
