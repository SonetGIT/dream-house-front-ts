import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export interface MultiSelectCheckmarksProps<T> {
    label: string;
    options?: T[];
    getOptionLabel?: (option: T) => string; // строго string
    value?: T[];
    onChange?: (value: T[]) => void;
}

/*************************************************************************************************************/
export function MultiSelectCheckmarks<T extends { id: number | string }>({
    label,
    options = [],
    getOptionLabel,
    value = [],
    onChange,
}: MultiSelectCheckmarksProps<T>) {
    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const selectedIds = event.target.value as string[];
        const newValue = options.filter((option) => selectedIds.includes(option.id.toString()));
        onChange?.(newValue);
    };

    const renderLabel = (option: T) => (getOptionLabel ? getOptionLabel(option) : String(option));

    return (
        <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel>{label}</InputLabel>
            <Select
                multiple
                value={value.map((v) => v.id.toString())}
                onChange={handleChange}
                input={<OutlinedInput label={label} />}
                renderValue={(selected) =>
                    options
                        .filter((opt) => (selected as string[]).includes(opt.id.toString()))
                        .map(renderLabel)
                        .join(', ')
                }
                MenuProps={MenuProps}
            >
                {options.map((option) => (
                    <MenuItem key={option.id} value={option.id.toString()}>
                        <Checkbox checked={value.some((v) => v.id === option.id)} />
                        <ListItemText primary={renderLabel(option)} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
