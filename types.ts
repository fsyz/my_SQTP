
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  phone?: string;
  role: UserRole;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  link?: string;
  date: string;
}

export interface Resource {
  id: string;
  title: string;
  module: string;
  url: string;
  date: string;
}

export interface UserSuggestion {
  id: string;
  userId: string;
  phone: string;
  content: string;
  fileUrl?: string;
  feedback?: string;
  date: string;
}

export interface Word {
  id: string;
  english: string;
  chinese: string;
  pos: string; // Part of speech
  ipa: string; // Phonetic
  module: string;
}

export interface MistakeRecord {
  id: string;
  wordId: string;
  english: string;
  chinese: string;
  date: string;
}
