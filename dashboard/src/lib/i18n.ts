import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import dayjs from "@/lib/dayjs";
import { initReactI18next } from "react-i18next";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(HttpApi)
  .init({
    debug: import.meta.env.DEV,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    load: "languageOnly",
    detection: {
      caches: ["localStorage", "sessionStorage", "cookie"],
    },
    backend: {
      loadPath: `${import.meta.env.BASE_URL}statics/locales/{{lng}}.json`,
    },
  });

i18n.on("languageChanged", (lng) => {
  dayjs.locale(lng);
});

export default i18n;
