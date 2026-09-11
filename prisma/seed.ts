import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function buildImageUrl(prompt: string, imageSize: string = "landscape_4_3") {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${imageSize}`;
}

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const guestRole = await prisma.role.upsert({
    where: { name: "guest" },
    update: {},
    create: { name: "guest" },
  });

  await prisma.companyInfo.upsert({
    where: { id: 1 },
    update: {
      aboutUs:
        "Chung toi chuyen phan phoi gach men, ngoi va thiet bi ve sinh voi danh muc san pham da dang, de tra cuu va tu van nhanh cho khach hang.",
      mission:
        "Mang den trai nghiem catalogue dien tu gon gang, minh bach thong tin va de dang tim kiem theo nhu cau cong trinh.",
      phone: "0909 123 456",
      email: "contact@web-tuanson.vn",
      zaloLink: "https://zalo.me/0909123456",
      address: "123 Duong Mau, Quan Trung Tam, TP. Ho Chi Minh",
    },
    create: {
      id: 1,
      aboutUs:
        "Chung toi chuyen phan phoi gach men, ngoi va thiet bi ve sinh voi danh muc san pham da dang, de tra cuu va tu van nhanh cho khach hang.",
      mission:
        "Mang den trai nghiem catalogue dien tu gon gang, minh bach thong tin va de dang tim kiem theo nhu cau cong trinh.",
      phone: "0909 123 456",
      email: "contact@web-tuanson.vn",
      zaloLink: "https://zalo.me/0909123456",
      address: "123 Duong Mau, Quan Trung Tam, TP. Ho Chi Minh",
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "gach-op-lat" },
      update: { name: "Gach op lat" },
      create: { name: "Gach op lat", slug: "gach-op-lat" },
    }),
    prisma.category.upsert({
      where: { slug: "ngoi" },
      update: { name: "Ngoi" },
      create: { name: "Ngoi", slug: "ngoi" },
    }),
    prisma.category.upsert({
      where: { slug: "tb-ve-sinh" },
      update: { name: "TB Ve sinh" },
      create: { name: "TB Ve sinh", slug: "tb-ve-sinh" },
    }),
  ]);

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category.id]));

  const products: Array<{
    productCode: string;
    name: string;
    description: string;
    specs: string;
    price: Prisma.Decimal;
    discountPrice?: Prisma.Decimal;
    isPromotion: boolean;
    imageUrl: string;
    categorySlug: string;
  }> = [
    {
      productCode: "GACH-600X600-001",
      name: "Gach lat nen Prime 600x600",
      description: "Mau gach men be mat mo, phu hop phong khach va khu vuc sinh hoat chung.",
      specs: "Kich thuoc 600x600mm, xuong porcelain, be mat mo.",
      price: new Prisma.Decimal("325000"),
      discountPrice: new Prisma.Decimal("289000"),
      isPromotion: true,
      imageUrl: buildImageUrl(
        "realistic ceramic floor tiles display in a modern building materials showroom, neutral lighting, premium catalog product photo",
      ),
      categorySlug: "gach-op-lat",
    },
    {
      productCode: "GACH-300X600-002",
      name: "Gach op tuong Viglacera 300x600",
      description: "Thiet ke van da nhe, phu hop nha tam va khu vuc bep hien dai.",
      specs: "Kich thuoc 300x600mm, men bong, tong mau sang.",
      price: new Prisma.Decimal("245000"),
      isPromotion: false,
      imageUrl: buildImageUrl(
        "realistic wall ceramic tile product photo, bright stone texture, building materials catalogue, showroom background",
      ),
      categorySlug: "gach-op-lat",
    },
    {
      productCode: "NGOI-MAU-003",
      name: "Ngoi mau song lon",
      description: "Dong ngoi lop mai co kha nang chong tham va giu mau tot ngoai troi.",
      specs: "Vat lieu xi mang mau, chiu luc tot, mau do dat.",
      price: new Prisma.Decimal("18500"),
      isPromotion: false,
      imageUrl: buildImageUrl(
        "realistic roof tile product photo, red roof tiles stacked in building materials display, clean catalog composition",
      ),
      categorySlug: "ngoi",
    },
    {
      productCode: "NGOI-PHANG-004",
      name: "Ngoi phang cao cap",
      description: "Dang ngoi hien dai danh cho biet thu va cong trinh co yeu cau tham my cao.",
      specs: "Dang phang, mau xam dam, phu hop kien truc hien dai.",
      price: new Prisma.Decimal("22500"),
      discountPrice: new Prisma.Decimal("19900"),
      isPromotion: true,
      imageUrl: buildImageUrl(
        "premium flat roof tile product photo, modern architectural materials catalog, realistic lighting",
      ),
      categorySlug: "ngoi",
    },
    {
      productCode: "LAVABO-005",
      name: "Lavabo dat ban su trang",
      description: "Lavabo thiet ke gon gang, phu hop can ho va nha pho hien dai.",
      specs: "Su trang, kieu dang chu nhat, de ve sinh.",
      price: new Prisma.Decimal("1590000"),
      isPromotion: false,
      imageUrl: buildImageUrl(
        "realistic white ceramic sink product photo, sanitary ware showroom, clean premium catalogue image",
      ),
      categorySlug: "tb-ve-sinh",
    },
    {
      productCode: "BONCAU-006",
      name: "Bon cau 1 khoi tiet kiem nuoc",
      description: "San pham huong den su tien nghi, de lap dat va tiet kiem nuoc cho gia dinh.",
      specs: "Bon cau 1 khoi, xa xoay, men chong bam ban.",
      price: new Prisma.Decimal("3890000"),
      discountPrice: new Prisma.Decimal("3490000"),
      isPromotion: true,
      imageUrl: buildImageUrl(
        "realistic modern toilet product photo, sanitary equipment showroom, building materials catalog style",
      ),
      categorySlug: "tb-ve-sinh",
    },
  ];

  for (const product of products) {
    const categoryId = categoryBySlug.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Category not found for slug: ${product.categorySlug}`);
    }

    await prisma.product.upsert({
      where: { productCode: product.productCode },
      update: {
        name: product.name,
        description: product.description,
        specs: product.specs,
        price: product.price,
        discountPrice: product.discountPrice,
        isPromotion: product.isPromotion,
        imageUrl: product.imageUrl,
        categoryId,
      },
      create: {
        productCode: product.productCode,
        name: product.name,
        description: product.description,
        specs: product.specs,
        price: product.price,
        discountPrice: product.discountPrice,
        isPromotion: product.isPromotion,
        imageUrl: product.imageUrl,
        categoryId,
      },
    });
  }

  console.log("Seed completed.");
  console.log(`Roles: ${adminRole.name}, ${guestRole.name}`);
  console.log(`Categories: ${categories.map((item) => item.name).join(", ")}`);
  console.log(`Products: ${products.length}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
