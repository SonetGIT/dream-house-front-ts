import type { MaterialFormData } from './materialsSlice';

const validId = (value: number | '') => Number.isInteger(value) && Number(value) > 0;

export function validateMaterial(data: MaterialFormData, creating: boolean) {
    if (!data.name.trim()) return 'Укажите название материала';
    if (!validId(data.unit_of_measure)) return 'Выберите единицу измерения';
    if (data.type !== '' && !validId(data.type)) return 'Выберите корректный тип материала';
    if (creating && data.coefficient.trim() !== '' &&
        (!Number.isFinite(Number(data.coefficient)) || Number(data.coefficient) < 0)) {
        return 'Укажите корректный коэффициент';
    }
    return null;
}

export function materialPayload(data: MaterialFormData, creating: boolean) {
    const error = validateMaterial(data, creating);
    if (error) throw new Error(error);
    return {
        name: data.name.trim(),
        unit_of_measure: Number(data.unit_of_measure),
        ...(data.type !== '' ? { type: Number(data.type) } : {}),
        description: data.description,
        ...(creating && data.coefficient.trim() !== '' ? { coeffitient: Number(data.coefficient) } : {}),
    };
}
