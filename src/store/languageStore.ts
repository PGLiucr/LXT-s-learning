import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Language = 'en' | 'zh'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Menu
    'menu.appearance': 'Appearance',
    'menu.language': 'Language',
    'menu.switchAccount': 'Switch Account',
    'menu.logout': 'Log out',
    'menu.dark': 'Dark',
    'menu.light': 'Light',
    'menu.chinese': 'Chinese',
    'menu.english': 'English',
    'menu.share': 'Share',
    
    // Sidebar
    'sidebar.home': 'Home',
    'sidebar.dictionary': 'Dictionary (Words)',
    'sidebar.reading': 'Reading',
    'sidebar.grammar': 'Grammar (Quiz)',
    'sidebar.notes': 'Notes',
    'sidebar.plus': 'Cambridge Dictionary +Plus',
    'sidebar.login': 'Log in / Sign up',
    'sidebar.follow': 'Follow us',
    
    // Header
    'header.title': "XinTong's Learning Plan",
    'header.dictionary': 'Dictionary',
    'header.reading': 'Reading',
    'header.grammar': 'Grammar',
    'header.notes': 'Notes',
    
    // Home
    'home.welcome': 'Welcome Back',
    'home.quote': '"The limits of my language mean the limits of my world."',
    'home.addPhoto': 'Add Photo',
    'home.changePhoto': 'Change Photo',
    'home.readings': 'Daily Readings',
    'home.readingsDesc': 'Articles read total',
    'home.streak': 'Word Streak',
    'home.streakDesc': 'Consecutive learning days',
    'home.words': 'Words Learned',
    'home.wordsDesc': 'Total vocabulary size',
    'home.updatePhoto': 'Update Profile Photo',
    'home.choosePreset': 'Choose a Preset Avatar',
    'home.upload': 'Or upload your own',
    'home.selectDevice': 'Select from Device',
    'home.supports': 'Supports JPG, PNG, GIF (Max 5MB recommended)',
    'home.noImage': 'No image selected',
  },
  zh: {
    // Menu
    'menu.appearance': '外观',
    'menu.language': '语言',
    'menu.switchAccount': '切换账号',
    'menu.logout': '退出登录',
    'menu.dark': '深色',
    'menu.light': '浅色',
    'menu.chinese': '中文',
    'menu.english': '英文',
    'menu.share': '分享',
    
    // Sidebar
    'sidebar.home': '首页',
    'sidebar.dictionary': '词典 (单词)',
    'sidebar.reading': '阅读',
    'sidebar.grammar': '语法 (测验)',
    'sidebar.notes': '笔记',
    'sidebar.plus': '剑桥词典 +Plus',
    'sidebar.login': '登录 / 注册',
    'sidebar.follow': '关注我们',
    
    // Header
    'header.title': 'XinTong 的学习计划',
    'header.dictionary': '词典',
    'header.reading': '阅读',
    'header.grammar': '语法',
    'header.notes': '笔记',
    
    // Home
    'home.welcome': '欢迎回来',
    'home.quote': '“语言的边界就是世界的边界。”',
    'home.addPhoto': '添加照片',
    'home.changePhoto': '更换照片',
    'home.readings': '每日阅读',
    'home.readingsDesc': '累计阅读文章',
    'home.streak': '学习打卡',
    'home.streakDesc': '连续学习天数',
    'home.words': '已学单词',
    'home.wordsDesc': '总词汇量',
    'home.updatePhoto': '更新头像',
    'home.choosePreset': '选择预设头像',
    'home.upload': '或上传自定义图片',
    'home.selectDevice': '从设备选择',
    'home.supports': '支持 JPG, PNG, GIF (建议最大 5MB)',
    'home.noImage': '未选择图片',
  }
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'zh', // Default to Chinese
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const lang = get().language
        return translations[lang][key as keyof typeof translations['en']] || key
      }
    }),
    {
      name: 'language-storage'
    }
  )
)