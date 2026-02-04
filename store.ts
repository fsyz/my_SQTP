
import { Post, Resource, Word, UserSuggestion, MistakeRecord } from './types';

export const INITIAL_POSTS: Post[] = [
  { id: '1', title: '欢迎来到学令教育', content: '这是一个专注学习的平台。', author: '管理员', date: '2024-05-20' },
  { id: '2', title: '学习技巧分享', content: '高效学习的五个方法...', author: '管理员', link: 'https://example.com/tips', date: '2024-05-21' }
];

export const INITIAL_WORDS: Word[] = [
  { id: 'w1', english: 'persistence', chinese: '坚持', pos: 'n.', ipa: '/pəˈsɪstəns/', module: '考研词汇' },
  { id: 'w2', english: 'efficient', chinese: '高效的', pos: 'adj.', ipa: '/ɪˈfɪʃnt/', module: '考研词汇' },
  { id: 'w3', english: 'innovation', chinese: '创新', pos: 'n.', ipa: '/ˌɪnəˈveɪʃn/', module: '雅思词汇' },
  { id: 'w4', english: 'strategy', chinese: '策略', pos: 'n.', ipa: '/ˈstrætədʒi/', module: '雅思词汇' }
];

export const INITIAL_RESOURCES: Resource[] = [
  { id: 'r1', title: '2024英语真题解析', module: '英语', url: '#', date: '2024-05-20' },
  { id: 'r2', title: '高等数学知识点总结', module: '数学', url: '#', date: '2024-05-21' }
];

export const loadData = <T,>(key: string, initial: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initial;
};

export const saveData = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};
