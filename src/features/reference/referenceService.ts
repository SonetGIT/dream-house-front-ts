export interface EnumItem {
    id: number | string;
    name?: string;
    type?: number;
    unit_of_measure?: number;
    currency?: string;
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

    private transformItem(item: Record<string, unknown>, mapping: EnumFieldMapping): EnumItem {
        const result: EnumItem = {
            id: String(item[mapping.id]),
        };

        for (const [key, path] of Object.entries(mapping)) {
            if (key === 'id') continue;

            if (Array.isArray(path)) {
                const value = path
                    .map((p) => (p === ' ' || p === '-' ? p : String(item[p] ?? '')))
                    .join('')
                    .trim();

                result[key] = value || null;
            } else {
                result[key] = item[path] != null ? String(item[path]) : null;
            }
        }

        return result;
    }
}
