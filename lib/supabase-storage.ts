import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const explicitUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

  if (explicitUrl) {
    return explicitUrl;
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

  if (!projectRef) {
    throw new Error("Không xác định được NEXT_PUBLIC_SUPABASE_URL.");
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
