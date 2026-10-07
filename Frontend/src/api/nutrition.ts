import { apiClient, apiErrorMessage } from "./client";
import { FoodItem } from "../data/FoodProvider";

export type MealResult = FoodItem & {
  description?: string;
  healthScore: number;
  confidence?: "low" | "medium" | "high";
  items?: { name: string; grams: number; kcal: number }[];
};

export async function analyzeMealImage(uri: string, mimeType?: string): Promise<MealResult> {
  const isPng = /\.png(?:\?|$)/i.test(uri);
  const isWebp = /\.webp(?:\?|$)/i.test(uri);
  const type = mimeType || (isPng ? "image/png" : isWebp ? "image/webp" : "image/jpeg");
  const name = type === "image/png" ? "meal.png" : type === "image/webp" ? "meal.webp" : "meal.jpg";
  const form = new FormData();
  form.append("image", {
    uri,
    name,
    type,
  } as any);

  try {
    const response = await apiClient.post<MealResult>("/nutrition/analyze", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.error === "no_food") {
      throw new Error("We couldn't find food in that photo.");
    }
    throw new Error(apiErrorMessage(error));
  }
}

export async function searchFoods(query: string): Promise<FoodItem[]> {
  const url =
    "https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=15" +
    `&fields=product_name,brands,nutriments&search_terms=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Food search is unavailable.");
  const data = await response.json();
  return (data.products ?? [])
    .map((product: any) => {
      const nutrients = product.nutriments ?? {};
      return {
        name: [product.product_name, product.brands?.split(",")[0]].filter(Boolean).join(" · "),
        kcal: Math.round(Number(nutrients["energy-kcal_100g"]) || 0),
        protein: Math.round((Number(nutrients.proteins_100g) || 0) * 10) / 10,
        carbs: Math.round((Number(nutrients.carbohydrates_100g) || 0) * 10) / 10,
        fat: Math.round((Number(nutrients.fat_100g) || 0) * 10) / 10,
        serving: "100 g",
      } as FoodItem;
    })
    .filter((food: FoodItem) => food.name && food.kcal > 0);
}

export const POPULAR_FOODS: FoodItem[] = [
  { name: "Greek yogurt", kcal: 100, protein: 17, carbs: 6, fat: 0.7, serving: "1 cup · 170 g" },
  { name: "Grilled chicken breast", kcal: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100 g" },
  { name: "Avocado", kcal: 160, protein: 2, carbs: 9, fat: 15, serving: "½ fruit · 100 g" },
  { name: "Brown rice", kcal: 216, protein: 5, carbs: 45, fat: 1.8, serving: "1 cup · 195 g" },
];