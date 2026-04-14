import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
    },
});

// export default defineConfig({
//     plugins: [react()],
//     resolve: {
//         alias: {
//             '@': path.resolve(__dirname, 'src'),
//         },
//     },
//     server: {
//         host: '0.0.0.0',
//         port: 5173,
//         strictPort: true,

//         hmr: {
//             host: '77.235.27.71', // ВАЖНО
//             protocol: 'ws',
//             port: 5173,
//         },
//     },
// });
