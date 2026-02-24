
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { API_BASE_URL } from '../config';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入账号和密码');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // 后端返回 { id, username, role, token }
        onLogin({
          id: String(data.id),
          username: data.username,
          role: data.role === 'admin' ? UserRole.ADMIN : UserRole.USER,
        });
      } else {
        setError(data.detail || '登录失败，请检查用户名和密码');
      }
    } catch (err) {
      console.error('登录请求出错:', err);
      setError('网络错误，请检查后端是否运行');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !phone) {
      setError('请填写所有字段');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号码');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('phone', phone);
    formData.append('password', password);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // 注册成功，自动调用登录
        setError('');
        const loginForm = new FormData();
        loginForm.append('username', username);
        loginForm.append('password', password);

        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          body: loginForm,
        });

        const loginData = await loginRes.json();

        if (loginRes.ok) {
          onLogin({
            id: String(loginData.id),
            username: loginData.username,
            role: loginData.role === 'admin' ? UserRole.ADMIN : UserRole.USER,
          });
        } else {
          // 注册成功但自动登录失败，提示用户手动登录
          setError('注册成功！请切换到登录页面手动登录');
          setIsRegister(false);
        }
      } else {
        setError(data.detail || '注册失败，请稍后再试');
      }
    } catch (err) {
      console.error('注册请求出错:', err);
      setError('网络错误，请检查后端是否运行');
    }
  };

  return (
    // Fixed: Changed 'class' back to 'className' for React
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">学令教育</h1>
        <p className="text-center text-gray-500 mb-8">{isRegister ? '手机号绑定注册' : '平台用户登录'}</p>

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e: any) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入用户名"
            />
          </div>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700">手机号码</label>
              <input
                type="tel"
                value={phone}
                onChange={(e: any) => setPhone(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="11位手机号"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入密码"
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            {isRegister ? '注册并登录' : '立即登录'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-blue-600 hover:underline text-sm"
          >
            {isRegister ? '已有账号？去登录' : '没有账号？手机注册'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
