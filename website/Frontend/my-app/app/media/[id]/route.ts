import { API_BASE_URL } from "../../api";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return new Response("Invalid image ID.", { status: 400 });
  }

  const imageUrl = new URL(`/api/media/images/${id}`, new URL(API_BASE_URL).origin);
  let upstream: Response;
  try {
    upstream = await fetch(imageUrl, { cache: "no-store" });
  } catch (error) {
    console.error("Unable to fetch workout image from the API.", error);
    return new Response("Unable to fetch workout image.", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || "";
  if (!upstream.ok || !contentType.startsWith("image/")) {
    return new Response("Workout image is unavailable.", { status: upstream.ok ? 502 : upstream.status });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
