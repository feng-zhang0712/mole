// 国际化系统主入口文件
// 统一导出所有国际化相关的功能

// 配置和初始化
export { default as i18n } from './config';
export {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  changeLanguage,
  getCurrentLanguage,
  isLanguageSupported,
  getLanguageDisplayName,
} from './config';

// 工具函数
export {
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatFileSize,
  formatPercentage,
  getPluralForm,
  hasTranslation,
  getTranslationKey,
  getTranslations,
  isRTL,
  getTextDirection,
} from './utils';

// 自定义Hooks
export {
  useI18n,
  useFormatter,
  useTranslationValidator,
  useLanguageDetection,
} from './hooks/useI18n';

// 重新导出react-i18next的核心功能
export { useTranslation, Trans, I18nextProvider } from 'react-i18next';
