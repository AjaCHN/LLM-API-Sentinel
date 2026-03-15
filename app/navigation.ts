import {createNavigation} from 'next-intl/navigation';

const locales = ['ar', 'cs', 'en', 'es', 'hi', 'id', 'it', 'nl', 'pl', 'sv', 'th', 'tr', 'ru', 'vi', 'zh-cn', 'zh-tw'];

export const {Link, redirect, usePathname, useRouter} =
  createNavigation({locales, localePrefix: 'never'});
