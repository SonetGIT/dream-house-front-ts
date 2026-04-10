export const STATUS_MAP: Record<number, { label: string; color: string; bg: string; border: string; dot: string }> = {
    1: { label: 'Черновик',         color: 'text-gray-600',   bg: 'bg-gray-100',    border: 'border-gray-300',   dot: 'bg-gray-400' },
    2: { label: 'На согласовании',  color: 'text-blue-700',   bg: 'bg-blue-50',     border: 'border-blue-300',   dot: 'bg-blue-500' },
    3: { label: 'Утверждён',        color: 'text-emerald-700',bg: 'bg-emerald-50',  border: 'border-emerald-300',dot: 'bg-emerald-500' },
    4: { label: 'Отклонён',         color: 'text-red-700',    bg: 'bg-red-50',      border: 'border-red-300',    dot: 'bg-red-500' },
};

export const UNIT_MAP: Record<number, string> = {
    1: 'т',
    2: 'кг',
    3: 'м³',
    4: 'м²',
    5: 'п.м',
    6: 'шт',
    7: 'компл',
};

export const CURRENCY_MAP: Record<number, string> = {
    1: '₸',
    2: '$',
    3: '€',
    4: '₽',
};

export const SERVICE_TYPE_MAP: Record<number, string> = {
    1: 'Работа',
    2: 'Материал',
    3: 'Оборудование',
};

export const ITEM_TYPE_MAP: Record<number, string> = {
    1: 'Основной',
    2: 'Дополнительный',
    3: 'Прочий',
};

export const PROJECT_MAP: Record<number, string> = {
    101: 'ЖК «Фламинго»',
    102: 'БЦ «Арена»',
    103: 'Жилой дом №5',
};

export const BLOCK_MAP: Record<number, string> = {
    1: 'Блок А',
    2: 'Блок Б',
    3: 'Блок В',
    4: 'Блок Г',
};

export const STATUSES = [
    { value: 0, label: 'Все статусы' },
    { value: 1, label: 'Черновик' },
    { value: 2, label: 'На согласовании' },
    { value: 3, label: 'Утверждён' },
    { value: 4, label: 'Отклонён' },
];

export const PROJECTS = [
    { value: 0, label: 'Все проекты' },
    { value: 101, label: 'ЖК «Фламинго»' },
    { value: 102, label: 'БЦ «Арена»' },
    { value: 103, label: 'Жилой дом №5' },
];

export const BLOCKS = [
    { value: 0, label: 'Все блоки' },
    { value: 1, label: 'Блок А' },
    { value: 2, label: 'Блок Б' },
    { value: 3, label: 'Блок В' },
    { value: 4, label: 'Блок Г' },
];
