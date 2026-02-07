export function formatDateTime(value?: string | null, withTime: boolean = true) {
    if (!value) return '';

    const d = new Date(value);

    const date = d.toLocaleDateString('ru-RU');

    if (!withTime) {
        return date;
    }

    const time = d.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${date} - ${time}`;
}
