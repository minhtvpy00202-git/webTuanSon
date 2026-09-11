import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const prismaUser = prisma.user as unknown as {
  upsert: (args: {
    where: { username: string };
    update: {
      username: string;
      email: string;
      passwordHash: string;
      roleId: number;
    };
    create: {
      username: string;
      email: string;
      passwordHash: string;
      roleId: number;
    };
  }) => Promise<unknown>;
};

const prismaCompanyBranch = (prisma as unknown as PrismaClient & {
  companyBranch: {
    deleteMany: (args: { where: { companyInfoId: number } }) => Promise<unknown>;
    createMany: (args: {
      data: Array<{
        companyInfoId: number;
        name: string;
        address: string;
        phone: string | null;
        email: string | null;
        mapsLink: string | null;
        sortOrder: number;
        isShowroom: boolean;
      }>;
    }) => Promise<unknown>;
  };
}).companyBranch;

const prismaCategoryUnit = (prisma as unknown as PrismaClient & {
  categoryUnit: {
    deleteMany: (args: { where: { categoryId?: number } }) => Promise<unknown>;
    createMany: (args: {
      data: Array<{
        categoryId: number;
        label: string;
        sortOrder: number;
        isDefault: boolean;
      }>;
    }) => Promise<unknown>;
  };
}).categoryUnit;

const prismaProductUnitPrice = (prisma as unknown as PrismaClient & {
  productUnitPrice: {
    deleteMany: (args: { where: { productId: number } }) => Promise<unknown>;
    createMany: (args: {
      data: Array<{
        productId: number;
        categoryUnitId: number;
        price: Prisma.Decimal;
        discountPrice: Prisma.Decimal | null;
      }>;
    }) => Promise<unknown>;
  };
}).productUnitPrice;

const prismaCategoryWithUnits = (prisma as unknown as PrismaClient & {
  category: {
    findUnique: (args: {
      where: { id: number };
      include: {
        units: {
          orderBy: Array<{ sortOrder?: "asc" | "desc"; id?: "asc" | "desc" }>;
        };
      };
    }) => Promise<{
      units: Array<{
        id: number;
        label: string;
      }>;
    } | null>;
  };
}).category;

const COMPANY_INFO_ID = 1;

const companySeed = {
  companyName: "Công ty Vật Liệu Xây Dựng Tuấn Sơn",
  aboutUs:
    "Chúng tôi chuyên phân phối gạch men, ngói và thiết bị vệ sinh với danh mục sản phẩm đa dạng, giúp khách hàng dễ dàng tra cứu và nhận tư vấn nhanh chóng.",
  mission:
    "Cung cấp giải pháp vật liệu xây dựng phù hợp, minh bạch thông tin sản phẩm và đồng hành cùng khách hàng trong suốt quá trình chọn mua, thi công và hoàn thiện công trình.",
  vision:
    "Trở thành đơn vị phân phối vật liệu xây dựng và thiết bị vệ sinh được khách hàng ưu tiên lựa chọn nhờ dịch vụ tư vấn tận tâm, danh mục sản phẩm rõ ràng và trải nghiệm tra cứu hiện đại.",
  phone: "0909 123 456",
  email: "contact@web-tuanson.vn",
  zaloLink: "https://zalo.me/0909123456",
  address: "123 Đường Mẫu, Quận Trung Tâm, TP. Hồ Chí Minh",
} as const;

const branchesSeed = [
  {
    companyInfoId: COMPANY_INFO_ID,
    name: "Trụ sở chính",
    address: "123 Đường Mẫu, Quận Trung Tâm, TP. Hồ Chí Minh",
    phone: "0909 123 456",
    email: "contact@web-tuanson.vn",
    mapsLink: "https://maps.google.com/?q=123+Duong+Mau+Quan+Trung+Tam+TP+Ho+Chi+Minh",
    sortOrder: 1,
    isShowroom: false,
  },
  {
    companyInfoId: COMPANY_INFO_ID,
    name: "Showroom Quận 7",
    address: "45 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh",
    phone: "0908 456 789",
    email: "showroomq7@web-tuanson.vn",
    mapsLink: "https://maps.google.com/?q=45+Nguyen+Thi+Thap+Quan+7+TP+Ho+Chi+Minh",
    sortOrder: 2,
    isShowroom: true,
  },
] as const;

