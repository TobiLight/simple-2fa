import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, Navigate, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Bounce, toast, ToastContainer } from "react-toastify";
import OTPForm from "~/components/OTPForm";
import { createUserSession, getUserSession } from "~/session.server";

type ActionResult = {
  detail: string;
  data: {
    success?: {
      is_2fa_enabled: Boolean;
      is_2fa_setup: Boolean;
      auth_2fa_type: string;
    };
    errors: Array<{
      field: string;
      message: string;
    }>;
  };
};

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  let session = await getUserSession(request);

  if (session.has("user")) return redirect("/dashboard");

  return null;
};

export async function action<ActionFunction>({ request }: ActionFunctionArgs) {
  let errors: ActionResult = {
    detail: "",
    data: {
      // success: undefined,
      errors: [],
    },
  };

  const form = await request.formData();

  const formType = form.get("form_type");

  const email = form.get("email") as string;
  const password = form.get("password") as string;

  const otp = form.get("otp") as string;

  if (formType === "login")
    if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
      errors.detail = "Field validation error";
      errors.data.errors.push({
        field: "email",
        message: "Invalid email address",
      });
    }

  if (errors.data.errors.length > 0)
    return json({ ...errors }, { status: 400 });

  try {
    const formRequest = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (formRequest.status !== 200 && formRequest.status !== 201) {
      let error = (await formRequest.json()) as ActionResult;

      throw error;
    }

    const response = await formRequest.json();

    if (response.user_info.is_2fa_setup)
      return await createUserSession({
        redirectTo: "/otp/verification",
        userId: response.user_info.id,
        accessToken: response.access_token,
      });

    const data: ActionResult = {
      detail: "Login successful!",
      data: {
        errors: [],
        success: { ...response },
      },
    };

    return await createUserSession({
      redirectTo: "/dashboard",
      accessToken: response.access_token,
      userId: response.user_info.id,
    });
  } catch (err: any) {
    let error = err as ActionResult;

    return json({ ...error }, { status: 400 });
  }
}

export default function Login() {
  const loginAction = useActionData() as ActionResult;
  const [showOTPForm, setShowOTPForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [formError, setFormError] = useState<{
    [x: string]: string | null | undefined;
  }>();

  useEffect(() => {
    setIsLoading(false);

    if (loginAction && loginAction.data && loginAction.data.errors) {
      for (let { field, message } of loginAction.data.errors) {
        setFormError((prev) => ({
          ...prev,
          [field]: message,
        }));
      }
    }
  }, [loginAction]);

  useEffect(() => {
    setIsLoading(false);

    if (loginAction && !loginAction.data) {
      toast.error(loginAction.detail, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        // theme: "light",
        transition: Bounce,
      });
    }
  }, [loginAction]);

  useEffect(() => {
    setIsLoading(false);

    if (loginAction && loginAction.data && loginAction.data.success) {
      if (
        loginAction.data.success.auth_2fa_type &&
        loginAction.data.success.auth_2fa_type.includes("Google-Authenticator")
      ) {
        // setShowOTPForm(true);
        console.log("password", password);
        // localStorage.setItem('user', JSON.stringify({loginAction.data.success.}))
      } else if (
        loginAction.data.success.auth_2fa_type &&
        loginAction.data.success.auth_2fa_type.includes("SMS")
      ) {
        console.log("sms");
      } else {
        console.log("login success");
      }
    }
    return;
  }, [loginAction]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    
    setFormError((prevError) => ({
      ...prevError,
      [name]: value === "" ? undefined : null,
      detail: "",
    }));
  };

  return (
    <div className="min-h-[inherit] py-20 flex flex-col justify-center items-center bg-purple-500">
      <ToastContainer />
      <div className="w-full">
        <h1 className="text-center font-semibold text-4xl text-yellow-300 pb-12">
          Login
        </h1>
        <Form
          method="POST"
          className="w-10/12 mx-auto sm:w-3/4 md:w-2/4 lg:w-2/5 rounded-md p-4 bg-white shadow-lg grid gap-6"
        >
          <input type="hidden" name="form_type" value="login" />
          <div className="grid gap-4">
            <label
              htmlFor="email"
              className={`${
                formError && formError.email ? "text-red-500" : ""
              }`}
            >
              Email
              <input
                onChange={(e) => {
                  handleInputChange(e);
                  setEmail(e.currentTarget.value);
                }}
                required
                name="email"
                type="email"
                placeholder="johndoe@example.com"
                className={`${
                  formError && formError.email ? "border-red-500" : ""
                } px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500`}
              />
              {formError && (
                <p className="text-red-500 text-sm">{formError.email}</p>
              )}
            </label>

            <label htmlFor="password">
              Password
              <input
                onChange={(e) => {
                  setPassword(e.currentTarget.value);
                }}
                required
                name="password"
                type="password"
                placeholder="********"
                className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500"
              />
            </label>

            <button
              disabled={isLoading}
              className={`${
                isLoading ? "opacity-50" : ""
              } btn-primary bg-purple-600 hover:bg-purple-700 text-gray-100 p-3 rounded-md mt-3`}
            >
              {isLoading ? "Please wait..." : "Login"}
            </button>
          </div>
          <div className="flex items-center gap-1">
            <p>Need an account?</p>
            <Link to="/auth/register" className="font-bold text-purple-500">
              Create one here
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
