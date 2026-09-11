import { CategoryManagement } from "@/components/admin/category-management";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      units: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return (
    <CategoryManagement
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        units: category.units.map((unit) => ({
          id: unit.id,
          label: unit.label,
          isDefault: unit.isDefault,
        })),
        productCount: category._count.products,
      }))}
    />
  );
}
