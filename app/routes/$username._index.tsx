import { LoaderFunction, redirect } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  return redirect(`${url.pathname}/students`);
};
