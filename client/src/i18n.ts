import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    nav: {
                        dashboard: 'Dashboard',
                        inventory: 'Inventory',
                        categories: 'Categories',
                        suppliers: 'Suppliers',
                        forecaster: 'AI Forecaster',
                        finance: 'Finance'
                    },
                    finance: {
                        title: 'Financial Intelligence',
                        netValue: 'Inventory Net Value',
                        grossMargin: 'Avg. Gross Margin',
                        taxLiability: 'Est. Tax Liability',
                        cogs: 'Cost of Goods Sold'
                    }
                }
            },
            hi: {
                translation: {
                    nav: {
                        dashboard: 'Dashboard',
                        inventory: 'इन्वेंटरी',
                        categories: 'श्रेणियां',
                        suppliers: 'आपूर्तिकर्ता',
                        forecaster: 'AI भविष्यवक्ता',
                        finance: 'वित्त'
                    },
                    finance: {
                        title: 'वित्तीय बुद्धिमत्ता',
                        netValue: 'कुल इन्वेंटरी मूल्य',
                        grossMargin: 'औसत सकल लाभ',
                        taxLiability: 'अनुमानित कर',
                        cogs: 'बेचे गए माल की लागत'
                    }
                }
            }
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