const categoriesSeed = [
  {
    name: "Gạch ốp lát",
    slug: "gach-op-lat",
    units: [
      { label: "m2", isDefault: true },
      { label: "thùng", isDefault: false },
    ],
  },
  {
    name: "Ngói",
    slug: "ngoi",
    units: [
      { label: "viên", isDefault: true },
      { label: "thùng", isDefault: false },
    ],
  },
  {
    name: "Thiết bị vệ sinh",
    slug: "tb-ve-sinh",
    units: [
      { label: "cái", isDefault: true },
      { label: "chiếc", isDefault: false },
      { label: "hộp", isDefault: false },
    ],
  },
] as const;

function buildImageUrl(prompt: string, imageSize: string = "landscape_4_3") {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${imageSize}`;
}

const productsSeed: Array<{
  productCode: string;
  name: string;
  description: string;
  specs: string;
  isPromotion: boolean;
  imageUrl: string;
  categorySlug: (typeof categoriesSeed)[number]["slug"];
  unitPrices: Array<{
    unitLabel: string;
    price: Prisma.Decimal;
    discountPrice?: Prisma.Decimal;
  }>;
}> = [
  {
    productCode: "GACH-600X600-001",
    name: "Gạch lát nền Prime 600x600",
    description:
      "Mẫu gạch men bề mặt mờ, phù hợp cho phòng khách và các khu vực sinh hoạt chung.",
    specs: "Kích thước 600x600mm, xương porcelain, bề mặt mờ.",
    isPromotion: true,
    imageUrl: buildImageUrl(
      "realistic ceramic floor tiles display in a modern building materials showroom, neutral lighting, premium catalog product photo",
    ),
    categorySlug: "gach-op-lat",
    unitPrices: [
      {
        unitLabel: "m2",
        price: new Prisma.Decimal("325000"),
        discountPrice: new Prisma.Decimal("289000"),
      },
      {
        unitLabel: "thùng",
        price: new Prisma.Decimal("468000"),
        discountPrice: new Prisma.Decimal("419000"),
      },
    ],
  },
  {
    productCode: "GACH-300X600-002",
    name: "Gạch ốp tường Viglacera 300x600",
    description: "Thiết kế vân đá nhẹ, phù hợp cho nhà tắm và khu vực bếp hiện đại.",
    specs: "Kích thước 300x600mm, men bóng, tông màu sáng.",
    isPromotion: false,
    imageUrl: buildImageUrl(
      "realistic wall ceramic tile product photo, bright stone texture, building materials catalogue, showroom background",
    ),
    categorySlug: "gach-op-lat",
    unitPrices: [
      {
        unitLabel: "m2",
        price: new Prisma.Decimal("245000"),
      },
      {
        unitLabel: "thùng",
        price: new Prisma.Decimal("352000"),
      },
    ],
  },
  {
    productCode: "NGOI-MAU-003",
    name: "Ngói màu sóng lớn",
    description:
      "Dòng ngói lợp mái có khả năng chống thấm và giữ màu tốt trong điều kiện ngoài trời.",
    specs: "Vật liệu xi măng màu, chịu lực tốt, màu đỏ đất.",
    isPromotion: false,
    imageUrl: buildImageUrl(
      "realistic roof tile product photo, red roof tiles stacked in building materials display, clean catalog composition",
    ),
    categorySlug: "ngoi",
    unitPrices: [
      {
        unitLabel: "viên",
        price: new Prisma.Decimal("18500"),
      },
      {
        unitLabel: "thùng",
        price: new Prisma.Decimal("370000"),
      },
    ],
  },
  {
    productCode: "NGOI-PHANG-004",
    name: "Ngói phẳng cao cấp",
    description:
      "Dáng ngói hiện đại dành cho biệt thự và công trình có yêu cầu thẩm mỹ cao.",
    specs: "Dạng phẳng, màu xám đậm, phù hợp kiến trúc hiện đại.",
    isPromotion: true,
    imageUrl: buildImageUrl(
      "premium flat roof tile product photo, modern architectural materials catalog, realistic lighting",
    ),
    categorySlug: "ngoi",
    unitPrices: [
      {
        unitLabel: "viên",
        price: new Prisma.Decimal("22500"),
        discountPrice: new Prisma.Decimal("19900"),
      },
      {
        unitLabel: "thùng",
        price: new Prisma.Decimal("450000"),
        discountPrice: new Prisma.Decimal("399000"),
      },
    ],
  },
  {
    productCode: "LAVABO-005",
    name: "Lavabo đặt bàn sứ trắng",
    description: "Lavabo thiết kế gọn gàng, phù hợp cho căn hộ và nhà phố hiện đại.",
    specs: "Sứ trắng, kiểu dáng chữ nhật, dễ vệ sinh.",
    isPromotion: false,
    imageUrl: buildImageUrl(
      "realistic white ceramic sink product photo, sanitary ware showroom, clean premium catalogue image",
    ),
    categorySlug: "tb-ve-sinh",
    unitPrices: [
      {
        unitLabel: "cái",
        price: new Prisma.Decimal("1590000"),
      },
      {
        unitLabel: "chiếc",
        price: new Prisma.Decimal("1590000"),
      },
    ],
  },
  {
    productCode: "BONCAU-006",
    name: "Bồn cầu 1 khối tiết kiệm nước",
    description:
      "Sản phẩm hướng đến sự tiện nghi, dễ lắp đặt và tiết kiệm nước cho gia đình.",
    specs: "Bồn cầu 1 khối, xả xoáy, men chống bám bẩn.",
    isPromotion: true,
    imageUrl: buildImageUrl(
      "realistic modern toilet product photo, sanitary equipment showroom, building materials catalog style",
    ),
    categorySlug: "tb-ve-sinh",
    unitPrices: [
      {
        unitLabel: "cái",
        price: new Prisma.Decimal("3890000"),
        discountPrice: new Prisma.Decimal("3490000"),
      },
      {
        unitLabel: "chiếc",
        price: new Prisma.Decimal("3890000"),
        discountPrice: new Prisma.Decimal("3490000"),
      },
    ],
  },
];

async function seedRoles() {
  const [adminRole, guestRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" },
    }),
    prisma.role.upsert({
      where: { name: "guest" },
      update: {},
      create: { name: "guest" },
    }),
  ]);

  return { adminRole, guestRole };
}

async function seedAdminUser(adminRoleId: number) {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@web-tuanson.vn";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prismaUser.upsert({
    where: { username: adminUsername },
    update: {
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      roleId: adminRoleId,
    },
    create: {
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      roleId: adminRoleId,
    },
  });

  return { adminUsername, adminEmail };
}

async function seedCompanyInfo() {
  await prisma.companyInfo.upsert({
    where: { id: COMPANY_INFO_ID },
    update: companySeed,
    create: {
      id: COMPANY_INFO_ID,
      ...companySeed,
    },
  });
}

async function seedBranches() {
  await prismaCompanyBranch.deleteMany({
    where: { companyInfoId: COMPANY_INFO_ID },
  });

  await prismaCompanyBranch.createMany({
    data: branchesSeed.map((branch) => ({
      companyInfoId: branch.companyInfoId,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      mapsLink: branch.mapsLink,
      sortOrder: branch.sortOrder,
      isShowroom: branch.isShowroom,
    })),
  });
}

async function seedCategories() {
  const categories = await Promise.all(
    categoriesSeed.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name },
        create: {
          name: category.name,
          slug: category.slug,
        },
      }),
    ),
  );

  return new Map(categories.map((category) => [category.slug, category.id]));
}

async function seedCategoryUnits(categoryBySlug: Map<string, number>) {
  const categoryUnitsBySlug = new Map<string, Map<string, number>>();

  for (const category of categoriesSeed) {
    const categoryId = categoryBySlug.get(category.slug);

    if (!categoryId) {
      throw new Error(`Category not found for slug: ${category.slug}`);
    }

    await prismaCategoryUnit.deleteMany({
      where: { categoryId },
    });

    await prismaCategoryUnit.createMany({
      data: category.units.map((unit, index) => ({
        categoryId,
        label: unit.label,
        sortOrder: index,
        isDefault: unit.isDefault,
      })),
    });

    const insertedUnits = await prismaCategoryWithUnits.findUnique({
      where: { id: categoryId },
      include: {
        units: {
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        },
      },
    });

    categoryUnitsBySlug.set(
      category.slug,
      new Map(
        (insertedUnits?.units ?? []).map((unit) => [unit.label, unit.id]),
      ),
    );
  }

  return categoryUnitsBySlug;
}

async function seedProducts(
  categoryBySlug: Map<string, number>,
  categoryUnitsBySlug: Map<string, Map<string, number>>,
) {
  for (const product of productsSeed) {
    const categoryId = categoryBySlug.get(product.categorySlug);
    const categoryUnits = categoryUnitsBySlug.get(product.categorySlug);

    if (!categoryId || !categoryUnits) {
      throw new Error(`Category not found for slug: ${product.categorySlug}`);
    }

    const defaultUnitPrice = product.unitPrices[0];

    const savedProduct = await prisma.product.upsert({
      where: { productCode: product.productCode },
      update: {
        name: product.name,
        description: product.description,
        specs: product.specs,
        price: defaultUnitPrice.price,
        discountPrice: defaultUnitPrice.discountPrice ?? null,
        isPromotion: product.isPromotion,
        imageUrl: product.imageUrl,
        categoryId,
      },
      create: {
        productCode: product.productCode,
        name: product.name,
        description: product.description,
        specs: product.specs,
        price: defaultUnitPrice.price,
        discountPrice: defaultUnitPrice.discountPrice ?? null,
        isPromotion: product.isPromotion,
        imageUrl: product.imageUrl,
        categoryId,
      },
    });

    await prismaProductUnitPrice.deleteMany({
      where: { productId: savedProduct.id },
    });

    await prismaProductUnitPrice.createMany({
      data: product.unitPrices.map((unitPrice) => {
        const categoryUnitId = categoryUnits.get(unitPrice.unitLabel);

        if (!categoryUnitId) {
          throw new Error(
            `Unit ${unitPrice.unitLabel} not found for category: ${product.categorySlug}`,
          );
        }

        return {
          productId: savedProduct.id,
          categoryUnitId,
          price: unitPrice.price,
          discountPrice: unitPrice.discountPrice ?? null,
        };
      }),
    });
  }
}

async function main() {
  const { adminRole, guestRole } = await seedRoles();
  const { adminUsername, adminEmail } = await seedAdminUser(adminRole.id);

  await seedCompanyInfo();
  await seedBranches();

  const categoryBySlug = await seedCategories();
  const categoryUnitsBySlug = await seedCategoryUnits(categoryBySlug);
  await seedProducts(categoryBySlug, categoryUnitsBySlug);

  console.log("Seed completed.");
  console.log(`Roles: ${adminRole.name}, ${guestRole.name}`);
  console.log(`Admin username: ${adminUsername}`);
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Categories: ${categoriesSeed.map((item) => item.name).join(", ")}`);
  console.log(`Branches: ${branchesSeed.length}`);
  console.log(`Products: ${productsSeed.length}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
