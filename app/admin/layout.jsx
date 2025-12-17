"use client";

import AdminAuthGate from "@/components/AdminAuthGate";
import { AdminAuthProvider } from "@/components/AdminAuthProvider";
import { AdminLocaleProvider } from "@/components/AdminLocaleProvider";

export default function AdminLayout({ children }) {
  return (
    <AdminLocaleProvider>
      <AdminAuthProvider>
        <AdminAuthGate>{children}</AdminAuthGate>
      </AdminAuthProvider>
    </AdminLocaleProvider>
  );
}
