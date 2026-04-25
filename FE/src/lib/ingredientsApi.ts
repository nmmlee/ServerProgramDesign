const prefix = "/api";

/** 로그인 API가 저장하는 JWT 키 (LoginPage·getUserId와 동일해야 함) */
export const AUTH_TOKEN_STORAGE_KEY = "token";

/** API 응답으로 주고받는 재료 형태 */
export type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  purchaseDate: string; // YYYY-MM-DD
  expiry: string;       // YYYY-MM-DD
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** `localStorage`의 JWT payload에서 `userId` 추출 (검증은 서버에서 수행) */
export function getUserId(): string | null {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const uid = payload.userId;
  if (uid == null) return null;
  if (typeof uid === "string") return uid;
  return String(uid);
}

// 서버에서 넘어온 값을 받아주고, Ingredient 타입으로 변환
function normalizeIngredient(raw: {
  id: unknown;
  name: string;
  quantity: number;
  purchaseDate?: string;
  expiry: string;
}): Ingredient {
  return {
    id: String(raw.id),
    name: raw.name,
    quantity: Number(raw.quantity),
    purchaseDate: raw.purchaseDate ?? "",
    expiry: raw.expiry,
  };
}

// Get API 호출, 초기에 사용자 재료 목록 전부 조회
export async function fetchIngredients(userId: string): Promise<Ingredient[]> {
  const res = await fetch(
    `${prefix}/ingredients?userId=${encodeURIComponent(userId)}`,
  );
  if (!res.ok) throw new Error(await res.text());
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("Invalid ingredients response");
  return data.map((item) => normalizeIngredient(item as Ingredient));
}

// Create API 호출
export async function createIngredient(body: {
  name: string;
  quantity: number;
  purchaseDate: string;
  expiry: string;
  userId: string;
}): Promise<Ingredient> {
  const res = await fetch(`${prefix}/ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return normalizeIngredient(data);
}

// Update API 호출
export async function updateIngredient(
  id: string,
  body: Omit<Ingredient, "id">,
): Promise<Ingredient> {
  const res = await fetch(`${prefix}/ingredients/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return normalizeIngredient(data);
}

// Delete API 호출
export async function deleteIngredient(id: string): Promise<void> {
  const res = await fetch(`${prefix}/ingredients/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
}
