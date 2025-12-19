"use client";

import AdminAuthGate from "@/components/AdminAuthGate";
import { AdminAuthProvider } from "@/components/AdminAuthProvider";
import { AdminLocaleProvider } from "@/components/AdminLocaleProvider";
import { ToastProvider } from "@/components/admin/ToastProvider";

export default function AdminLayout({ children }) {
  return (
    <AdminLocaleProvider>
      <AdminAuthProvider>
        <ToastProvider>
          <AdminAuthGate>{children}</AdminAuthGate>
        </ToastProvider>
      </AdminAuthProvider>
    </AdminLocaleProvider>
  );
}
