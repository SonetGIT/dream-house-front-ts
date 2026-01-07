import { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { router } from './app/router.tsx';
import { store } from './app/store.ts';
import { CustomToaster } from './components/ui/CustomToaster.tsx';
import './index.css';
import './styles/table.css';
import './styles/form.css';
import './styles/dashboard.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            {/* RouterProvider рендерит всё приложение, согласно маршрутам, описанным в router.tsx. App.tsx  */}
            <CustomToaster />
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>
);
