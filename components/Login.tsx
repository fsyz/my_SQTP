
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'xueling' && password === 'xl123456') {
      onLogin({ id: 'admin-1', username: 'xueling', role: UserRole.ADMIN });
      return;
    }
    
    // Simple mock logic for users (stored in local storage as a list would be better, but we just mock one here)
    if (username && password) {
      onLogin({ id: 'user-' + Date.now(), username, phone, role: UserRole.USER });
    } else {
      setError('请输入账号和密码');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !phone) {
      setError('请填写所有字段');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号码');
      return;
    }
    onLogin({ id: 'user-' + Date.now(), username, phone, role: UserRole.USER });
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
