import { useForm } from 'react-hook-form';
import {
    Loader2,
    Star,
    Sparkles,
    TrendingUp,
    Clock,
    DollarSign,
    Award,
    CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import { Card } from '@mui/material';
import type { SupplierRatingFormData } from './supplierRatingSlice';
import type { SupplierFormData } from '../suppliersSlice';
import toast from 'react-hot-toast';

interface SupplierRatingFormProps {
    supplier: SupplierFormData | null;
    onSubmit: (data: SupplierRatingFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const ratingLabels = {
    1: { text: 'Очень плохо', color: 'text-red-500' },
    2: { text: 'Плохо', color: 'text-orange-500' },
    3: { text: 'Удовлетворительно', color: 'text-yellow-500' },
    4: { text: 'Хорошо', color: 'text-lime-600' },
    5: { text: 'Отлично', color: 'text-green-500' },
};

/******************************************************************************************************************/
export default function SupplierRatingForm({
    supplier,
    onSubmit,
    onCancel,
    loading = false,
}: SupplierRatingFormProps) {
    const [hoveredRating, setHoveredRating] = useState<{ field: string; value: number } | null>(
        null,
    );
    const [submitted, setSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        // reset,
    } = useForm<SupplierRatingFormData>({
        defaultValues: {
            quality: 0,
            time: 0,
            price: 0,
            comment: '',
        },
    });

    const watchedValues = watch();

    const avgRating =
        watchedValues.quality && watchedValues.time && watchedValues.price
            ? ((watchedValues.quality + watchedValues.time + watchedValues.price) / 3).toFixed(1)
            : '0.0';

    const completionPercentage = () => {
        let completed = 0;
        if (watchedValues.quality > 0) completed += 25;
        if (watchedValues.time > 0) completed += 25;
        if (watchedValues.price > 0) completed += 25;
        if (watchedValues.comment.length >= 10) completed += 25;
        return completed;
    };

    const handleFormSubmit = async (data: SupplierRatingFormData) => {
        try {
            await onSubmit(data);
            setSubmitted(true);
            toast.success('Рейтинг успешно создан!');
        } catch (error) {
            toast.error('Ошибка при создании рейтинга');
        }
    };

    const renderStarRating = (
        field: 'quality' | 'time' | 'price',
        label: string,
        icon: React.ReactNode,
        currentValue: number,
    ) => {
        const displayValue = hoveredRating?.field === field ? hoveredRating.value : currentValue;
        const ratingInfo =
            displayValue > 0 ? ratingLabels[displayValue as keyof typeof ratingLabels] : null;

        return (
            <div className="group">
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 text-white rounded-lg shadow-md bg-gradient-to-br from-blue-500 to-indigo-600">
                        {icon}
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-semibold text-blue-800">{label}</label>
                        {ratingInfo && (
                            <p className={`text-xs font-medium ${ratingInfo.color}`}>
                                {ratingInfo.text}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                        const isActive = star <= displayValue;
                        return (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setValue(field, star, { shouldValidate: true })}
                                onMouseEnter={() => setHoveredRating({ field, value: star })}
                                onMouseLeave={() => setHoveredRating(null)}
                                disabled={loading}
                                className="transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed focus:outline-none"
                            >
                                <Star
                                    className={`w-6 h-6 transition-all duration-200 ${
                                        isActive
                                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-md'
                                            : 'fill-gray-200 text-gray-300 hover:fill-gray-300 hover:text-gray-400'
                                    }`}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const progress = completionPercentage();

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Card className="w-full max-w-md p-8 text-center duration-500 animate-in fade-in zoom-in">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-gray-900">Успешно отправлено!</h3>
                    <p className="mb-4 text-gray-600">
                        Рейтинг для {supplier?.name} был успешно сохранен
                    </p>
                    <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Award className="w-5 h-5" />
                        <span className="text-3xl font-bold">{avgRating}</span>
                        <Star className="w-5 h-5 fill-yellow-400" />
                    </div>
                </Card>
            </div>
        );
    }

    /*****************************************************************************************************************/
    return (
        <div className="grid grid-cols-1 gap-6 mx-auto lg:grid-cols-3 max-w-7xl">
            <div className="lg:col-span-2">
                <Card className="p-4 border-0 shadow-xl bg-white/80 backdrop-blur">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-600">
                                Прогресс заполнения
                            </span>
                            <span className="text-sm font-bold text-blue-600">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                        <div className="p-4 space-y-4 border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm font-bold text-gray-900">Оценки</h3>
                            </div>

                            {renderStarRating(
                                'quality',
                                'Качество',
                                <TrendingUp className="w-4 h-4" />,
                                watchedValues.quality,
                            )}

                            <div className="pt-4 border-t border-gray-200">
                                {renderStarRating(
                                    'time',
                                    'Соблюдение сроков',
                                    <Clock className="w-4 h-4" />,
                                    watchedValues.time,
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                {renderStarRating(
                                    'price',
                                    'Цена/Качество',
                                    <DollarSign className="w-4 h-4" />,
                                    watchedValues.price,
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <textarea
                                {...register('comment', {
                                    required: 'Комментарий обязателен',
                                    minLength: { value: 10, message: 'Минимум 10 символов' },
                                })}
                                rows={4}
                                disabled={loading}
                                className="w-full text-sm transition-colors border-2 resize-none focus:border-blue-500"
                                placeholder="Комментарий обязателен, минимум 10 символов"
                            />
                            {errors.comment && (
                                <p className="flex items-center gap-1 text-xs text-red-500">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.comment.message}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading || progress < 100}
                                className="
                                    flex-1 flex items-center justify-center gap-2
                                    px-4 py-2.5
                                    text-sm font-medium text-white
                                    bg-gradient-to-r 
                                    to-indigo-600 from-blue-600
                                    hover:bg-sky-700
                                    rounded-lg
                                    transition-colors
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    focus:outline-none focus:ring-1 focus:ring-sky-500 focus:ring-offset-2
                                "
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Отправка...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Отправить рейтинг
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-400 border-dashed rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:ring-offset-2"
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Live Preview Sidebar */}
            <div className="lg:col-span-1">
                <div className="sticky space-y-4 top-6">
                    {/* Overall Rating Card */}
                    <div className="relative p-5 overflow-hidden text-white border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-indigo-700">
                        <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 rounded-full bg-white/10" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 -mb-10 -ml-10 rounded-full bg-white/10" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="w-4 h-4" />
                                <p className="text-xs font-medium text-white/80">Общая оценка</p>
                            </div>

                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-5xl font-bold">{avgRating}</span>
                                <span className="mb-1 text-xl font-medium text-white/80">/5.0</span>
                            </div>

                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 transition-all duration-300 ${
                                            star <= Math.round(parseFloat(avgRating))
                                                ? 'fill-yellow-300 text-yellow-300'
                                                : 'fill-white/20 text-white/20'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Individual Ratings */}
                    <Card className="p-5 border-0 shadow-xl bg-white/80 backdrop-blur">
                        <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                            Детализация
                        </h3>

                        <div className="space-y-3">
                            {/* Quality */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-gray-700">
                                        Качество
                                    </span>
                                    <span className="text-xs font-bold text-gray-900">
                                        {watchedValues.quality}/5
                                    </span>
                                </div>
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-500 bg-gradient-to-r from-green-400 to-emerald-500"
                                        style={{ width: `${(watchedValues.quality / 5) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Time */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-gray-700">Сроки</span>
                                    <span className="text-xs font-bold text-gray-900">
                                        {watchedValues.time}/5
                                    </span>
                                </div>
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-cyan-500"
                                        style={{ width: `${(watchedValues.time / 5) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-gray-700">Цена</span>
                                    <span className="text-xs font-bold text-gray-900">
                                        {watchedValues.price}/5
                                    </span>
                                </div>
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-500 bg-gradient-to-r from-purple-400 to-pink-500"
                                        style={{ width: `${(watchedValues.price / 5) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Comment Preview */}
                    {watchedValues.comment && (
                        <Card className="p-5 duration-300 border-0 shadow-xl bg-white/80 backdrop-blur animate-in slide-in-from-top">
                            <h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                Комментарий
                            </h3>
                            <p className="text-xs italic leading-relaxed text-gray-700">
                                "{watchedValues.comment}"
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
