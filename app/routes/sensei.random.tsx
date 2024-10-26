import type { LoaderFunctionArgs} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { getSenseiByRandom } from "~/models/sensei";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const { username } = await getSenseiByRandom(env);
  return redirect(`/@${username}`);
};
