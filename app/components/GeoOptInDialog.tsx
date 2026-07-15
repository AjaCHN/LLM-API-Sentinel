// app/components/GeoOptInDialog.tsx v2.7.0
'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { enableGeoLocation, disableGeoLocation } from '../hooks/useGeoLocation';

export default function GeoOptInDialog() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const optIn = window.localStorage.getItem('geoOptIn');
    // Show dialog only when the user has not been asked yet.
    if (optIn === null) {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const handleAccept = () => {
    enableGeoLocation();
    setOpen(false);
    // refresh page so useGeoLocation picks up the new opt-in value and fetches.
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleDecline = () => {
    disableGeoLocation();
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="geo-opt-in-title"
      aria-describedby="geo-opt-in-description"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border/40 bg-card p-6 shadow-2xl">
        <h2
          id="geo-opt-in-title"
          className="text-lg font-semibold text-foreground"
        >
          {t('geo.title')}
        </h2>
        <p
          id="geo-opt-in-description"
          className="mt-2 text-sm text-muted-foreground"
        >
          {t('geo.description')}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleDecline}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-transparent px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('geo.disable')}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('geo.enable')}
          </button>
        </div>
      </div>
    </div>
  );
}
