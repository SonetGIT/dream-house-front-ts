// фун-я БЕЗ с hour / minute
// export const formatDate = (dateStr: string) => {
//     if (!dateStr) return '—';
//     const date = new Date(dateStr);
//     return date.toLocaleDateString('ru-RU');
// };

export const formatDate = (value?: string | null) =>
    value
        ? new Date(value).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })
        : '—';
