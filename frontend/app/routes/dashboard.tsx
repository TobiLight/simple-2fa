import {
  ActionFunction,
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, Outlet } from "@remix-run/react";
import {
  destroySession,
  getAccessToken,
  getUser,
  getUserSession,
} from "~/session.server";

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
}

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const user = await getUser(request) as UserType;

  if (!user)
    return redirect("/auth/login", {
      headers: {
        "Set-Cookie": await destroySession(await getUserSession(request)),
      },
      status: 301,
    });

  return json({ ...user }, { status: 200 });
};

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const session = await getUserSession(request);
  const accessToken = await getAccessToken(request);

  if (!accessToken)
    return redirect("/auth/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
      status: 301,
    });

  try {
    const req = await fetch(`${
      process.env.NODE_ENV === "development"
        ? process.env.DEV_URL
        : process.env.LIVE_URL
    }/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const resp = await req.json();

    if (resp)
      return redirect("/auth/login", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
        status: 301,
      });
  } catch (err: any) {
    console.log("err", err);
  }

  return redirect("/auth/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
    status: 301,
  });
};

function DashboardLayout() {
  return (
    <>
      <header className="p-4 flex items-center justify-end gap-8 font-semibold border-b shadow">
        <Link to="/">Home</Link>
        <Form method="post">
          <button>Logout</button>
        </Form>
      </header>
      <main className="min-h-screen h-full">
        <Outlet />
      </main>
    </>
  );
}

export default DashboardLayout;
