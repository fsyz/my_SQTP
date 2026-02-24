
import React, { useState, useEffect } from 'react';
import { User, UserRole, Post, Resource, Word, UserSuggestion, MistakeRecord } from './types';
import { INITIAL_WORDS, loadData, saveData } from './store';
import { API_BASE_URL } from './config';
import Login from './components/Login';
import Forum from './components/Forum';
import ResourcesSection from './components/ResourcesSection';
import WordQuiz from './components/WordQuiz';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => loadData('current_user', null));
  const [activeTab, setActiveTab] = useState('forum');

  // App States
  const [posts, setPosts] = useState<Post[]>([]);
  const [quote, setQuote] = useState(() => loadData('quote', '书山有路勤为径，学海无涯苦作舟。'));
  const [resources, setResources] = useState<Resource[]>([]);
  const [words, setWords] = useState<Word[]>(() => loadData('words', INITIAL_WORDS));
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>(() => loadData('suggestions', []));
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => loadData('mistakes', []));

  useEffect(() => { saveData('current_user', user); }, [user]);
  useEffect(() => { saveData('posts', posts); }, [posts]);
  useEffect(() => { saveData('quote', quote); }, [quote]);
  useEffect(() => { saveData('resources', resources); }, [resources]);
  useEffect(() => { saveData('words', words); }, [words]);
  useEffect(() => { saveData('suggestions', suggestions); }, [suggestions]);
  useEffect(() => { saveData('mistakes', mistakes); }, [mistakes]);

  // 页面加载时，从后端获取每日励志名言 + 帖子列表
  useEffect(() => {
    // 获取每日名言
    fetch(`${API_BASE_URL}/forum/quote`)
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setQuote(data.content);
        }
      })
      .catch(err => {
        console.error('获取名言失败:', err);
      });

    // 获取帖子列表
    fetch(`${API_BASE_URL}/forum/posts`)
      .then(res => res.json())
      .then(data => {
        const mappedPosts: Post[] = data.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          content: item.content,
          author: item.author,
          link: item.link,
          date: item.created_at ? item.created_at.split('T')[0] : '',
        }));
        setPosts(mappedPosts);
      })
      .catch(err => {
        console.error('获取帖子失败:', err);
      });

    // 获取学习资料列表
    fetch(`${API_BASE_URL}/resources`)
      .then(res => res.json())
      .then(data => {
        const mappedResources: Resource[] = data.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          module: item.module,
          url: item.file_path,
          date: item.created_at ? item.created_at.split('T')[0] : '',
        }));
        setResources(mappedResources);
      })
      .catch(err => {
        console.error('获取资料失败:', err);
      });
  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const isAdmin = user.role === UserRole.ADMIN;

  return (
    // Fixed: Changed 'class' back to 'className' for React
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <span className="text-2xl font-bold text-blue-600">学令教育</span>
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => setActiveTab('forum')}
                  className={`px - 3 py - 2 text - sm font - medium ${activeTab === 'forum' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  论坛区
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`px - 3 py - 2 text - sm font - medium ${activeTab === 'resources' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  资料区
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px - 3 py - 2 text - sm font - medium ${activeTab === 'quiz' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} `}
                >
                  单词默写器
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px - 3 py - 2 text - sm font - medium ${activeTab === 'admin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} `}
                  >
                    后台管理
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">欢迎, {user.username} ({isAdmin ? '管理员' : '学生'})</span>
              <button
                onClick={() => setUser(null)}
                className="text-sm text-red-500 hover:underline"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'forum' && (
          <Forum
            posts={posts}
            setPosts={setPosts}
            quote={quote}
            setQuote={setQuote}
            isAdmin={isAdmin}
          />
        )}
        {activeTab === 'resources' && (
          <ResourcesSection
            resources={resources}
            setResources={setResources}
            isAdmin={isAdmin}
            user={user}
            suggestions={suggestions}
            setSuggestions={setSuggestions}
          />
        )}
        {activeTab === 'quiz' && (
          <WordQuiz
            words={words}
            setWords={setWords}
            mistakes={mistakes}
            setMistakes={setMistakes}
            isAdmin={isAdmin}
            user={user}
          />
        )}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel
            suggestions={suggestions}
            setSuggestions={setSuggestions}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="text-center text-gray-400 text-sm">
          &copy; 2024 学令教育学习平台 版权所有
        </div>
      </footer>
    </div>
  );
};

export default App;
