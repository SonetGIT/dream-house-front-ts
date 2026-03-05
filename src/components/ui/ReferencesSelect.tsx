interface ReferenceSelectProps {
    options: any[];
    value?: number | null;
    onChange: (value: number | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function ReferencesSelect({
    options,
    value,
    onChange,
    placeholder = 'Выберите',
    className,
    disabled = false,
}: ReferenceSelectProps) {
    return (
        <select
            disabled={disabled}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            className={
                className ??
                'w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
            }
        >
            <option value="">{placeholder}</option>

            {options.map((item: any) => (
                <option key={item.id} value={item.id}>
                    {item.name}
                </option>
            ))}
        </select>
    );
}
