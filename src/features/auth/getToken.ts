export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    return token && token.trim() !== '' ? token : null;
};

export const setToken = (token: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('token', token);
};

export const removeToken = () => {
    if (typeof window !== 'undefined') localStorage.removeItem('token');
};
