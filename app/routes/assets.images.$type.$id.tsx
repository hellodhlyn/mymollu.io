import { LoaderFunction } from "@remix-run/cloudflare";

const studentPattern = "aHR0cHM6Ly9zY2hhbGUuZ2cvaW1hZ2VzL3N0dWRlbnQvY29sbGVjdGlvbi8ke3N0dWRlbnRJZH0ud2VicA==";
const bdPattern = "aHR0cHM6Ly9zY2hhbGUuZ2cvaW1hZ2VzL2l0ZW1zL2ljb24vaXRlbV9pY29uX21hdGVyaWFsX2V4c2tpbGxfJHtpZH1fMC53ZWJw";
const equipmentPattern = "aHR0cHM6Ly9zY2hhbGUuZ2cvaW1hZ2VzL2VxdWlwbWVudC9pY29uL2VxdWlwbWVudF9pY29uXyR7aWR9X3RpZXIxLndlYnA";

export const loader: LoaderFunction = async ({ params }) => {
  const assetType = params.type as string;
  const assetId = params.id as string;

  if (assetType === "students") {
    const assetUrl = atob(studentPattern).replace("${studentId}", assetId);
    return proxyResponse(assetUrl);
  } else if (assetType === "bds") {
    const remoteId = assetId.replace("others", "etc");
    const assetUrl = atob(bdPattern).replace("${id}", remoteId);
    return proxyResponse(assetUrl);
  } else if (assetType === "equipments") {
    const assetUrl = atob(equipmentPattern).replace("${id}", assetId);
    return proxyResponse(assetUrl);
  }
};

async function proxyResponse(assetUrl: string): Promise<Response> {
  const response = await fetch(assetUrl);
  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
