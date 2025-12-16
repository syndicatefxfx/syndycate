"use client";

import AdminAuthGate from "@/components/AdminAuthGate";
import { AdminAuthProvider } from "@/components/AdminAuthProvider";

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminAuthGate>{children}</AdminAuthGate>
    </AdminAuthProvider>
  );
}
