export const compactFieldSx = {
    width: 150,

    '& .MuiInputBase-root': {
        fontSize: '0.875rem',
        minHeight: '27px',

        /* hover */
        '&:hover .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #8eb9ed',
        },

        /* focus */
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #8eb9ed',
        },
    },

    '& .MuiInputBase-input': {
        padding: '6px 8px',
    },

    /* убираем стрелки у number */
    '& input[type=number]::-webkit-outer-spin-button, \
     & input[type=number]::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
    },

    '& input[type=number]': {
        MozAppearance: 'textfield',
    },
};

// Стили ячейки таблицы
export const tableCellSx = {
    px: 1,
    py: 0.5,
    verticalAlign: 'top',
    padding: 2,
};
