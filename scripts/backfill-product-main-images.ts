import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      NOT: {
        images: {
          some: {
            isMain: true,
          },
        },
      },
    },
  });

  if (!products.length) {
    console.log("Khong co san pham nao can backfill anh chinh.");
    return;
  }

  console.log(`Bat dau backfill ${products.length} san pham...`);

  const created: number[] = [];

  for (const product of products) {
    if (!product.imageUrl) {
      console.log(`Bo qua san pham #${product.id} (khong co imageUrl).`);
      continue;
    }

    const image = await prisma.productImage.create({
      data: {
        productId: product.id,
        imageUrl: product.imageUrl,
        isMain: true,
        sortOrder: 0,
      },
    });

    created.push(image.id);
    console.log(`  - Created #${image.id} for product #${product.id}: ${product.name}`);
  }

  console.log(`Hoan thanh: da tao ${created.length} ProductImage.`);
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
