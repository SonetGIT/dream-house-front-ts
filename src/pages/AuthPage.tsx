import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { authUser } from '../features/auth/authSlice';
import { type AuthCredentials } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RESET_PASSWORD_SOURCE_KEY = 'resetPasswordSource';

export default function AuthPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { loading, error } = useAppSelector((state) => state.auth);
    const [authForm, setAuthForm] = useState<AuthCredentials>({
        username: '',
        password: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAuthForm({ ...authForm, [e.target.id]: e.target.value });
    };

    const onHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        dispatch(authUser(authForm))
            .unwrap()
            .then((res) => {
                if (res.data.required_action === 'RESET_PASSWORD') {
                    sessionStorage.setItem(RESET_PASSWORD_SOURCE_KEY, authForm.password);
                } else {
                    sessionStorage.removeItem(RESET_PASSWORD_SOURCE_KEY);
                }

                navigate('/projects');
            })
            .catch((err) => {
                toast.error(err);
            });
    };

    return (
        <div className="container">
            <section id="content">
                <div>
                    <h1>{'\u0424\u043e\u0440\u043c\u0430 \u0432\u0445\u043e\u0434\u0430'}</h1>

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
                            value={
                                loading
                                    ? '\u0412\u0445\u043e\u0434...'
                                    : '\u0412\u043e\u0439\u0442\u0438'
                            }
                        />
                    </form>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </div>
            </section>
        </div>
    );
}
