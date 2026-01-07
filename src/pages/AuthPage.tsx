import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { authUser, fetchProfile, changeOwnPassword } from '../features/auth/authSlice';
import { type AuthCredentials } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ChangePasswordModal from '@/components/ui/ChangePasswordModal';

export default function AuthPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { user, loading, error, resetRequired } = useAppSelector((state) => state.auth);
    const [authForm, setAuthForm] = useState<AuthCredentials>({
        username: '',
        password: '',
    });

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
    });

    useEffect(() => {
        if (!user && localStorage.getItem('token')) {
            dispatch(fetchProfile());
        }
    }, [user, dispatch]);

    /* Редирект если пользователь авторизован и НЕ нужно менять пароль */
    useEffect(() => {
        if (user && !resetRequired) {
            navigate('/');
        }
    }, [user, resetRequired, navigate]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAuthForm({ ...authForm, [e.target.id]: e.target.value });
    };

    const handleModalChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.id]: e.target.value });
    };

    const onHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(authUser(authForm));
    };

    const handlePasswordSave = () => {
        if (!passwords.oldPassword || !passwords.newPassword) {
            toast.error('Введите оба пароля');
            return;
        }

        dispatch(changeOwnPassword(passwords))
            .unwrap()
            .then((res) => {
                toast.success(res.message);
                setPasswords({ oldPassword: '', newPassword: '' }); // очистить форму
            })
            .catch((err: string) => toast.error(err));
    };

    /*******************************************************************************************************************************/
    return (
        <div className="container">
            <section id="content">
                <div>
                    <h1>Форма входа</h1>

                    <form onSubmit={onHandleSubmit}>
                        <input
                            id="username"
                            type="text"
                            placeholder="username"
                            required
                            value={authForm.username}
                            onChange={handleChange}
                        />

                        <input
                            id="password"
                            type="password"
                            placeholder="password"
                            required
                            value={authForm.password}
                            onChange={handleChange}
                        />

                        <input
                            type="submit"
                            disabled={loading}
                            value={loading ? 'Вход...' : 'Войти'}
                        />
                    </form>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </div>
            </section>

            <ChangePasswordModal
                open={resetRequired}
                oldPassword={passwords.oldPassword}
                newPassword={passwords.newPassword}
                onChange={handleModalChange}
                onSave={handlePasswordSave}
                onClose={() => {}}
            />
        </div>
    );
}
