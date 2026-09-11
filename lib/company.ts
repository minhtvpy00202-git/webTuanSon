import { prisma } from "@/lib/prisma";

type CompanyBranchRecord = {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  mapsLink: string | null;
  sortOrder: number;
  isShowroom: boolean;
  createdAt: Date;
};

type CompanyInfoRecord = Awaited<ReturnType<typeof prisma.companyInfo.findUnique>>;

type CompanyInfoWithBranches = {
  companyInfo: CompanyInfoRecord | null;
  branches: CompanyBranchRecord[];
};

function getCompanyBranchDelegate() {
  const client = prisma as typeof prisma & {
    companyBranch?: {
      findMany: (args: {
        orderBy: Array<{ sortOrder: "asc" | "desc" } | { createdAt: "asc" | "desc" }>;
      }) => Promise<CompanyBranchRecord[]>;
      count: () => Promise<number>;
    };
  };

  return client.companyBranch;
}

export async function getCompanyInfoWithBranches(): Promise<CompanyInfoWithBranches> {
  const companyInfo = await prisma.companyInfo.findUnique({
    where: { id: 1 },
  });

  const companyBranch = getCompanyBranchDelegate();

  if (!companyBranch) {
    return {
      companyInfo,
      branches: [],
    };
  }

  try {
    const branches = await companyBranch.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return {
      companyInfo,
      branches,
    };
  } catch (error) {
    console.error("Không thể tải danh sách chi nhánh:", error);

    return {
      companyInfo,
      branches: [],
    };
  }
}

export async function getCompanyBranchCount() {
  const companyBranch = getCompanyBranchDelegate();

  if (!companyBranch) {
    return 0;
  }

  try {
    return await companyBranch.count();
  } catch (error) {
    console.error("Không thể đếm số chi nhánh:", error);
    return 0;
  }
}
