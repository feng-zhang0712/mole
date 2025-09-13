import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  changeLanguage,
  getCurrentLanguage,
  isLanguageSupported,
  SUPPORTED_LANGUAGES,
} from '../config';

/**
 * 增强的国际化Hook
 * 提供语言切换、格式化等功能
 */
export const useI18n = (namespace = 'common') => {
  const { t, i18n, ready } = useTranslation(namespace);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [isChanging, setIsChanging] = useState(false);

  // 监听语言变化
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLang(lng);
      setIsChanging(false);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // 切换语言
  const switchLanguage = useCallback(async (language) => {
    if (!isLanguageSupported(language)) {
      console.warn(`Unsupported language: ${language}`);
      return false;
    }

    if (language === currentLang) {
      return true;
    }

    setIsChanging(true);
    const success = await changeLanguage(language);

    if (!success) {
      setIsChanging(false);
    }

    return success;
  }, [currentLang]);

  // 获取支持的语言列表
  const getSupportedLanguages = useCallback(() => Object.keys(SUPPORTED_LANGUAGES).map((code) => ({
    code,
    name: SUPPORTED_LANGUAGES[code],
    isActive: code === currentLang,
  })), [currentLang]);

  // 检查是否为当前语言
  const isCurrentLanguage = useCallback((language) => language === currentLang, [currentLang]);

  // 获取语言显示名称
  const getLanguageName = useCallback((language) => SUPPORTED_LANGUAGES[language] || language, []);

  return {
    // 基础翻译功能
    t,
    ready,

    // 语言相关
    currentLanguage: currentLang,
    switchLanguage,
    getSupportedLanguages,
    isCurrentLanguage,
    getLanguageName,
    isChanging,

    // i18n实例
    i18n,
  };
};

/**
 * 格式化Hook
 * 提供数字、日期、货币等格式化功能
 */
export const useFormatter = () => {
  const { i18n } = useTranslation();

  const formatNumber = useCallback((number, options = {}) => {
    const { locale = i18n.language, ...restOptions } = options;

    try {
      const formatter = new Intl.NumberFormat(locale, restOptions);
      return formatter.format(number);
    } catch (error) {
      console.warn('Number formatting failed:', error);
      return number.toString();
    }
  }, [i18n.language]);

  const formatCurrency = useCallback((amount, currency = 'CNY') => formatNumber(amount, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }), [formatNumber]);

  const formatDate = useCallback((date) => {
    // 这里可以集成moment或dayjs
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(i18n.language);
  }, [i18n.language]);

  const formatRelativeTime = useCallback((date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  }, []);

  return {
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
  };
};

/**
 * 翻译验证Hook
 * 用于开发环境检查缺失的翻译
 */
export const useTranslationValidator = () => {
  const { i18n } = useTranslation();
  const [missingKeys, setMissingKeys] = useState([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleMissingKey = (lng, ns, key) => {
      const missingKey = `${lng}.${ns}.${key}`;
      setMissingKeys((prev) => (prev.includes(missingKey) ? prev : [...prev, missingKey]));
    };

    i18n.on('missingKey', handleMissingKey);

    return () => {
      i18n.off('missingKey', handleMissingKey);
    };
  }, [i18n]);

  const clearMissingKeys = useCallback(() => {
    setMissingKeys([]);
  }, []);

  const hasMissingKeys = missingKeys.length > 0;

  return {
    missingKeys,
    hasMissingKeys,
    clearMissingKeys,
  };
};

/**
 * 语言检测Hook
 * 自动检测用户偏好的语言
 */
export const useLanguageDetection = () => {
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectLanguage = () => {
      // 检测浏览器语言
      const browserLang = navigator.language || navigator.userLanguage;

      // 检测localStorage中的语言设置
      const storedLang = localStorage.getItem('i18nextLng');

      // 检测URL参数
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');

      // 优先级：URL参数 > localStorage > 浏览器语言
      const detected = urlLang || storedLang || browserLang;

      setDetectedLanguage(detected);
      setIsDetecting(false);
    };

    detectLanguage();
  }, []);

  return {
    detectedLanguage,
    isDetecting,
  };
};
