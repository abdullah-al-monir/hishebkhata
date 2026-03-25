import { Metadata } from 'next';
import SettingsClient from '@/components/shared/SettingsClient';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return <SettingsClient />;
}