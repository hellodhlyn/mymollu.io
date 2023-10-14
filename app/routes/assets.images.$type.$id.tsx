import { LoaderFunction } from "@remix-run/cloudflare";
import { Env } from "~/env.server";

const cacheControl = "public, max-age=86400";

export const loader: LoaderFunction = async ({ context, params, request }) => {
  const env = context.env as Env;
  const pathname = new URL(request.url).pathname;
  const object = await env.ASSETS_BUCKET.get(pathname);
  if (object) {
    return responseObject(object);
  }

  const remoteUrl = getRemoteUrl(params.type!, params.id!);
  if (!remoteUrl) {
    return new Response("Not found", { status: 404 });
  }

  const remoteRes = await fetch(remoteUrl);
  await putResponse(env, pathname, remoteRes.clone());
  return new Response(remoteRes.body, {
    headers: {
      "Content-Type": remoteRes.headers.get("Content-Type") ?? "",
      "Cache-Control": cacheControl,
    },
  });
};

async function putResponse(env: Env, key: string, res: Response): Promise<void> {
  await env.ASSETS_BUCKET.put(key, res.body, {
    httpMetadata: {
      contentType: res.headers.get("Content-Type") ?? undefined,
      cacheControl,
    },
    customMetadata: {
      loadedAt: new Date().getTime().toString(),
    },
  });
}

function responseObject(object: R2ObjectBody): Response {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
}

const studentPattern = "aHR0cHM6Ly9zY2hhbGUuZ2cvaW1hZ2VzL3N0dWRlbnQvY29sbGVjdGlvbi8ke3N0dWRlbnRJZH0ud2VicA==";
const bossPattern = "aHR0cHM6Ly9zY2hhbGUuZ2cvaW1hZ2VzL3JhaWQvQm9zc19Qb3J0cmFpdF8ke2lkfV9Mb2JieS5wbmc=";
const bdPattern = "aHR0cHM6Ly9zY2hhbGUuZ2cvaW1hZ2VzL2l0ZW1zL2ljb24vaXRlbV9pY29uX21hdGVyaWFsX2V4c2tpbGxfJHtpZH1fMC53ZWJw";
const equipmentPattern = "aHR0cHM6Ly9zY2hhbGUuZ2cvaW1hZ2VzL2VxdWlwbWVudC9pY29uL2VxdWlwbWVudF9pY29uXyR7aWR9X3RpZXIxLndlYnA";

function getRemoteUrl(assetType: string, assetId: string): string | null {
  if (assetType === "students") {
    return atob(studentPattern).replace("${studentId}", assetId);
  } else if (assetType === "boss") {
    return atob(bossPattern).replace("${id}", bossRemoteAssetId(assetId));
  } else if (assetType === "bds") {
    const remoteId = assetId.replace("others", "etc");
    return atob(bdPattern).replace("${id}", remoteId);
  } else if (assetType === "equipments") {
    return atob(equipmentPattern).replace("${id}", assetId);
  }
  return null
}

function bossRemoteAssetId(assetId: string): string {
  if (assetId === "hod") {
    return "HOD";
  } else if (assetId === "gregorius") {
    return "EN0005";
  } else if (assetId === "hovercraft") {
    return "RaidHoverCraft";
  } else {
    return capitalize(assetId);
  }
}

function capitalize(text: string): string {
  const camelText = text.replace(/\-[a-z]/g, (group) => group.slice(-1).toUpperCase());
  return camelText[0].toUpperCase() + camelText.substring(1);
}
