import {createNavigation} from 'next-intl/navigation';

const locales = ['en', 'zh-cn', 'zh-tw', 'es', 'ar'];

export const {Link, redirect, usePathname, useRouter} =
  createNavigation({locales, localePrefix: 'as-needed'});
