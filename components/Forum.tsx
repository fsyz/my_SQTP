
import React, { useState } from 'react';
import { Post } from '../types';
import { API_BASE_URL } from '../config';

interface ForumProps {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  quote: string;
  setQuote: (q: string) => void;
  isAdmin: boolean;
}

const Forum: React.FC<ForumProps> = ({ posts, setPosts, quote, setQuote, isAdmin }) => {
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [tempQuote, setTempQuote] = useState(quote);
  const [showPostModal, setShowPostModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLink, setNewLink] = useState('');

  const saveQuote = () => {
    setQuote(tempQuote);
    setIsEditingQuote(false);
  };

  const handleCreatePost = async () => {
    if (!newTitle || !newContent) return;

    // 用 URLSearchParams 拼接查询参数
    const params = new URLSearchParams({
      title: newTitle,
      content: newContent,
      author: '管理员',
    });
    if (newLink) {
      params.append('link', newLink);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/forum/posts?${params.toString()}`, {
        method: 'POST',
      });

      if (res.ok) {
        // 请求成功，本地立即更新帖子列表
        const newPost: Post = {
          id: Date.now().toString(),
          title: newTitle,
          content: newContent,
          author: '管理员',
          link: newLink || undefined,
          date: new Date().toISOString().split('T')[0],
        };
        setPosts([newPost, ...posts]);

        // 清空输入框，关闭弹窗
        setNewTitle('');
        setNewContent('');
        setNewLink('');
        setShowPostModal(false);
      } else {
        console.error('发布帖子失败，状态码:', res.status);
      }
    } catch (err) {
      console.error('发布帖子请求出错:', err);
    }
  };

  return (
    // Fixed: Changed 'class' back to 'className' for React
    <div className="space-y-6">
      {/* Inspirational Quote */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-2">每日励志</h3>
            {isEditingQuote ? (
              <textarea
                value={tempQuote}
                onChange={(e: any) => setTempQuote(e.target.value)}
                className="w-full p-2 border border-orange-300 rounded-lg focus:ring-orange-500 bg-white"
                rows={2}
              />
            ) : (
              <p className="text-lg font-medium text-gray-800 italic">“{quote}”</p>
            )}
          </div>
          {isAdmin && (
            <div className="ml-4">
              {isEditingQuote ? (
                <button onClick={saveQuote} className="text-blue-600 text-sm font-semibold hover:underline">保存</button>
              ) : (
                <button onClick={() => setIsEditingQuote(true)} className="text-gray-400 hover:text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">讨论广场</h2>
        {isAdmin && (
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            发布新帖
          </button>
        )}
      </div>

      <div className="grid gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
              <span className="text-xs text-gray-400">{post.date}</span>
            </div>
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>
            {post.link && (
              <a href={post.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 text-sm font-medium hover:underline">
                相关链接
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            )}
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-sm text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded mr-2">作者: {post.author}</span>
            </div>
          </div>
        ))}
      </div>

      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">发布帖子</h3>
            <div className="space-y-4">
              <input
                placeholder="标题"
                value={newTitle}
                onChange={(e: any) => setNewTitle(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500"
              />
              <textarea
                placeholder="内容..."
                value={newContent}
                onChange={(e: any) => setNewContent(e.target.value)}
                className="w-full p-2 border rounded-lg h-32 focus:ring-blue-500"
              />
              <input
                placeholder="链接 (可选)"
                value={newLink}
                onChange={(e: any) => setNewLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowPostModal(false)} className="px-4 py-2 text-gray-500">取消</button>
              <button onClick={handleCreatePost} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">确认发布</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
