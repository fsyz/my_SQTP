
import React, { useState, useEffect } from 'react';
import { Word, MistakeRecord } from '../types';

interface WordQuizProps {
  words: Word[];
  setWords: React.Dispatch<React.SetStateAction<Word[]>>;
  mistakes: MistakeRecord[];
  setMistakes: React.Dispatch<React.SetStateAction<MistakeRecord[]>>;
  isAdmin: boolean;
}

const WordQuiz: React.FC<WordQuizProps> = ({ words, setWords, mistakes, setMistakes, isAdmin }) => {
  const [view, setView] = useState<'selection' | 'quiz' | 'mistakes' | 'admin'>('selection');
  const [activeModule, setActiveModule] = useState<string>('');
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Options
  const [showCN, setShowCN] = useState(true);
  const [showFirst, setShowFirst] = useState(false);
  const [showPOS, setShowPOS] = useState(false);
  const [showIPA, setShowIPA] = useState(false);

  // Explicitly typing modules as string[] to fix 'unknown' type error in map
  const modules: string[] = Array.from(new Set(words.map(w => w.module)));

  const startQuiz = (moduleName: string) => {
    const filtered = words.filter(w => w.module === moduleName);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setQuizWords(shuffled);
    setCurrentIndex(0);
    setActiveModule(moduleName);
    setView('quiz');
    resetTurn();
  };

  const resetTurn = () => {
    setUserInput('');
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    const current = quizWords[currentIndex];
    const correct = userInput.trim().toLowerCase() === current.english.toLowerCase();
    setIsCorrect(correct);
    setIsAnswered(true);

    if (!correct) {
      const isAlreadyInMistakes = mistakes.find(m => m.wordId === current.id);
      if (!isAlreadyInMistakes) {
        setMistakes([{
          id: Date.now().toString(),
          wordId: current.id,
          english: current.english,
          chinese: current.chinese,
          date: new Date().toISOString().split('T')[0]
        }, ...mistakes]);
      }
    }
  };

  const nextWord = () => {
    if (currentIndex < quizWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetTurn();
    } else {
      alert('本轮测试结束！');
      setView('selection');
    }
  };

  const removeMistake = (id: string) => {
    setMistakes(mistakes.filter(m => m.id !== id));
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simulated Excel/CSV upload
    alert('批量上传成功！模拟数据已导入。');
  };

  return (
    // Fixed: Changed 'class' to 'className', 'autofocus' to 'autoFocus', 'colspan' to 'colSpan'
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button onClick={() => setView('selection')} className={`px-4 py-2 rounded-lg text-sm ${view === 'selection' || view === 'quiz' ? 'bg-blue-600 text-white' : 'bg-white'}`}>默写模式</button>
          <button onClick={() => setView('mistakes')} className={`px-4 py-2 rounded-lg text-sm ${view === 'mistakes' ? 'bg-blue-600 text-white' : 'bg-white'}`}>错题本 ({mistakes.length})</button>
          {isAdmin && (
            <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-lg text-sm ${view === 'admin' ? 'bg-blue-600 text-white' : 'bg-white'}`}>题库管理</button>
          )}
        </div>
      </div>

      {view === 'selection' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m: string) => (
            <div key={m} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
              <h4 className="text-xl font-bold mb-4">{m}</h4>
              <p className="text-gray-500 text-sm mb-6">共 {words.filter(w => w.module === m).length} 个单词</p>
              <button 
                onClick={() => startQuiz(m)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                开始默写
              </button>
            </div>
          ))}
        </div>
      )}

      {view === 'quiz' && quizWords[currentIndex] && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-blue-600">正在默写: {activeModule}</span>
              <span className="text-sm text-gray-400">{currentIndex + 1} / {quizWords.length}</span>
            </div>

            {/* Display Options Checkboxes */}
            <div className="flex flex-wrap gap-4 mb-8 p-3 bg-gray-50 rounded-lg">
              <label className="flex items-center text-xs font-medium text-gray-600 cursor-pointer">
                <input type="checkbox" checked={showCN} onChange={(e: any) => setShowCN(e.target.checked)} className="mr-1" /> 中文
              </label>
              <label className="flex items-center text-xs font-medium text-gray-600 cursor-pointer">
                <input type="checkbox" checked={showFirst} onChange={(e: any) => setShowFirst(e.target.checked)} className="mr-1" /> 首字母
              </label>
              <label className="flex items-center text-xs font-medium text-gray-600 cursor-pointer">
                <input type="checkbox" checked={showPOS} onChange={(e: any) => setShowPOS(e.target.checked)} className="mr-1" /> 词性
              </label>
              <label className="flex items-center text-xs font-medium text-gray-600 cursor-pointer">
                <input type="checkbox" checked={showIPA} onChange={(e: any) => setShowIPA(e.target.checked)} className="mr-1" /> 音标
              </label>
            </div>

            <div className="text-center mb-8 space-y-2">
              {showCN && <h2 className="text-3xl font-bold text-gray-900">{quizWords[currentIndex].chinese}</h2>}
              <div className="flex justify-center items-center space-x-4">
                {showPOS && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500">{quizWords[currentIndex].pos}</span>}
                {showIPA && <span className="text-sm text-gray-400 font-mono">{quizWords[currentIndex].ipa}</span>}
              </div>
              {showFirst && (
                <p className="text-gray-400 text-sm">提示: {quizWords[currentIndex].english[0]}...</p>
              )}
            </div>

            <div className="space-y-4">
              <input 
                autoFocus
                type="text"
                value={userInput}
                onChange={(e: any) => setUserInput(e.target.value)}
                disabled={isAnswered}
                placeholder="请输入对应的英文单词..."
                className={`w-full text-center text-2xl p-4 border-2 rounded-xl focus:outline-none transition-all ${
                  isAnswered ? (isCorrect ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-gray-200 focus:border-blue-500'
                }`}
                onKeyDown={(e: any) => e.key === 'Enter' && !isAnswered && handleCheck()}
              />

              {isAnswered && !isCorrect && (
                <p className="text-center text-red-500 font-bold">正确答案: {quizWords[currentIndex].english}</p>
              )}

              <div className="flex gap-4">
                {!isAnswered ? (
                  <button onClick={handleCheck} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg">提交检查</button>
                ) : (
                  <button onClick={nextWord} className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold shadow-lg">下一个</button>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setView('selection')} className="block mx-auto text-gray-400 text-sm hover:underline">返回选择模块</button>
        </div>
      )}

      {view === 'mistakes' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">单词</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">中文释义</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">添加日期</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mistakes.map(m => (
                <tr key={m.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{m.english}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.chinese}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{m.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => removeMistake(m.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">删除</button>
                  </td>
                </tr>
              ))}
              {mistakes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">目前还没有错题，继续加油！</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === 'admin' && isAdmin && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-4">批量上传单词 (Excel/CSV)</h3>
            <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg h-32 hover:border-blue-400 transition-colors">
              <label className="cursor-pointer text-center">
                <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="mt-2 block text-sm font-medium text-gray-900">点击上传或拖拽 Excel 文件</span>
                <input type="file" className="sr-only" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} />
              </label>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-4">当前题库列表</h3>
            <div className="space-y-2">
              {words.map(w => (
                <div key={w.id} className="flex justify-between items-center p-3 border-b border-gray-50">
                  <div>
                    <span className="font-bold mr-2">{w.english}</span>
                    <span className="text-gray-500 text-sm">{w.chinese} ({w.module})</span>
                  </div>
                  <button onClick={() => setWords(words.filter(x => x.id !== w.id))} className="text-xs text-red-500">删除</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordQuiz;
