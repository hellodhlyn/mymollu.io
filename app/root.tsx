import { json } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { cssBundleHref } from "@remix-run/css-bundle";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
} from "@remix-run/react";
import styles from "./tailwind.css?url";
import { getAuthenticator } from "./auth/authenticator.server";
import { Header, Footer } from "./components/organisms/base";
import { useEffect, useState } from "react";
import { isDarkMode } from "./lib/device/index.client";

export const links = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.8/static/pretendard.css" },
  { rel: "stylesheet", href: "https://cdn.jsdelivr.net/gh/Nyannnnnng/GyeonggiTitleWoff/stylesheet.css" },
  { rel: "stylesheet", href: styles },
];

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const sensei = await getAuthenticator(context.cloudflare.env).isAuthenticated(request);
  return json({ currentUsername: sensei?.username ?? null });
};

export default function App() {
  const { currentUsername } = useLoaderData<typeof loader>();

  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;

  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    setDarkMode(isDarkMode());
  }, []);

  return (
    <html lang="ko" className={darkMode ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0,viewport-fit=cover" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content={darkMode ? "#262626" : "#ffffff"} />
        <meta name="background-color" content={darkMode ? "#262626" : "#ffffff"} />
        <Meta />
        <Links />
      </head>
      <body className="text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200 transition">
        {pathname.startsWith("/edit") ? <Outlet /> : (
          <div className="mx-auto max-w-3xl p-4">
            <Header currentUsername={currentUsername} />
            <Outlet />
            <Footer />
          </div>
        )}
        
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
