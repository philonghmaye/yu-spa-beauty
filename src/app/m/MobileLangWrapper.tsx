'use client';

import { LangProvider } from './LangContext';

export default function MobileLangWrapper({ children }: { children: React.ReactNode }) {
  return <LangProvider>{children}</LangProvider>;
}
