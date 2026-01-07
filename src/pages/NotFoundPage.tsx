import { Link } from '@mui/material';

export default function NotFoundPage() {
    return (
        <div style={{ textAlign: 'center' }}>
            <h1>404</h1>
            <h3>Page Not Found</h3>
            <Link href="/">Back to home</Link>
        </div>
    );
}
