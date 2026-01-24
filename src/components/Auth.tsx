/**
 * Компонент авторизации
 * Поддерживает: Email/Password вход, Google OAuth, регистрацию
 */

import { useState, useEffect } from 'react';
import { auth, supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthProps {
  onAuthSuccess?: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  
  // Форма
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Проверка текущего пользователя при загрузке
  useEffect(() => {
    checkUser();

    // Подписка на изменения auth состояния
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && onAuthSuccess) {
        onAuthSuccess();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    setLoading(true);
    const { user: currentUser } = await auth.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await auth.signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      setUser(data.user);
      setLoading(false);
      if (onAuthSuccess) onAuthSuccess();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { data, error: signUpError } = await auth.signUp(email, password);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setMessage('Проверьте вашу почту для подтверждения регистрации!');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { error: resetError } = await auth.resetPassword(email);

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage('Письмо для сброса пароля отправлено на вашу почту!');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    const { error: googleError } = await auth.signInWithGoogle();
    
    if (googleError) {
      setError(googleError.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await auth.signOut();
    setUser(null);
    setLoading(false);
  };

  // Если пользователь авторизован - показываем профиль
  if (user) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Добро пожаловать!</h3>
            <p className="text-sm text-slate-600">{user.email}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user.email?.[0].toUpperCase()}
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {loading ? 'Выход...' : 'Выйти'}
        </button>
      </div>
    );
  }

  // Форма авторизации
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {mode === 'signin' && 'Вход'}
          {mode === 'signup' && 'Регистрация'}
          {mode === 'reset' && 'Сброс пароля'}
        </h2>
        <p className="text-sm text-slate-600">
          {mode === 'signin' && 'Войдите, чтобы сохранять объекты'}
          {mode === 'signup' && 'Создайте аккаунт для сохранения объектов'}
          {mode === 'reset' && 'Введите email для восстановления пароля'}
        </p>
      </div>

      {/* Сообщения об ошибках */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Успешные сообщения */}
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {message}
        </div>
      )}

      {/* Google Sign In */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full mb-4 bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-lg font-medium hover:border-slate-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Войти через Google
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">или</span>
        </div>
      </div>

      {/* Email/Password форма */}
      <form onSubmit={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleResetPassword}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        {mode !== 'reset' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 mb-4"
        >
          {loading ? 'Загрузка...' : 
            mode === 'signin' ? 'Войти' : 
            mode === 'signup' ? 'Зарегистрироваться' : 
            'Отправить ссылку'}
        </button>

        {/* Переключение режимов */}
        <div className="text-center text-sm">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Нет аккаунта? Зарегистрируйтесь
              </button>
              <span className="mx-2 text-slate-400">•</span>
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Забыли пароль?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Уже есть аккаунт? Войдите
            </button>
          )}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Вернуться к входу
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
