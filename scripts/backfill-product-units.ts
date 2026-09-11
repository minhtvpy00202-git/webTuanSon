import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getSuggestedUnits(categoryName: string) {
  const normalizedName = categoryName.toLowerCase();

  if (normalizedName.includes("gạch")) {
    return [
      { label: "m2", isDefault: true },
      { label: "thùng", isDefault: false },
    ];
  }

  if (normalizedName.includes("ngói")) {
    return [
      { label: "viên", isDefault: true },
      { label: "thùng", isDefault: false },
    ];
  }

  return [
    { label: "cái", isDefault: true },
    { label: "chiếc", isDefault: false },
  ];
}

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      units: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      },
      products: {
        include: {
          unitPrices: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  for (const category of categories) {
    let units = category.units;

    if (!units.length) {
      const suggestedUnits = getSuggestedUnits(category.name);

      await prisma.categoryUnit.createMany({
        data: suggestedUnits.map((unit, index) => ({
          categoryId: category.id,
          label: unit.label,
          sortOrder: index,
          isDefault: unit.isDefault,
        })),
      });

      units = await prisma.categoryUnit.findMany({
        where: { categoryId: category.id },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      });

      console.log(`Da them ${units.length} don vi tinh cho loai: ${category.name}`);
    } else if (!units.some((unit) => unit.isDefault)) {
      await prisma.categoryUnit.update({
        where: { id: units[0].id },
        data: { isDefault: true },
      });

      units = units.map((unit, index) => ({
        ...unit,
        isDefault: index === 0,
      }));
    }

    const defaultUnit = units.find((unit) => unit.isDefault) ?? units[0];

    for (const product of category.products) {
      if (product.unitPrices.length > 0) {
        continue;
      }

      await prisma.productUnitPrice.create({
        data: {
          productId: product.id,
          categoryUnitId: defaultUnit.id,
          price: product.price,
          discountPrice: product.discountPrice,
        },
      });

      console.log(`Da backfill don gia cho san pham: ${product.name}`);
    }
  }
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
