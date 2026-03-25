import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "হিসাব খাতা", template: "%s | হিসাব খাতা" },
  description: "Smart Attendance & Payroll Management for SMBs in Bangladesh",
  keywords: ["attendance", "payroll", "bangladesh", "SMB", "হিসাব", "বেতন"],
  openGraph: {
    title: "হিসাব খাতা - Hishab Khata",
    description: "Smart Business Management for SMBs",
    url: "https://hishabkhata.com.bd",
    siteName: "Hishab Khata",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}