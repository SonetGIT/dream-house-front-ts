export interface EnumItem {
    id: number | string;
    name?: string;
    type?: number;
    unit_of_measure?: number;
    [key: string]: string | number | boolean | null | undefined;
}

interface EnumFieldMapping {
    id: string;
    [key: string]: string | string[]; // путь всегда строка или массив строк
}

export interface EnumConfig {
    [enumDef: string]: {
        apiName: string;
        data: EnumFieldMapping;
    };
}

export class ReferenceService {
    private baseUrl: string;
    private token: string;
    private config: EnumConfig;

    constructor(baseUrl: string, token: string, config: EnumConfig) {
        this.baseUrl = baseUrl;
        this.token = token;
        this.config = config;
    }

    async getEnum(enumDef: string): Promise<EnumItem[]> {
        const conf = this.config[enumDef];
        if (!conf) {
            throw new Error(`Config not found for enumDef: ${enumDef}`);
        }

        const url = `${this.baseUrl}${conf.apiName}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} — ${conf.apiName}`);
        }

        const { data } = await response.json();
        if (!Array.isArray(data)) {
            throw new Error(`Expected array in 'data' for ${conf.apiName}`);
        }

        return data.map((item) => this.transformItem(item, conf.data));
    }

    // private transformItem(item: Record<string, unknown>, mapping: EnumFieldMapping): EnumItem {
    //     const result: EnumItem = {
    //         id: (item[mapping.id] as string | number) ?? '',
    //     };

    //     for (const [key, path] of Object.entries(mapping)) {
    //         if (key === 'id') continue;

    //         // 1️⃣ Массив — ТОЛЬКО для строк
    //         if (Array.isArray(path)) {
    //             result[key] =
    //                 path
    //                     .map((part) =>
    //                         part === '-' || part === ' ' ? part : String(item[part] ?? '')
    //                     )
    //                     .join('')
    //                     .trim() || null;

    //             continue;
    //         }

    //         // 2️⃣ Одиночное поле
    //         const value = item[path];

    //         // 🔥 ВАЖНО: числовые поля приводим явно
    //         if (key === 'type' || key.endsWith('_id')) {
    //             result[key] =
    //                 value !== null && value !== undefined && value !== '' ? Number(value) : null;
    //             continue;
    //         }

    //         // 3️⃣ Остальное — как есть
    //         result[key] = value ?? null;
    //     }

    //     return result;
    // }

    private transformItem(item: Record<string, unknown>, mapping: EnumFieldMapping): EnumItem {
        // Создаём корректно типизированный EnumItem

        const result: EnumItem = {
            id: (item[mapping.id] as string | number) ?? '',
        };
        // console.log('item2', item);
        // console.log('result2', result);

        for (const [key, path] of Object.entries(mapping)) {
            if (key === 'id') continue;

            if (Array.isArray(path)) {
                // поддержка массива строк (например ["name_ru", " ", "name_kg"])
                result[key] =
                    path
                        .map((part) =>
                            part === '-' || part === ' '
                                ? part
                                : (item[part] as string | number | null) ?? ''
                        )
                        .join('')
                        .trim() || null;
            } else {
                // обычная строка
                const value = item[path];
                result[key] = (value as string | number | boolean | null | undefined) ?? null;
            }
        }
        return result;
    }
}
