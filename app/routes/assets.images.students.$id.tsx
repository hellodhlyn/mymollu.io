import { LoaderFunction } from "@remix-run/cloudflare";

const assetUrlPattern = "aHR0cHM6Ly9zY2hhbGUuZ2cvaW1hZ2VzL3N0dWRlbnQvY29sbGVjdGlvbi8ke3N0dWRlbnRJZH0ud2VicA==";

export const loader: LoaderFunction = async ({ params }) => {
  const studentId = params.id as string;
  const assetUrl = atob(assetUrlPattern).replace("${studentId}", studentId);
  const response = await fetch(assetUrl);
  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
