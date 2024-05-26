import { ActionFunction, ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, Outlet, redirect } from "@remix-run/react";
import {
  getUserSession,
  getAccessToken,
  destroySession,
} from "~/session.server";

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

  console.log("oiuhygfdcvbnjuhyg");

  try {
    const req = await fetch("http://127.0.0.1:8000/auth/logout", {
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

function OTPLayout() {
  return (
    <>
      <header className="p-4 flex items-center justify-end gap-8 font-semibold border-b shadow">
        <Link to="/">Home</Link>
        <Form method="post">
          <button>Logout</button>
        </Form>
      </header>
      <main className="min-h-screen h-full bg-purple-500">
        <Outlet />
        <footer className="relative text-white bottom-0 w-full text-center flex items-center justify-center py-2 border-t text-sm">
          <p className="text-lg font-sembiold font-semibold tracking-wider">
            Made with love
          </p>
        </footer>
      </main>
    </>
  );
}

export default OTPLayout;
