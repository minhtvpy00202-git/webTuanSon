import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminIndexPage() {
  const session = await getAdminSession();

  if (session?.role === "admin") {
    redirect("/admin/products");
  }

  redirect("/admin/login");
}
