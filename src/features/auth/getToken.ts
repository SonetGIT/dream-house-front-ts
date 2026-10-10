import { authClient } from './authSession';

export const getToken = (): string | null => authClient.getSession()?.accessToken ?? null;
