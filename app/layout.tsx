// app/layout.tsx v2.3.0
import { redirect } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  redirect('/en');
}
