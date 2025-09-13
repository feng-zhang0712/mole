import React from 'react';
import { useTranslation, useFormatter } from '@i18n';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import './Home.css';

const Home = () => {
  const { t } = useTranslation('common');

  const { formatNumber, formatCurrency, formatDate } = useFormatter();

  // 示例数据
  const sampleData = {
    userCount: 1234567,
    revenue: 987654.32,
    lastUpdate: new Date(),
  };

  // 功能特性列表
  const features = [
    {
      icon: '🌐',
      title: t('features.i18n.title'),
      description: t('features.i18n.description'),
    },
    {
      icon: '⚡',
      title: t('features.performance.title'),
      description: t('features.performance.description'),
    },
    {
      icon: '🔧',
      title: t('features.tools.title'),
      description: t('features.tools.description'),
    },
    {
      icon: '📱',
      title: t('features.responsive.title'),
      description: t('features.responsive.description'),
    },
  ];

  return (
    <div className="home">
      {/* 语言切换器 */}
      <div className="home__language-switcher">
        <LanguageSwitcher />
      </div>

      {/* 英雄区域 */}
      <section className="home__hero">
        <div className="home__hero-content">
          <h1 className="home__title">
            {t('welcome.title')}
            <span className="home__title-highlight">
              {t('welcome.subtitle')}
            </span>
          </h1>
          <p className="home__description">
            {t('welcome.description')}
          </p>
          <div className="home__actions">
            <button className="home__button home__button--primary">
              {t('welcome.getStarted')}
            </button>
            <button className="home__button home__button--secondary">
              {t('navigation.settings')}
            </button>
          </div>
        </div>
      </section>

      {/* 统计信息 */}
      <section className="home__stats">
        <div className="home__stats-container">
          <div className="home__stat">
            <div className="home__stat-number">
              {formatNumber(sampleData.userCount)}
            </div>
            <div className="home__stat-label">
              {t('stats.users')}
            </div>
          </div>
          <div className="home__stat">
            <div className="home__stat-number">
              {formatCurrency(sampleData.revenue)}
            </div>
            <div className="home__stat-label">
              {t('stats.revenue')}
            </div>
          </div>
          <div className="home__stat">
            <div className="home__stat-number">
              {formatDate(sampleData.lastUpdate, 'MM/DD')}
            </div>
            <div className="home__stat-label">
              {t('stats.lastUpdate')}
            </div>
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="home__features">
        <div className="home__features-container">
          <h2 className="home__features-title">
            {t('features.title')}
          </h2>
          <div className="home__features-grid">
            {features.map((feature) => (
              <div key={feature.title} className="home__feature">
                <div className="home__feature-icon">
                  {feature.icon}
                </div>
                <h3 className="home__feature-title">
                  {feature.title}
                </h3>
                <p className="home__feature-description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 国际化演示 */}
      <section className="home__demo">
        <div className="home__demo-container">
          <h2 className="home__demo-title">
            {t('demo.title')}
          </h2>
          <div className="home__demo-content">
            <div className="home__demo-item">
              <h4>{t('demo.currentLanguage')}</h4>
              <p>{t('demo.currentLanguageDesc')}</p>
            </div>
            <div className="home__demo-item">
              <h4>{t('demo.supportedLanguages')}</h4>
              <p>{t('demo.supportedLanguagesDesc')}</p>
            </div>
            <div className="home__demo-item">
              <h4>{t('demo.features')}</h4>
              <p>{t('demo.featuresDesc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
