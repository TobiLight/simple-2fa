import {
  ActionFunction,
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import {
  destroySession,
  destroyUserSession,
  getAccessToken,
  getUser,
  getUserSession,
  requireUserSession,
} from "~/session.server";

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const user = await getUser(request);

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
