import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_DURATION = 60 * 60 * 24 * 7;

type AdminSessionPayload = {
  userId: number;
  username: string;
  role: string;
};

function getJwtSecret() {
  return new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || "dev-admin-secret-change-me",
  );
}

export async function createAdminSessionToken(payload: AdminSessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_DURATION}s`)
    .sign(getJwtSecret());
}

export async function verifyAdminSessionToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());

  return payload as unknown as AdminSessionPayload;
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_DURATION,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyAdminSessionToken(token);
  } catch {
    return null;
  }
}

export { ADMIN_SESSION_COOKIE };
