// app/layout.tsx v2.0.2
import { redirect } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  redirect('/en');
}
