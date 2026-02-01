import { type ReactElement, createElement } from 'react';
import {
    Image,
    PictureAsPdf,
    InsertDriveFile,
    Description,
    TableChart,
    Slideshow,
    Archive,
    TextSnippet,
    Code,
    VideoFile,
    AudioFile,
} from '@mui/icons-material';

/**
 * Возвращает иконку файла по MIME-типу и имени
 * @param mime - MIME-тип файла (например: 'application/pdf')
 * @param filename - Имя файла (например: 'document.docx')
 * @returns ReactElement с иконкой
 */
export const getFileIcon = (mime: string = '', filename: string = ''): ReactElement => {
    // Проверка по MIME-типу
    if (mime.startsWith('image/')) {
        return createElement(Image, { color: 'primary' });
    }

    if (mime === 'application/pdf') {
        return createElement(PictureAsPdf, { color: 'error' });
    }

    // Office документы по MIME
    if (
        [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ].includes(mime)
    ) {
        return createElement(Description, { color: 'primary' });
    }

    if (
        [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ].includes(mime)
    ) {
        return createElement(TableChart, { color: 'success' });
    }

    if (
        [
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ].includes(mime)
    ) {
        return createElement(Slideshow, { color: 'warning' });
    }

    // Архивы
    if (
        [
            'application/zip',
            'application/x-zip-compressed',
            'application/x-rar-compressed',
        ].includes(mime)
    ) {
        return createElement(Archive, { color: 'secondary' });
    }

    // Текстовые файлы
    if (mime.startsWith('text/') || mime === 'application/json') {
        return createElement(TextSnippet, { color: 'info' });
    }

    // Код
    if (['application/javascript', 'text/html', 'text/css', 'application/xml'].includes(mime)) {
        return createElement(Code, { color: 'info' });
    }

    // Видео
    if (mime.startsWith('video/')) {
        return createElement(VideoFile, { color: 'secondary' });
    }

    // Аудио
    if (mime.startsWith('audio/')) {
        return createElement(AudioFile, { color: 'secondary' });
    }

    // Проверка по расширению (fallback)
    const ext = filename.split('.').pop()?.toLowerCase();

    if (ext) {
        switch (ext) {
            case 'doc':
            case 'docx':
                return createElement(Description, { color: 'primary' });

            case 'xls':
            case 'xlsx':
                return createElement(TableChart, { color: 'success' });

            case 'ppt':
            case 'pptx':
                return createElement(Slideshow, { color: 'warning' });

            case 'zip':
            case 'rar':
            case '7z':
                return createElement(Archive, { color: 'secondary' });

            case 'txt':
            case 'log':
            case 'csv':
                return createElement(TextSnippet, { color: 'info' });

            case 'js':
            case 'ts':
            case 'html':
            case 'css':
            case 'json':
            case 'xml':
                return createElement(Code, { color: 'info' });

            case 'mp4':
            case 'avi':
            case 'mov':
                return createElement(VideoFile, { color: 'secondary' });

            case 'mp3':
            case 'wav':
            case 'ogg':
                return createElement(AudioFile, { color: 'secondary' });
        }
    }

    // Иконка по умолчанию
    return createElement(InsertDriveFile);
};
