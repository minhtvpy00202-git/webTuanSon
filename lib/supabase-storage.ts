import { createClient } from "@supabase/supabase-js";

const SUPABASE_PROJECT_REF_FALLBACK = "mkrmnlflnxmcpnldbaiq";

function getSupabaseUrl() {
  const explicitUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_HOST ||
    process.env.SUPABASE_HOST;

  if (explicitUrl) {
    return explicitUrl.startsWith("http") ? explicitUrl : `https://${explicitUrl}`;
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  let projectRef = "";

  try {
    const parsedUrl = new URL(databaseUrl);
    const usernameParts = parsedUrl.username.split(".");
    projectRef = usernameParts[usernameParts.length - 1] || "";
  } catch {
    projectRef = "";
  }

  if (!projectRef && SUPABASE_PROJECT_REF_FALLBACK) {
    projectRef = SUPABASE_PROJECT_REF_FALLBACK;
  }

  if (!projectRef) {
    throw new Error(
      "Không xác định được NEXT_PUBLIC_SUPABASE_URL. Hãy thêm NEXT_PUBLIC_SUPABASE_URL=\"https://<project-ref>.supabase.co\" vào file .env.",
    );
  }

  return `https://${projectRef}.supabase.co`;
}

function getSupabaseServiceRoleKey() {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Thiếu khóa server của Supabase để upload ảnh sản phẩm. Hãy thêm SUPABASE_SERVICE_ROLE_KEY (hoặc SUPABASE_SECRET_KEY) vào file .env.",
    );
  }

  return serviceRoleKey;
}

export function getSupabaseStorageAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function uploadProductImage(file: File) {
  const storage = getSupabaseStorageAdminClient();
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
  const objectPath = `products/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error } = await storage.storage
    .from("Product")
    .upload(objectPath, arrayBuffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = storage.storage.from("Product").getPublicUrl(objectPath);

  return {
    path: objectPath,
    publicUrl: data.publicUrl,
  };
}

/** Upload nhiều ảnh sản phẩm cùng lúc, trả về mảng kết quả. */
export async function uploadProductImages(files: File[]): Promise<Array<{ path: string; publicUrl: string }>> {
  return Promise.all(files.map((file) => uploadProductImage(file)))
}

/** Xóa ảnh sản phẩm theo đường dẫn storage, an toàn với null/undefined và không throw lỗi. */
export async function deleteProductImageByPath(storagePath: string | null | undefined): Promise<void> {
  if (!storagePath) {
    return
  }

  try {
    const storage = getSupabaseStorageAdminClient()
    await storage.storage.from("Product").remove([storagePath])
  } catch (error) {
    console.warn(`Không xóa được ảnh sản phẩm ${storagePath}:`, error)
  }
}
