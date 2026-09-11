import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session?.role === "admin") {
    redirect("/admin/products");
  }

  return (
    <section className="mx-auto max-w-xl py-8">
      <AdminLoginForm />
    </section>
  );
}

