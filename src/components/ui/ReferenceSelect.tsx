import type { EnumItem } from '@/features/reference/referenceService';
import { Autocomplete, TextField, autocompleteClasses } from '@mui/material';
import { useMemo } from 'react';

// Базовые стили — вынесены, но адаптированы под size="small"
const createReferenceSelectSx = (minWidth: number = 190) => ({
    minWidth,

    '& .MuiOutlinedInput-root': {
        backgroundColor: '#f8f8f8',
        padding: '0 8px',
    },

    '& .MuiAutocomplete-input': {
        fontSize: '0.700rem', // лучше использовать rem
        padding: 0,
        // height: 9,
        // minHeight: '20px', // достаточно для текста
    },

    '&:hover .MuiOutlinedInput-root': {
        backgroundColor: '#f5fbff',
    },

    [`& .${autocompleteClasses.listbox}`]: {
        padding: 0,
    },

    [`& .${autocompleteClasses.option}`]: {
        minHeight: 9,
        padding: '4px 10px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },

    // Убираем фокус-обводку, если нужно — по дизайну
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: '1px solid #8eb9ed',
    },

    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#afafaf',
    },

    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#8eb9ed',
    },
});

interface ReferenceSelectProps {
    label: string;
    placeholder?: string;
    // value — либо id (number/string), либо пустая строка для "не выбрано"
    value: number | string | '';
    onChange: (value: number | string | '') => void;
    options: EnumItem[];
    loading?: boolean;
    minWidth?: number;
    disabled?: boolean;
    sx?: typeof createReferenceSelectSx;
}

/*******************************************************************************************************************************/
export function ReferenceSelect(props: ReferenceSelectProps) {
    const selectedOption = useMemo(() => {
        if (props.value === '' || props.value == null) return null;
        return (
            props.options.find(
                (opt) =>
                    // Сравниваем как строки, чтобы избежать type mismatch
                    String(opt.id) === String(props.value)
            ) ?? null
        );
    }, [props.value, props.options]);

    return (
        <Autocomplete<EnumItem, false, false, false>
            options={props.options}
            loading={props.loading}
            sx={createReferenceSelectSx(props.minWidth)}
            size="small"
            value={selectedOption}
            onChange={(_, newValue) => {
                // Передаём id или '' если ничего не выбрано
                props.onChange(newValue ? newValue.id : '');
            }}
            isOptionEqualToValue={(option, value) =>
                value != null && String(option.id) === String(value.id)
            }
            getOptionLabel={(option) => (option?.name ? String(option.name) : '')}
            disabled={props.disabled}
            renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                    <li key={key} {...rest}>
                        {option.name}
                    </li>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={props.label}
                    placeholder={props.placeholder}
                    size="small"
                    InputProps={{
                        ...params.InputProps,
                    }}
                />
            )}
        />
    );
}
