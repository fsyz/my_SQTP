
import React, { useState } from 'react';
import { Resource, User, UserSuggestion, UserRole } from '../types';

interface ResourcesProps {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  isAdmin: boolean;
  user: User;
  suggestions: UserSuggestion[];
  setSuggestions: React.Dispatch<React.SetStateAction<UserSuggestion[]>>;
}

const ResourcesSection: React.FC<ResourcesProps> = ({ resources, setResources, isAdmin, user, suggestions, setSuggestions }) => {
  // Explicitly typing modules as string[] to fix 'unknown' type error in map
  const modules: string[] = Array.from(new Set(resources.map(r => r.module)));
  const [activeModule, setActiveModule] = useState(modules[0] || '所有');
  const [showAddResource, setShowAddResource] = useState(false);
  const [showContactAdmin, setShowContactAdmin] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [module, setModule] = useState('');
  const [suggestionText, setSuggestionText] = useState('');

  const handleAddResource = () => {
    if (!title || !module) return;
    const newRes: Resource = {
      id: Date.now().toString(),
      title,
      module,
      url: '#',
      date: new Date().toISOString().split('T')[0]
    };
    setResources([...resources, newRes]);
    setShowAddResource(false);
  };

  const handleSubmitSuggestion = () => {
    if (!suggestionText) return;
    const newSuggestion: UserSuggestion = {
      id: Date.now().toString(),
      userId: user.id,
      phone: user.phone || '管理员',
      content: suggestionText,
      date: new Date().toISOString().split('T')[0]
    };
    setSuggestions([...suggestions, newSuggestion]);
    setSuggestionText('');
    setShowContactAdmin(false);
    alert('提交成功！管理员会尽快处理。');
  };

  const filteredResources = activeModule === '所有' 
    ? resources 
    : resources.filter(r => r.module === activeModule);

  const userMySuggestions = suggestions.filter(s => s.userId === user.id);

  return (
    // Fixed: Changed 'class' back to 'className' for React
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveModule('所有')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${activeModule === '所有' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            所有
          </button>
          {modules.map(m => (
            <button 
              key={m}
              onClick={() => setActiveModule(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${activeModule === m ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          {isAdmin ? (
            <button onClick={() => setShowAddResource(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">添加资料/模块</button>
          ) : (
            <button onClick={() => setShowContactAdmin(true)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200">反馈建议/上传资料</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(res => (
          <div key={res.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{res.title}</h4>
                <p className="text-xs text-gray-500">{res.module} · {res.date}</p>
              </div>
            </div>
            <a href={res.url} className="text-blue-600 hover:text-blue-800 p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </a>
          </div>
        ))}
      </div>

      {!isAdmin && userMySuggestions.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-bold text-gray-800 mb-4">我的反馈进度</h3>
          <div className="space-y-3">
            {userMySuggestions.map(s => (
              <div key={s.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>提交时间: {s.date}</span>
                  <span className={s.feedback ? 'text-green-500 font-bold' : 'text-orange-500'}>{s.feedback ? '已回复' : '待处理'}</span>
                </div>
                <p className="text-sm text-gray-700">{s.content}</p>
                {s.feedback && (
                  <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
                    <p className="text-xs font-bold text-green-800 mb-1">管理员回复：</p>
                    <p className="text-sm text-green-700">{s.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">添加学习资料</h3>
            <div className="space-y-4">
              <input placeholder="资料名称" value={title} onChange={(e: any) => setTitle(e.target.value)} className="w-full p-2 border rounded-lg" />
              <input placeholder="所属模块 (如: 英语, 数学)" value={module} onChange={(e: any) => setModule(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowAddResource(false)} className="px-4 py-2">取消</button>
              <button onClick={handleAddResource} className="bg-blue-600 text-white px-6 py-2 rounded-lg">上传资料</button>
            </div>
          </div>
        </div>
      )}

      {showContactAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-2">联系管理员</h3>
            <p className="text-sm text-gray-500 mb-4">您可以上传资料或提出您的宝贵意见。</p>
            <textarea 
              placeholder="您的意见或资料描述..." 
              value={suggestionText}
              onChange={(e: any) => setSuggestionText(e.target.value)}
              className="w-full p-3 border rounded-lg h-32"
            />
            <div className="mt-4">
              <label className="block text-xs text-gray-400 mb-1">附件 (可选)</label>
              <input type="file" className="text-sm text-gray-500" />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowContactAdmin(false)} className="px-4 py-2">取消</button>
              <button onClick={handleSubmitSuggestion} className="bg-blue-600 text-white px-6 py-2 rounded-lg">确认提交</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesSection;
