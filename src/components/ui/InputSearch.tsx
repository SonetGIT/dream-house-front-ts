import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Close';
import { StyledTooltip } from './StyledTooltip';

const Search = styled('div')({
    position: 'relative',
    borderRadius: 5,
    border: '1px solid #afafaf',
    backgroundColor: '#f8f8f8',
    '&:hover': {
        backgroundColor: '#f5fbff',
        borderColor: '#8eb9ed',
    },
    // width: '100%',
    width: 280,
    height: 37,
    display: 'flex',
    alignItems: 'center',
});

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 1),
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
}));

const ClearIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 1),
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: '#94a3b8',
    '&:hover': {
        color: '#ef4444',
    },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    flex: 1,
    '& .MuiInputBase-input': {
        padding: '4px 0',
        // paddingLeft: `calc(1em + ${theme.spacing(2)})`,
        paddingRight: theme.spacing(2),
        // fontSize: 12,
    },
}));

interface PropsType {
    value: string;
    onChange: (value: string) => void;
    onEnter?: () => void;
}

export default function InputSearch(props: PropsType) {
    const { value, onChange, onEnter } = props;

    return (
        <Search>
            <SearchIconWrapper>
                <SearchIcon fontSize="small" />
            </SearchIconWrapper>

            <StyledInputBase
                placeholder="Поиск…"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onEnter?.();
                    }
                }}
                inputProps={{ 'aria-label': 'search' }}
            />

            {value && (
                <ClearIconWrapper onClick={() => onChange('')}>
                    <StyledTooltip title="Очистить">
                        <ClearIcon fontSize="small" />
                    </StyledTooltip>
                </ClearIconWrapper>
            )}
        </Search>
    );
}
