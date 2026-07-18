import { StateCreator } from "zustand";

export interface I18nSlice {
  language: "en" | "es" | "fr";
  setLanguage: (lang: "en" | "es" | "fr") => void;
  t: (key: string) => string;
}

type TranslationMap = {
  [lang in "en" | "es" | "fr"]: Record<string, string>;
};

const translations: TranslationMap = {
  en: {
    "app.title": "Stadium Assistant",
    "app.subtitle": "Fan Flow · World Cup 26",
    "chat.new": "New",
    "chat.send": "Send",
    "chat.placeholder": "Ask about navigation, accessibility...",
    "nav.transport": "Transport",
    "nav.accessibility": "Accessibility",
    "nav.dashboard": "Dashboard"
  },
  es: {
    "app.title": "Asistente de Estadio",
    "app.subtitle": "Flujo de Fans · Copa Mundial 26",
    "chat.new": "Nuevo",
    "chat.send": "Enviar",
    "chat.placeholder": "Preguntar sobre navegación, accesibilidad...",
    "nav.transport": "Transporte",
    "nav.accessibility": "Accesibilidad",
    "nav.dashboard": "Panel"
  },
  fr: {
    "app.title": "Assistant de Stade",
    "app.subtitle": "Flux de Fans · Coupe du Monde 26",
    "chat.new": "Nouveau",
    "chat.send": "Envoyer",
    "chat.placeholder": "Poser des questions sur la navigation...",
    "nav.transport": "Transport",
    "nav.accessibility": "Accessibilité",
    "nav.dashboard": "Tableau de bord"
  }
};

export const createI18nSlice: StateCreator<I18nSlice> = (set, get) => ({
  language: "en",
  setLanguage: (lang) => set({ language: lang }),
  t: (key) => {
    const lang = get().language;
    return translations[lang][key] ?? key;
  }
});
