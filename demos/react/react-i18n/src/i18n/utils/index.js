import i18n from 'i18next';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/ja';

/**
 * 格式化数字
 * @param {number} number - 要格式化的数字
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的数字字符串
 */
export const formatNumber = (number, options = {}) => {
  const {
    locale = i18n.language,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    style = 'decimal',
    currency = 'CNY',
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style,
      minimumFractionDigits,
      maximumFractionDigits,
      ...(style === 'currency' && { currency }),
    });
    return formatter.format(number);
  } catch (error) {
    console.warn('Number formatting failed:', error);
    return number.toString();
  }
};

/**
 * 格式化货币
 * @param {number} amount - 金额
 * @param {string} currency - 货币代码
 * @param {string} locale - 语言环境
 * @returns {string} 格式化后的货币字符串
 */
export const formatCurrency = (amount, currency = 'CNY', locale = i18n.language) => formatNumber(amount, {
  locale,
  style: 'currency',
  currency,
  minimumFractionDigits: 2,
});

/**
 * 获取moment语言代码
 * @param {string} locale - i18n语言代码
 * @returns {string} moment语言代码
 */
const getMomentLocale = (locale) => {
  const localeMap = {
    'zh-CN': 'zh-cn',
    'en-US': 'en',
    'ja-JP': 'ja',
  };
  return localeMap[locale] || 'en';
};

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 日期格式
 * @param {string} locale - 语言环境
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD', locale = i18n.language) => {
  try {
    // 设置moment语言
    const momentLocale = getMomentLocale(locale);
    moment.locale(momentLocale);
    
    return moment(date).format(format);
  } catch (error) {
    console.warn('Date formatting failed:', error);
    return date.toString();
  }
};

/**
 * 格式化相对时间
 * @param {Date|string|number} date - 日期
 * @param {string} locale - 语言环境
 * @returns {string} 相对时间字符串
 */
export const formatRelativeTime = (date, locale = i18n.language) => {
  try {
    const momentLocale = getMomentLocale(locale);
    moment.locale(momentLocale);
    
    return moment(date).fromNow();
  } catch (error) {
    console.warn('Relative time formatting failed:', error);
    return date.toString();
  }
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

/**
 * 格式化百分比
 * @param {number} value - 数值
 * @param {number} decimals - 小数位数
 * @param {string} locale - 语言环境
 * @returns {string} 格式化后的百分比
 */
export const formatPercentage = (value, decimals = 1, locale = i18n.language) => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return formatter.format(value / 100);
  } catch (error) {
    console.warn('Percentage formatting failed:', error);
    return `${value}%`;
  }
};

/**
 * 获取复数形式
 * @param {number} count - 数量
 * @param {string} singular - 单数形式
 * @param {string} plural - 复数形式
 * @param {string} locale - 语言环境
 * @returns {string} 正确的复数形式
 */
export const getPluralForm = (count, singular, plural, locale = i18n.language) => {
  try {
    const rules = new Intl.PluralRules(locale);
    const rule = rules.select(count);

    switch (rule) {
      case 'one':
        return singular;
      case 'other':
      default:
        return plural;
    }
  } catch (error) {
    console.warn('Plural form detection failed:', error);
    return count === 1 ? singular : plural;
  }
};

/**
 * 验证翻译键是否存在
 * @param {string} key - 翻译键
 * @param {string} ns - 命名空间
 * @returns {boolean} 是否存在
 */
export const hasTranslation = (key, ns = 'common') => i18n.exists(key, { ns });

/**
 * 获取翻译键的完整路径
 * @param {string} key - 翻译键
 * @param {string} ns - 命名空间
 * @returns {string} 完整路径
 */
export const getTranslationKey = (key, ns = 'common') => `${ns}:${key}`;

/**
 * 批量获取翻译
 * @param {Array} keys - 翻译键数组
 * @param {string} ns - 命名空间
 * @returns {Object} 翻译对象
 */
export const getTranslations = (keys, ns = 'common') => {
  const translations = {};
  keys.forEach((key) => {
    translations[key] = i18n.t(`${ns}:${key}`);
  });
  return translations;
};

/**
 * 检查是否为RTL语言
 * @param {string} locale - 语言代码
 * @returns {boolean} 是否为RTL
 */
export const isRTL = (locale = i18n.language) => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.some((lang) => locale.startsWith(lang));
};

/**
 * 获取文本方向
 * @param {string} locale - 语言代码
 * @returns {string} 文本方向
 */
export const getTextDirection = (locale = i18n.language) => (isRTL(locale) ? 'rtl' : 'ltr');
