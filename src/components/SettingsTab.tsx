import React, { useState } from 'react';
import {
  Bell,
  Bus,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Globe,
  LayoutGrid,
  List,
  Lock,
  Type,
  UserRound,
} from 'lucide-react';
import { CURRENT_STUDENT } from '../data/mockData';
import {
  FontSizeOption,
  HOME_TRANSPORT_OPTIONS,
  HomeTransportRouteId,
  StudentLifeLayoutOption,
  useAppPreferences,
} from '../context/AppPreferencesContext';

const settingItems = [

  {
    id: 'privacy',
    title: 'Privacy & Security',
    desc: 'Password, session and security preferences',
    icon: Lock,
    enabled: false,
  },
  {
    id: 'notification',
    title: 'Notifications',
    desc: 'Manage academic and campus push alerts',
    icon: Bell,
    enabled: false,
  },
  {
    id: 'language',
    title: 'Language & Region',
    desc: 'Display language and locale format options',
    icon: Globe,
    enabled: false,
  }
];

const fontSizeOptions: Array<{ id: FontSizeOption; label: string; sample: string }> = [
  { id: 'sm', label: 'S', sample: 'Small' },
  { id: 'md', label: 'M', sample: 'Default' },
  { id: 'lg', label: 'L', sample: 'Large' },
  { id: 'xl', label: 'XL', sample: 'Extra large' },
];

const studentLifeLayoutOptions: Array<{
  id: StudentLifeLayoutOption;
  label: string;
  sample: string;
  icon: typeof List;
}> = [
  { id: 'list', label: 'List', sample: 'One column', icon: List },
  { id: 'grid', label: 'Grid', sample: 'Two columns', icon: LayoutGrid },
];

export const SettingsTab: React.FC = () => {
  const {
    fontSize,
    setFontSize,
    studentLifeLayout,
    setStudentLifeLayout,
    homeTransportRoutes,
    setHomeTransportRoutes,
  } = useAppPreferences();
  const [settingsPage, setSettingsPage] = useState<'main' | 'transport'>('main');

  const toggleTransportRoute = (routeId: HomeTransportRouteId) => {
    if (homeTransportRoutes.includes(routeId)) {
      if (homeTransportRoutes.length <= 1) return;
      setHomeTransportRoutes(homeTransportRoutes.filter((item) => item !== routeId));
      return;
    }

    if (homeTransportRoutes.length >= 4) return;
    setHomeTransportRoutes([...homeTransportRoutes, routeId]);
  };

  if (settingsPage === 'transport') {
    return (
      <div className="page-shell page-shell--settings space-y-4">
        <div className="set-heading">
          <button type="button" onClick={() => setSettingsPage('main')} className="set-back">
            <ChevronLeft className="set-back__icon" />
            Back to Settings
          </button>
          <h2 className="set-heading__title set-heading__title--spaced">Home Transport</h2>
          <p className="set-heading__desc">
            Choose 1 to 4 routes to preview on the Home page (for example Route K51).
          </p>
        </div>

        <section className="set-panel">
          <div className="set-panel__meta">
            <p className="set-panel__count">Selected: {homeTransportRoutes.length} / 4</p>
            <p className="set-panel__hint">At least 1 route required</p>
          </div>

          <div className="set-routes">
            {HOME_TRANSPORT_OPTIONS.map((option) => {
              const selected = homeTransportRoutes.includes(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleTransportRoute(option.id)}
                  className={`set-route${selected ? ' is-selected' : ''}`}
                >
                  <div className="set-route__row">
                    <div className="set-route__lead">
                      <div className="set-route__icon">
                        <Bus className="set-route__icon-svg" />
                      </div>
                      <div className="set-route__text">
                        <p className="set-route__label">{option.label}</p>
                        <p className="set-route__desc">
                          {option.provider} · {option.description}
                        </p>
                      </div>
                    </div>
                    <div className={`set-route__check${selected ? ' is-selected' : ''}`}>
                      <Check className="set-route__check-svg" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell page-shell--settings space-y-4">


      <section className="set-panel">
        <div className="set-pref__head">
          <div className="set-pref__icon">
            <Type className="set-pref__icon-svg" />
          </div>
          <div>
            <p className="set-pref__title">Display font size</p>
          </div>
        </div>
        <div className="set-choice-grid set-choice-grid--fonts">
          {fontSizeOptions.map((option) => {
            const selected = fontSize === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setFontSize(option.id)}
                className={`set-choice${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
              >
                <p className="set-choice__label">{option.label}</p>
                <p className="set-choice__sample">{option.sample}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="set-panel">
        <div className="set-pref__head">
          <div className="set-pref__icon">
            <LayoutGrid className="set-pref__icon-svg" />
          </div>
          <div>
            <p className="set-pref__title">Student Life layout</p>
          </div>
        </div>
        <div className="set-choice-grid set-choice-grid--layout">
          {studentLifeLayoutOptions.map((option) => {
            const selected = studentLifeLayout === option.id;
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setStudentLifeLayout(option.id)}
                className={`set-choice${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
              >
                <Icon className="set-choice__icon" />
                <p className="set-choice__label set-choice__label--spaced">{option.label}</p>
                <p className="set-choice__sample">{option.sample}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="set-panel">
        <button type="button" onClick={() => setSettingsPage('transport')} className="set-nav">
          <div className="set-nav__row">
            <div className="set-nav__lead">
              <div className="set-pref__icon">
                <Bus className="set-pref__icon-svg" />
              </div>
              <div>
                <p className="set-pref__title">Transport preferences</p>
                <p className="set-pref__desc">
                  Pick which routes appear on Home (K51, 67M, MTR, and more).
                </p>
              </div>
            </div>
            <ChevronRight className="set-nav__chevron" />
          </div>
        </button>
      </section>

      <div className="set-items">
        {settingItems.map((item) => {
          const Icon = item.icon;
          const isDisabled = !item.enabled;
          return (
            <button
              key={item.id}
              type="button"
              disabled={isDisabled}
              className={`set-item${isDisabled ? ' is-disabled' : ''}`}
            >
              <div className="set-item__row">
                <div className="set-pref__icon">
                  <Icon className="set-pref__icon-svg" />
                </div>
                <div className="set-item__body">
                  <p className="set-item__title">{item.title}</p>
                  <p className="set-item__desc">{item.desc}</p>
                </div>
                {isDisabled && <Lock className="set-item__lock" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
