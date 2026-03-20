import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
    value: number; // 0-5
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    className?: string;
}

/**
 * Компонент рейтинга в виде звездочек
 */
export default function Rating({
    value,
    max = 5,
    size = 'md',
    showValue = false,
    className = '',
}: RatingProps) {
    // Размеры звезд
    const sizes = {
        sm: {
            star: 'w-3.5 h-3.5',
            text: 'text-xs',
        },
        md: {
            star: 'w-4 h-4',
            text: 'text-sm',
        },
        lg: {
            star: 'w-5 h-5',
            text: 'text-base',
        },
    };

    const currentSize = sizes[size];

    // Генерация звезд
    const stars = Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = value >= starValue;
        const isHalf = value >= starValue - 0.5 && value < starValue;

        return (
            <span key={i} className="relative">
                {isHalf ? (
                    <StarHalf className={`${currentSize.star} fill-yellow-400 text-yellow-400`} />
                ) : (
                    <Star
                        className={`${currentSize.star} ${
                            isFilled
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-300'
                        }`}
                    />
                )}
            </span>
        );
    });

    return (
        <div className={`flex items-center gap-0.5 ${className}`}>
            {stars}
            {showValue && value != null && (
                <span className={`ml-1.5 ${currentSize.text} text-gray-600 font-medium`}>
                    {value.toFixed(1)}
                </span>
            )}
        </div>
    );
}
