
import React, { useState, useEffect } from 'react';
import { UserSuggestion } from '../types';
import { API_BASE_URL } from '../config';

interface AdminPanelProps {
  suggestions: UserSuggestion[];
  setSuggestions: React.Dispatch<React.SetStateAction<UserSuggestion[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ suggestions, setSuggestions }) => {
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // 页面加载时，从后端获取所有建议
  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/suggestions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSuggestions(data);
        }
      })
      .catch(err => console.error('获取建议列表失败:', err));
  }, []);

  const handleSendFeedback = async (id: string) => {
    if (!replyText) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/suggestions/${id}/feedback?feedback=${encodeURIComponent(replyText)}`, {
        method: 'PUT',
      });

      if (res.ok) {
        setSuggestions(suggestions.map(s =>
          s.id === id ? { ...s, feedback: replyText } : s
        ));
        setReplyText('');
        setActiveReplyId(null);
        alert('反馈已成功发送给用户。');
      } else {
        alert('发送反馈失败，请稍后再试');
      }
    } catch (err) {
      console.error('发送反馈请求出错:', err);
      alert('网络错误，请检查后端是否运行');
    }
  };

  return (
    // Fixed: Changed 'class' back to 'className' for React
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">用户建议与资料投稿</h2>

      <div className="grid gap-4">
        {suggestions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-400 italic">暂无用户提交的内容</p>
          </div>
        )}
        {suggestions.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded mr-2">用户手机: {s.phone}</span>
                <span className="text-xs text-gray-400">时间: {s.date}</span>
              </div>
              <button className="text-blue-600 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                下载附件
              </button>
            </div>

            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">{s.content}</p>

            {s.feedback ? (
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="text-xs font-bold text-green-800 mb-1">已给予回复：</p>
                <p className="text-sm text-green-700">{s.feedback}</p>
                <button
                  onClick={() => setActiveReplyId(s.id)}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  修改回复
                </button>
              </div>
            ) : (
              <div>
                {activeReplyId === s.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e: any) => setReplyText(e.target.value)}
                      placeholder="输入您的回复..."
                      className="w-full p-2 border rounded-lg text-sm"
                      rows={2}
                    />
                    <div className="flex space-x-2">
                      <button onClick={() => handleSendFeedback(s.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium">发送回复</button>
                      <button onClick={() => setActiveReplyId(null)} className="text-gray-400 text-xs px-3 py-1">取消</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveReplyId(s.id)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-200"
                  >
                    立即反馈
                  </button>
                )}
              </div>
            )}

            {activeReplyId === s.id && s.feedback && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e: any) => setReplyText(e.target.value)}
                  placeholder="修改回复内容..."
                  className="w-full p-2 border rounded-lg text-sm"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <button onClick={() => handleSendFeedback(s.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium">更新回复</button>
                  <button onClick={() => setActiveReplyId(null)} className="text-gray-400 text-xs px-3 py-1">取消</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
