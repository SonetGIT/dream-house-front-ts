export function formatPhone(phone?: string | null) {
    if (!phone) return '—';

    const digits = phone.replace(/\D/g, '');

    if (digits.length === 12 && digits.startsWith('996')) {
        return `+996 (${digits.slice(3, 6)}) ${digits.slice(6, 9)}-${digits.slice(9, 12)}`;
    }

    return phone;
}
