const KG_PREFIX = '996';

/**
 * Оставляет только цифры
 */
export function normalizePhone(value?: string | null): string {
    if (!value) return '';
    return value.replace(/\D/g, '');
}

/**
 * Приводит номер к формату хранения: 996XXXXXXXXX
 */
export function toStoragePhone(value?: string | null): string | null {
    const digits = normalizePhone(value);

    if (!digits) return null;

    // если начинается с 0 → заменяем на 996
    if (digits.startsWith('0')) {
        return KG_PREFIX + digits.slice(1);
    }

    // если уже с 996
    if (digits.startsWith(KG_PREFIX)) {
        return digits;
    }

    // если просто 9 цифр (без кода)
    if (digits.length === 9) {
        return KG_PREFIX + digits;
    }

    return digits;
}

/** Для формы ввода: +996 XXX XXX XXX */
export function formatPhoneInput(value?: string | null): string {
    const digits = normalizePhone(value);

    if (!digits) return '';

    // убираем префикс 996
    const local = digits.startsWith(KG_PREFIX) ? digits.slice(3) : digits;

    let result = '+996';

    if (local.length > 0) {
        result += ' ' + local.slice(0, 3);
    }
    if (local.length > 3) {
        result += ' ' + local.slice(3, 6);
    }
    if (local.length > 6) {
        result += ' ' + local.slice(6, 9);
    }

    return result;
}

/* Красивое отображение в таблице: +996 (555) 123-456 */
export function formatPhoneDisplay(value?: string | null): string {
    const digits = normalizePhone(value);

    if (digits.length !== 12 || !digits.startsWith(KG_PREFIX)) {
        return '—';
    }

    return `+996 (${digits.slice(3, 6)}) ${digits.slice(6, 9)}-${digits.slice(9, 12)}`;
}
