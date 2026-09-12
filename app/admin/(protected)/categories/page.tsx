import { CategoryManagement } from "@/components/admin/category-management";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
    include: {
      parent: { select: { id: true, name: true, slug: true } },
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
        parentId: category.parentId,
        parentName: category.parent?.name ?? undefined,
        sortOrder: category.sortOrder,
        units: category.units.map((unit) => ({
          id: unit.id,
          label: unit.label,
          isDefault: unit.isDefault,
        })),
        productCount: category._count.products,
      }))}
      parentOptions={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId,
      }))}
    />
  );
}
