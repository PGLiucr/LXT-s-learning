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
    'home.cancel': 'Cancel',

    // Words Page
    'words.title': 'My Dictionary',
    'words.searchPlaceholder': 'Search words...',
    'words.addWord': 'Add New Word',
    'words.importCET6': 'Import from CET-6 Library',
    'words.dictationMode': 'Dictation Mode',
    'words.exitDictation': 'Exit Dictation',
    'words.table.word': 'Word',
    'words.table.translation': 'Translation',
    'words.table.example': 'Example',
    'words.table.date': 'Date Added',
    'words.table.actions': 'Actions',
    'words.empty': 'No words added yet. Start building your vocabulary!',
    'words.importing': 'Importing...',
    'words.importSuccess': 'Successfully imported words!',
    'words.importError': 'Failed to import words.',

    // Reading Page
    'reading.title': 'Daily Reading',
    'reading.addArticle': 'Add New Article',
    'reading.searchPlaceholder': 'Search articles...',
    'reading.empty': 'No reading records yet. Start reading today!',
    'reading.markFinished': 'Mark as Finished',
    'reading.finished': 'Finished',
    'reading.delete': 'Delete',
    'reading.view': 'View',

    // Quiz Page
    'quiz.title': 'Grammar Quiz',
    'quiz.subtitle': 'Track your performance and improvements.',
    'quiz.start': 'Start New Quiz',
    'quiz.history': 'Quiz History',
    'quiz.score': 'Score',
    'quiz.date': 'Date',
    'quiz.noHistory': 'No quiz history yet.',
    'quiz.question': 'Question',
    'quiz.submit': 'Submit Answer',
    'quiz.next': 'Next Question',
    'quiz.finish': 'Finish Quiz',
    'quiz.result': 'Quiz Result',
    'quiz.correct': 'Correct!',
    'quiz.incorrect': 'Incorrect.',
    'quiz.avgScore': 'Average Score',
    'quiz.totalQuizzes': 'Total Quizzes',
    'quiz.questionsAnswered': 'Questions Answered',

    // Notes Page
    'notes.title': 'My Notes',
    'notes.addNote': 'Add New Note',
    'notes.searchPlaceholder': 'Search notes...',
    'notes.empty': 'No notes added yet.',
    'notes.delete': 'Delete',
    'notes.edit': 'Edit',
    'notes.save': 'Save',
    'notes.cancel': 'Cancel',

    // Login/Auth
    'auth.login': 'Sign in to your account',
    'auth.register': 'Create a new account',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.submit': 'Sign in',
    'auth.registerSubmit': 'Sign up',
    'auth.haveAccount': 'Already have an account? Sign in',
    'auth.noAccount': "Don't have an account? Sign up",
    'auth.error': 'Authentication failed',
    'auth.switchAccount': 'Switch Account',
    'auth.addAccount': 'Add Another Account',
    'auth.savedAccounts': 'Saved Accounts',
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
    'home.cancel': '取消',

    // Words Page
    'words.title': '我的词典',
    'words.searchPlaceholder': '搜索单词...',
    'words.addWord': '添加新单词',
    'words.importCET6': '导入六级词汇',
    'words.dictationMode': '默写模式',
    'words.exitDictation': '退出默写',
    'words.table.word': '单词',
    'words.table.translation': '翻译',
    'words.table.example': '例句',
    'words.table.date': '添加日期',
    'words.table.actions': '操作',
    'words.empty': '暂无单词。开始积累词汇量吧！',
    'words.importing': '导入中...',
    'words.importSuccess': '成功导入单词！',
    'words.importError': '导入失败。',

    // Reading Page
    'reading.title': '每日阅读',
    'reading.addArticle': '添加新文章',
    'reading.searchPlaceholder': '搜索文章...',
    'reading.empty': '暂无阅读记录。开始今天的阅读吧！',
    'reading.markFinished': '标记为已读',
    'reading.finished': '已完成',
    'reading.delete': '删除',
    'reading.view': '查看',

    // Quiz Page
    'quiz.title': '语法测验',
    'quiz.subtitle': '追踪您的成绩和进步。',
    'quiz.start': '开始新测验',
    'quiz.history': '测验历史',
    'quiz.score': '得分',
    'quiz.date': '日期',
    'quiz.noHistory': '暂无测验记录。',
    'quiz.question': '问题',
    'quiz.submit': '提交答案',
    'quiz.next': '下一题',
    'quiz.finish': '完成测验',
    'quiz.result': '测验结果',
    'quiz.correct': '回答正确！',
    'quiz.incorrect': '回答错误。',
    'quiz.avgScore': '平均得分',
    'quiz.totalQuizzes': '测验总数',
    'quiz.questionsAnswered': '已答题数',

    // Notes Page
    'notes.title': '我的笔记',
    'notes.addNote': '添加新笔记',
    'notes.searchPlaceholder': '搜索笔记...',
    'notes.empty': '暂无笔记。',
    'notes.delete': '删除',
    'notes.edit': '编辑',
    'notes.save': '保存',
    'notes.cancel': '取消',

    // Login/Auth
    'auth.login': '登录您的账号',
    'auth.register': '创建新账号',
    'auth.email': '邮箱地址',
    'auth.password': '密码',
    'auth.submit': '登录',
    'auth.registerSubmit': '注册',
    'auth.haveAccount': '已有账号？去登录',
    'auth.noAccount': '没有账号？去注册',
    'auth.error': '认证失败',
    'auth.switchAccount': '切换账号',
    'auth.addAccount': '添加其他账号',
    'auth.savedAccounts': '已保存的账号',
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