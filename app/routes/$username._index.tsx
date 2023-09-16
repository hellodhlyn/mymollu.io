import { LoaderFunction, redirect } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  console.log(url.pathname);
  return redirect(`${url.pathname}/students`);
};
