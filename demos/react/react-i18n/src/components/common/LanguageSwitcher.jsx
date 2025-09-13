import React, { useState } from 'react';
import { useI18n } from '@i18n';
import './LanguageSwitcher.css';

/**
 * 获取语言对应的国旗图标
 * @param {string} languageCode - 语言代码
 * @returns {string} 国旗emoji
 */
const getLanguageFlag = (languageCode) => {
  const flagMap = {
    'zh-CN': '🇨🇳',
    'en-US': '🇺🇸',
    'ja-JP': '🇯🇵',
  };
  return flagMap[languageCode] || '🌐';
};

/**
 * 语言切换组件
 * 提供下拉菜单式的语言选择功能
 */
const LanguageSwitcher = ({ className = '', size = 'medium' }) => {
  const {
    currentLanguage,
    switchLanguage,
    getSupportedLanguages,
    getLanguageName,
    isChanging,
  } = useI18n();

  const [isOpen, setIsOpen] = useState(false);
  const supportedLanguages = getSupportedLanguages();

  // 处理语言切换
  const handleLanguageChange = async (languageCode) => {
    if (languageCode === currentLanguage) {
      setIsOpen(false);
      return;
    }

    const success = await switchLanguage(languageCode);
    if (success) {
      setIsOpen(false);
    }
  };

  // 处理点击外部关闭
  const handleClickOutside = (e) => {
    if (!e.target.closest('.language-switcher')) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`language-switcher ${className} ${size}`}>
      <button
        type="button"
        className="language-switcher__trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        aria-label="选择语言"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="language-switcher__flag">
          {getLanguageFlag(currentLanguage)}
        </span>
        <span className="language-switcher__name">
          {getLanguageName(currentLanguage)}
        </span>
        <span className={`language-switcher__arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </span>
        {isChanging && (
          <span className="language-switcher__loading">
            <span className="spinner" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="language-switcher__dropdown">
          <ul className="language-switcher__list" role="menu">
            {supportedLanguages.map(({ code, name, isActive }) => (
              <li key={code} className="language-switcher__item">
                <button
                  type="button"
                  className={`language-switcher__option ${isActive ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(code)}
                  role="menuitem"
                  aria-current={isActive}
                >
                  <span className="language-switcher__flag">
                    {getLanguageFlag(code)}
                  </span>
                  <span className="language-switcher__name">{name}</span>
                  {isActive && (
                    <span className="language-switcher__check">✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
