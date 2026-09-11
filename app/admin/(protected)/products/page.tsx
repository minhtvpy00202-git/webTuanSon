import { ProductManagement } from "@/components/admin/product-management";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        units: {
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        },
      },
    }),
    prisma.product.findMany({
      include: {
        category: {
          include: {
            units: {
              orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
            },
          },
        },
        unitPrices: {
          include: {
            categoryUnit: true,
          },
          orderBy: {
            categoryUnit: {
              sortOrder: "asc",
            },
          },
        },
        images: {
          orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return (
    <ProductManagement
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        units: category.units.map((unit) => ({
          id: unit.id,
          label: unit.label,
          isDefault: unit.isDefault,
          sortOrder: unit.sortOrder,
        })),
      }))}
      products={products.map((product) => ({
        id: product.id,
        productCode: product.productCode,
        name: product.name,
        description: product.description,
        specs: product.specs || "",
        isPromotion: product.isPromotion,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        categoryName: product.category.name,
        createdAt: product.createdAt.toISOString(),
        unitPrices: product.unitPrices.map((unitPrice) => ({
          categoryUnitId: unitPrice.categoryUnitId,
          label: unitPrice.categoryUnit.label,
          isDefault: unitPrice.categoryUnit.isDefault,
          price: unitPrice.price.toString(),
          discountPrice: unitPrice.discountPrice?.toString() ?? null,
        })),
        images: product.images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          storagePath: img.storagePath ?? null,
          isMain: img.isMain,
          sortOrder: img.sortOrder,
        })),
      }))}
    />
  );
}
