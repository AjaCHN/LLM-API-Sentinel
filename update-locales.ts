import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'app', 'locales');
const enPath = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const targetLocales = ['ar', 'cs', 'de', 'en', 'es', 'fr', 'hi', 'id', 'it', 'ja', 'ko', 'nl', 'pl', 'pt-BR', 'ru', 'sv', 'th', 'tr', 'vi', 'zh-cn', 'zh-tw'];

function fillMissingKeys(target: any, source: any) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      fillMissingKeys(target[key], source[key]);
    } else {
      if (target[key] === undefined) {
        target[key] = source[key];
      }
    }
  }
}

targetLocales.forEach(locale => {
  if (locale === 'en') return;
  const localePath = path.join(localesDir, `${locale}.json`);
  let localeData = {};
  if (fs.existsSync(localePath)) {
    localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  }
  
  fillMissingKeys(localeData, enData);
  
  fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2) + '\n');
  console.log(`Updated ${locale}.json`);
});
