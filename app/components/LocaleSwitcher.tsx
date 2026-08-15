// app/components/LocaleSwitcher.tsx v2.9.1
'use client';

import { Globe } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * 语言切换器：列出所有受支持的语言，切换后写入 localStorage 并即时刷新 UI。
 * i18n 内核已做 locale 白名单校验，这里仅透传受支持的 code，无需额外校验。
 */
export default function LocaleSwitcher() {
  const { locale, setLocale, supportedLocales, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('dashboard.changeLanguage') || 'Change language'}
          className="group"
        >
          <Globe className="size-5 transition-colors group-hover:text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        <DropdownMenuLabel>
          {t('dashboard.changeLanguage') || 'Language'}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={locale} onValueChange={(next) => setLocale(next)}>
          {supportedLocales.map((item) => (
            <DropdownMenuRadioItem key={item.code} value={item.code}>
              {item.nativeName}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
