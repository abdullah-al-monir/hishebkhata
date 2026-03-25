import { Metadata } from 'next';
import FinanceClient from '@/components/finance/FinanceClient';

export const metadata: Metadata = { title: 'Finance' };

export default function FinancePage() {
  return <FinanceClient />;
}