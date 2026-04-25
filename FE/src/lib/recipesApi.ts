const prefix = "/api";

export type SavedRecipeRow = {
  id: string;
  title: string;
  content: string;
  savedAt: string;
};

export async function fetchRecipes(userId: string): Promise<SavedRecipeRow[]> {
  const res = await fetch(
    `${prefix}/recipes?userId=${encodeURIComponent(userId)}`,
  );
  if (!res.ok) throw new Error(await res.text());
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("Invalid recipes response");
  return data as SavedRecipeRow[];
}

export async function saveRecipe(body: {
  userId: string;
  title: string;
  content: string;
}): Promise<SavedRecipeRow> {
  const res = await fetch(`${prefix}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<SavedRecipeRow>;
}

export async function updateRecipe(
  id: string,
  body: { title: string; content: string },
): Promise<SavedRecipeRow> {
  const res = await fetch(`${prefix}/recipes/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<SavedRecipeRow>;
}

export async function deleteRecipe(id: string): Promise<void> {
  const res = await fetch(`${prefix}/recipes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
}
