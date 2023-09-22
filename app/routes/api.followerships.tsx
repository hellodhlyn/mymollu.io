import { ActionFunction } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { Env } from "~/env.server";
import { follow, unfollow } from "~/models/followership";
import { Sensei, getSenseiByUsername } from "~/models/sensei";

export const action: ActionFunction = async ({ request, context }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const follower = await authenticator.isAuthenticated(request);
  if (!follower) {
    return errorResponse(401);
  }

  const env = context.env as Env;
  const formData = await request.formData();
  const followeeName = formData.get("username");
  if (!followeeName) {
    return errorResponse(400);
  }

  const followee = await getSenseiByUsername(env, followeeName.toString());
  if (!followee) {
    return errorResponse(400);
  }

  try {
    if (request.method === "POST") {
      await follow(env, follower.id, followee.id);
    } else if (request.method === "DELETE") {
      await unfollow(env, follower.id, followee.id);
    }
    return okResponse(201);
  } catch (error) {
    console.error(error);
    return errorResponse(500);
  }
}

function okResponse(status: number): Response {
  return new Response(
    JSON.stringify({}),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}

function errorResponse(status: number, message?: string): Response {
  return new Response(
    JSON.stringify({ error: { message: message ?? "error" } }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}
