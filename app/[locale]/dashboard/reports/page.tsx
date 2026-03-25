import { Metadata } from 'next';
import ReportsClient from '@/components/report/ReportsClient';

export const metadata: Metadata = { title: 'Reports' };

export default function ReportsPage() {
  return <ReportsClient />;
}