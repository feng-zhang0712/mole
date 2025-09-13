import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
};

// 默认语言
export const DEFAULT_LANGUAGE = 'zh-CN';

// 后端配置选项
const backendOptions = {
  // 翻译文件加载路径
  loadPath: './locales/{{lng}}/{{ns}}.json',

  // 添加时间戳防止缓存
  // addPath: __dirname + '/public/locales/add/{{lng}}/{{ns}}',

  // 允许跨域
  crossDomain: true,

  // 请求超时时间
  requestOptions: {
    cache: 'no-cache',
  },
};

// 语言检测配置选项
const detectionOptions = {
  // 检测顺序：localStorage -> navigator -> htmlTag -> path -> subdomain
  order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
  
  // 缓存的存储位置
  caches: ['localStorage'],
  
  // localStorage中存储的键名
  lookupLocalStorage: 'i18nextLng',
  
  // Cookie中存储的键名
  lookupCookie: 'i18next',
  
  // Cookie选项
  cookieOptions: {
    path: '/',
    sameSite: 'strict',
    secure: false, // 生产环境建议设为true
    maxAge: 365 * 24 * 60 * 60, // 1年
  },
  
  // HTML标签检测
  htmlTag: document.documentElement,
  
  // URL路径检测
  checkWhitelist: true,
  
  // 子域名检测
  checkForSimilarInSupportedLngs: true,
  
  // 检测到的语言是否必须被支持
  checkForSimilarInFallbackLngs: true,
};

// i18n配置
const i18nConfig = {
  // 调试模式（开发环境）
  debug: process.env.NODE_ENV === 'development',

  // 默认语言
  lng: DEFAULT_LANGUAGE,

  // 支持的语言
  supportedLngs: Object.keys(SUPPORTED_LANGUAGES),

  // 回退语言
  fallbackLng: {
    zh: ['zh-CN'],
    en: ['en-US'],
    ja: ['ja-JP'],
    default: [DEFAULT_LANGUAGE],
  },

  // 命名空间
  ns: ['common'],
  defaultNS: 'common',

  // 插值选项
  interpolation: {
    escapeValue: false, // React已经处理了XSS
    formatSeparator: ',',
    format: (value, format) => {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      return value;
    },
  },

  // 资源加载选项
  load: 'languageOnly', // 只加载语言代码，不加载地区代码

  // 清理代码
  cleanCode: true,

  // 非显式支持的语言处理
  nonExplicitSupportedLngs: true,

  // 保存缺失的翻译
  saveMissing: process.env.NODE_ENV === 'development',

  // 缺失翻译的回调
  missingKeyHandler: (lng, ns, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation: ${lng}.${ns}.${key}`);
    }
  },

  // 解析选项
  parseMissingKeyHandler: (key) => {
    if (process.env.NODE_ENV === 'development') {
      return `[Missing: ${key}]`;
    }
    return key;
  },
};

// 初始化i18n
const initI18n = () => {
  i18n
    // 使用HTTP后端加载翻译文件
    .use(Backend)
    // 使用语言检测器
    .use(LanguageDetector)
    // 使用React集成
    .use(initReactI18next)
    // 初始化
    .init({
      // lng: DEFAULT_LANGUAGE,
      // supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
      // fallbackLng: DEFAULT_LANGUAGE,
      // ns: ['common'],
      // defaultNS: 'common',
      // backend: {
      //   loadPath: '/locales/{{lng}}/{{ns}}.json',
      // },
      // detection: {
      //   order: ['querystring', 'localStorage', 'navigator'],
      //   lookupQuerystring: 'lang',
      //   lookupLocalStorage: 'i18nextLng',
      // },
    });

  return i18n;
};

// 语言切换工具函数
export const changeLanguage = async (language) => {
  try {
    await i18n.changeLanguage(language);
    // 更新HTML lang属性
    document.documentElement.lang = language;
    // 更新页面标题
    document.title = i18n.t('common:app.title');
    return true;
  } catch (error) {
    console.error('Failed to change language:', error);
    return false;
  }
};

// 获取当前语言
export const getCurrentLanguage = () => i18n.language;

// 检查语言是否支持
export const isLanguageSupported = (language) => Object.keys(SUPPORTED_LANGUAGES).includes(language);

// 获取语言显示名称
export const getLanguageDisplayName = (language) => SUPPORTED_LANGUAGES[language] || language;

// 导出i18n实例
export default initI18n();
