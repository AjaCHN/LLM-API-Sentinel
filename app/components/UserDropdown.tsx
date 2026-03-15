// app/components/UserDropdown.tsx v1.0.0
'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, Shield, Mail, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface UserDropdownProps {
  user: any;
  logout: () => void;
}

export default function UserDropdown({ user, logout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-2 border border-border hover:bg-muted/50 transition-all rounded-full bg-muted/20"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] font-bold leading-none mb-0.5 truncate max-w-[100px]">{user.displayName || 'User'}</p>
          <p className="text-[8px] opacity-50 font-mono leading-none truncate max-w-[100px]">{user.email}</p>
        </div>
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-border bg-muted/30">
            <p className="text-xs font-bold truncate">{user.displayName}</p>
            <p className="text-[10px] opacity-50 truncate font-mono">{user.email}</p>
          </div>
          
          <div className="p-1">
            <Link 
              href={`/${locale}/profile`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-[11px] font-medium hover:bg-muted rounded-md transition-colors"
            >
              <User className="w-4 h-4 opacity-70" />
              个人资料 (Profile)
            </Link>
            <Link 
              href={`/${locale}/settings`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-[11px] font-medium hover:bg-muted rounded-md transition-colors"
            >
              <Settings className="w-4 h-4 opacity-70" />
              设置 (Settings)
            </Link>
          </div>

          <div className="p-1 border-t border-border">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 opacity-70" />
              退出登录 (Sign Out)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
