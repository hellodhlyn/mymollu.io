import type { LoaderFunctionArgs} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import type { Env } from "~/env.server";
import { getSenseiByRandom } from "~/models/sensei";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const { username } = await getSenseiByRandom(env);
  return redirect(`/@${username}`);
};
