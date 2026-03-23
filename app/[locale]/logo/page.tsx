// app/[locale]/logo/page.tsx v3.4.9
'use client';

import { useState } from 'react';
import { generateLogo } from '../../lib/logo-generator';
import Image from 'next/image';
import { Loader2, Download, RefreshCw } from 'lucide-react';

export default function LogoPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const url = await generateLogo();
      setLogoUrl(url);
    } catch (error) {
      console.error('Failed to generate logo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">LLM API Sentinel Logo Generator</h1>
        <p className="text-muted-foreground">
          Generate a professional logo and favicon for your application using Gemini 3.1 Flash Image.
        </p>

        <div className="relative aspect-square w-64 h-64 mx-auto border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-muted/50 overflow-hidden">
          {logoUrl ? (
            <Image 
              src={logoUrl} 
              alt="Generated Logo" 
              fill 
              className="object-contain" 
              unoptimized
            />
          ) : (
            <div className="text-muted-foreground text-sm">No logo generated yet</div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {logoUrl ? <RefreshCw className="w-4 h-4" /> : null}
            {isLoading ? 'Generating...' : logoUrl ? 'Regenerate Logo' : 'Generate Logo'}
          </button>

          {logoUrl && (
            <a
              href={logoUrl}
              download="logo.png"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-all"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </a>
          )}
        </div>

        {logoUrl && (
          <div className="p-4 bg-muted rounded-lg text-left space-y-2">
            <h3 className="font-semibold">Next Steps:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Download the generated image.</li>
              <li>Save it as <code>public/logo.png</code> for the main logo.</li>
              <li>Crop it to 32x32 and save as <code>public/favicon.ico</code>.</li>
              <li>Update your <code>layout.tsx</code> to reference these assets.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
