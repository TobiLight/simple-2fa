import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { getAccessToken, getUser } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);

  if (!user) return redirect("/auth/login");

  if (user.is_2fa_setup && user.is_otp_verified) return redirect("/dashboard");

  return json<{
    first_name: string;
    last_name: string;
    email: string;
    is_2fa_setup: Boolean;
    auth_2fa_type: string;
    phone_no: string;
  }>({ ...user }, { status: 200 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const user = await getUser(request);

  if (!user) return redirect("/auth/login");

  let otp = form.get("otp") as string;

  if (otp.length <= 0)
    return json<{
      detail: string;
      errors?: Array<{ field: string; message: string }>;
    }>(
      {
        detail: "Validation error",
        errors: [
          {
            field: "otp",
            message: "Field required",
          },
        ],
      },
      { status: 401 }
    );

  if (user.auth_2fa_type.toLowerCase() === "sms") {
    return redirect("/dashboard");
  }

  try {
    const req = await fetch(`${
      process.env.NODE_ENV === "development"
        ? process.env.DEV_URL
        : process.env.LIVE_URL
    }/auth/otp/verify`, {
      method: "POST",
      body: JSON.stringify({
        otp: otp,
        email: user.email,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (req.status === 200) return redirect("/dashboard");

    const resp = await req.json();

    return json<{
      detail: string;
    }>({ ...resp }, { status: 401 });
  } catch (err: any) {
    const error = err as {
      detail: string;
      errors?: Array<{ field: string; message: string }>;
    };

    return json<{
      detail: string;
      errors?: Array<{ field: string; message: string }>;
    }>({ ...error }, { status: 400 });
  }
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [error, setError] = useState<string>();

  const otpSMSFetcher = useFetcher<{
    detail?: string;
    is_2fa_setup?: boolean;
    is_otp_verified: boolean;
  }>({
    key: "sms-otp-verification-form",
  });

  useEffect(() => {
    setError(actionData?.detail);
  }, [actionData]);

  return (
    <div className="min-h-[inherit] flex flex-col items-center justify-center place-content-center w-full">
      <div className="w-full flex flex-col items-center">
        <h1 className="text-6xl font-semibold text-yellow-200">Welcome Back</h1>
        <p className="text-gray-100 text-lg mt-3">
          Verify the Authentication Code
        </p>

        <div className="bg-gray-300 rounded-md grid gap-6 p-8 w-11/12 mx-auto sm:w-3/6 md:w-2/5 mt-4">
          <div className="text-center">
            <h1 className="text-xl font-bold">Two-Factor Authentication</h1>
            <p className="text-sm">
              {loaderData.auth_2fa_type === "Google-Authenticator"
                ? "Open the two-step verification app on your mobile device to get your verification code."
                : `An sms was sent to your number ending in ${loaderData.phone_no.slice(-4)}`}
            </p>
          </div>
          {loaderData.auth_2fa_type.toLowerCase() === "sms" ? (
            <>
              <otpSMSFetcher.Form method="post" className="grid gap-4">
                {error ? (
                  <p className="text-red-500 text-lg text-center font-semibold">
                    {error}
                  </p>
                ) : null}
                <label htmlFor="otp">
                  <input
                    onChange={(e) => {
                      if (
                        e.currentTarget.value === "" ||
                        e.currentTarget.value.length > 0
                      )
                        setError(undefined);
                    }}
                    type="text"
                    name="otp"
                    placeholder="Authentication code"
                    className="w-full p-3 rounded shadow-inner"
                  />
                </label>
                <button
                  onClick={(e) => {
                    otpSMSFetcher.data = undefined;
                    otpSMSFetcher.submit({ otp: '123456' }, { method: "post" });
                  }}
                  className="text-gray-100 bg-black w-full p-3 rounded-md"
                >
                  Authenticate sms
                </button>
              </otpSMSFetcher.Form>
            </>
          ) : (
            <>
              <Form method="post" className="grid gap-4">
                {error ? (
                  <p className="text-red-500 text-lg text-center font-semibold">
                    {error}
                  </p>
                ) : null}
                <label htmlFor="otp">
                  <input
                    onChange={(e) => {
                      if (
                        e.currentTarget.value === "" ||
                        e.currentTarget.value.length > 0
                      )
                        setError(undefined);
                    }}
                    type="text"
                    name="otp"
                    placeholder="Authentication code"
                    className="w-full p-3 rounded shadow-inner"
                  />
                </label>
                <button className="text-gray-100 bg-black w-full p-3 rounded-md">
                  Authenticate
                </button>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
