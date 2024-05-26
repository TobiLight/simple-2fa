import {
  ActionFunction,
  ActionFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { toast, Bounce, ToastContainer } from "react-toastify";
import OTPVerification from "~/components/OTPVerification";
import { getAccessToken } from "~/session.server";

type UserType = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  is_2fa_enabled: boolean;
  is_2fa_setup: boolean;
  is_otp_verified: boolean;
  otp_secret: string;
  otp_auth_url: string;
  auth_2fa_type: string;
};

export async function action({ request }: ActionFunctionArgs) {
  const accessToken = await getAccessToken(request);

  if (!accessToken) return redirect("/login");

  const form = await request.formData();

  const otp = form.get("otp") as string;

  const authenticationType = form.get("auth_type") as string;

  console.log("otp", otp, authenticationType);

  if (!otp.length || otp.length < 6)
    return json({ detail: "Invalid OTP" }, { status: 400 });

  try {
    const req = await fetch("http://localhost:8000/user/otp/verify", {
      method: "POST",
      body: JSON.stringify({
        otp,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const resp = await req.json();

    return json({ ...resp }, { status: 200 });
  } catch (err: any) {
    console.log(err);
    return null;
  }
}

export default function Dashboard() {
  const loaderData = useRouteLoaderData("routes/dashboard") as UserType;
  const actionData = useActionData() as UserType;

  const [displayOTPForm, setDisplayOTPForm] = useState<boolean>(false);

  const otpFetcher = useFetcher<{
    detail?: string;
    is_2fa_setup?: boolean;
    is_2fa_enabled: boolean;
  }>({
    key: "otp-verification-form",
  });

  useEffect(() => {
    if (otpFetcher.data && otpFetcher.data.is_2fa_setup) {
      toast.success("2FA setup complete", {
        autoClose: 2000,
        transition: Bounce,
      });
    }
    return;
  }, [otpFetcher.state === "idle"]);

  useEffect(() => {
    if (actionData && actionData.is_2fa_setup && actionData.is_otp_verified)
      toast.success("2FA setup complete!", {
        autoClose: 2000,
        transition: Bounce,
      });
  }, [actionData]);

  return (
    <div className="pt-20 min-h-[inerit] bg-purple-500">
      <ToastContainer />

      <section className="bg-ct-blue-600  min-h-screen pt-10 w-11/12 mx-auto sm:w-5/6">
        <div className="max-w-4xl p-12 mx-auto bg-white rounded-md h-auto flex gap-20 justify-center items-start">
          <div className="flex-grow-2">
            <h1 className="text-2xl font-semibold">Profile Page</h1>
            <div className="mt-8">
              <p className="mb-4">ID: {loaderData.id}</p>
              <p className="mb-4">
                Name: {loaderData.first_name} {loaderData.last_name}
              </p>
              <p className="mb-4">Email: {loaderData.email}</p>
              <p className="mb-4">
                2FA:{" "}
                <span
                  className={`${
                    loaderData.is_2fa_enabled ? "bg-green-500" : "bg-red-500"
                  } text-white rounded-md py-1 px-2`}
                >
                  {loaderData.is_2fa_enabled ? "Enabled" : "Disabled"}
                </span>
              </p>
              <p className="mb-4">
                2FA Setup Completed:{" "}
                <span
                  className={`${
                    loaderData.is_2fa_setup ? "bg-green-500" : "bg-red-500"
                  } text-white rounded-md py-1 px-2`}
                >
                  {loaderData.is_2fa_setup ? "Yes" : "No"}
                </span>
              </p>
              <p className="mb-4">
                Authentication type:{" "}
                <span className="flex items-center gap-2">
                 {loaderData.auth_2fa_type}
                </span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">
              {loaderData.auth_2fa_type === "SMS"
                ? "SMS Authentication (2FA)"
                : "Mobile App Authentication (2FA)"}
            </h3>
            <p className="mb-4">
              Secure your account with TOTP two-factor authentication.
            </p>
            {loaderData.is_2fa_enabled && loaderData.is_2fa_setup ? (
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none"
                onClick={() => setDisplayOTPForm(true)}
              >
                Disable 2FA
              </button>
            ) : (
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none"
                onClick={() => setDisplayOTPForm(true)}
              >
                Setup 2FA
              </button>
            )}
          </div>
        </div>
      </section>

      {displayOTPForm && (
        <section className="fixed bg-[#0007] top-0 w-full h-full flex justify-center items-center">
          <OTPVerification
            authenticationType={loaderData.auth_2fa_type.toLowerCase()}
            phone_no={loaderData.phone_no}
            otp_auth_url={loaderData.otp_auth_url}
            otp_secret={loaderData.otp_secret}
            hideOTPForm={() => setDisplayOTPForm(false)}
          />
        </section>
      )}
    </div>
  );
}
