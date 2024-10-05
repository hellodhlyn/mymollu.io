import { json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { startRegistration } from "@simplewebauthn/browser";
import { useState } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { SubButton } from "~/components/atoms/button";
import { SubTitle, Title } from "~/components/atoms/typography";
import { getPasskeysBySensei, Passkey } from "~/models/passkey";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { KeyIcon, PlusIcon } from "@heroicons/react/24/outline";

dayjs.extend(utc);
dayjs.extend(timezone);

export const meta: MetaFunction = () => [
  { title: "인증/보안 | 몰루로그" },
];

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  return json({
    sensei,
    passkeys: await getPasskeysBySensei(env, sensei),
  });
}

export default function EditSecurity() {
  const loaderData = useLoaderData<typeof loader>();
  const [passkeys, setPasskeys] = useState(loaderData.passkeys);

  const addPasskey = async () => {
    const creationOptions = await fetch("/auth/passkey/register");
    const creationResponse = await startRegistration({ optionsJSON: await creationOptions.json() });

    const creationResult = await fetch("/auth/passkey/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creationResponse),
    });

    if (!creationResult.ok) {
      // TODO
      return;
    }

    const createdPasskey = await creationResult.json<Passkey>();
    setPasskeys((prev) => [...prev, createdPasskey]);
  };

  return (
    <div className="pb-16">
      <Title text="인증/보안" />

      <SubTitle text="Passkey 관리" />
      <div className="flex">
        <SubButton onClick={addPasskey}>
          <PlusIcon className="size-4" strokeWidth={2} />
          <span>Passkey 추가</span>
        </SubButton>
      </div>
      {passkeys.map((passkey) => (
        <div
          key={`passkey-${passkey.uid}`}
          className="my-4 py-2 px-4 flex bg-neutral-100 rounded-lg items-center"
        >
          <KeyIcon className="mr-3 size-6" strokeWidth={2} />
          <div>
            <p>{passkey.memo}</p>
            <p className="text-sm text-neutral-500">
              {dayjs.tz(passkey.createdAt, "utc").tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
