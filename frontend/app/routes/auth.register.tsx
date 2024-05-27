import { ActionFunction, ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Bounce, toast, ToastContainer } from "react-toastify";

type AuthActionResult = {
  detail: string;
  data: {
    success?: {
      email: string;
      first_name: string;
      last_name: string;
      phone_no: string;
      id: string;
      created_at: string;
      // updated_at: "2024-05-10T17:15:41.959Z",
      is_2fa_enabled: Boolean;
      auth_2fa_type: string;
    };
    errors: Array<{
      field: string;
      message: string;
    }>;
  };
};

function checkPasswordStrength(password: string) {
  /**
	This function checks the strength of a password based on the following criteria:
	- Minimum length (configurable)
	- One uppercase character (A-Z)
	- One lowercase character (a-z)
	- One special character (!@#$%^&*()_+-=[]{};':|\,.<>/?)
	- One digit (0-9)
  
	Strength is rated as:
	- Very Weak (less than 4 criteria met)
	- Weak (4 criteria met)
	- Medium (5 criteria met)
	- Strong (6 criteria met, including minimum length of 8)
	- Very Strong (all criteria met, including minimum length of 12)
	*/

  // Define minimum length requirement (you can adjust this value)
  const MIN_LENGTH = 7;

  // Regular expressions for different character classes
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const specialCharRegex = /[^a-zA-Z\d\s]/;
  const digitRegex = /\d/;

  // Check if all character classes are present and count them
  let strengthScore = 0;

  strengthScore += uppercaseRegex.test(password) ? 1 : 0;
  strengthScore += lowercaseRegex.test(password) ? 1 : 0;
  strengthScore += specialCharRegex.test(password) ? 1 : 0;
  strengthScore += digitRegex.test(password) ? 1 : 0;

  // Additional check for minimum length
  if (password.length >= MIN_LENGTH) {
    strengthScore += 2;
  }

  // Password strength based on score: (adjust labels as needed)
  const strengthLabels = [
    "Very Weak",
    "Weak",
    "Medium",
    "Strong",
    "Very Strong",
  ];

  return strengthScore - 1 >= 3;
}

export async function action<ActionFunction>({ request }: ActionFunctionArgs) {
  let errors: AuthActionResult = {
    detail: "",
    data: {
      // success: undefined,
      errors: [],
    },
  };

  const form = await request.formData();

  let firstName = (form.get("first_name") as string) || null;

  let lastName = (form.get("last_name") as string) || null;

  let email = form.get("email") as string;

  let password = form.get("password") as string;

  let phone_no = form.get("phone_no") as string;

  let enable2fa = form.get("enable_2fa") as string;

  let authenticationType = form.get("authentication_type") as string;

  if (!firstName || !firstName.length)
    errors = {
      detail: "Field validation error",
      data: {
        errors: [
          {
            field: "first_name",
            message: "First name is required!",
          },
        ],
      },
    };

  if (!lastName || !lastName.length) {
    errors.detail = "Field validation error";
    errors.data.errors.push({
      field: "last_name",
      message: "Last name is required!",
    });
  }

  if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    errors.detail = "Field validation error";
    errors.data.errors.push({
      field: "email",
      message: "Invalid email address",
    });
  }

  if (password.length < 7) {
    errors.detail = "Field validation error";

    errors.data.errors.push({
      field: "password",
      message: "Password is too short!",
    });
  } else if (password.length > 10) {
    errors.detail = "Field validation error";

    errors.data.errors.push({
      field: "password",
      message: "Password must be 7 to 10 characters long",
    });
  } else if (!checkPasswordStrength(password)) {
    errors.detail = "Field validation error";

    errors.data.errors.push({
      field: "password",
      message: "Password is too weak!",
    });
  }

  if (!phone_no.match(/^\d+$/)) {
    errors.detail = "Field validation error";

    errors.data.errors.push({
      field: "phone_no",
      message: "Phone number is invalid!",
    });

    return json({ ...errors }, { status: 400 });
  }

  if (!phone_no.match(/^234/)) {
    errors.detail = "Field validation error";

    errors.data.errors.push({
      field: "phone_no",
      message: "Phone number must start with 234",
    });

    return json({ ...errors }, { status: 400 });
  }

  if (phone_no.length > 13 || phone_no.length < 13) {
    errors.detail = "Field validation error";

    errors.data.errors.push({
      field: "phone_no",
      message: "Phone number is invalid!",
    });
  }

  if (errors.data.errors.length > 0)
    return json({ ...errors }, { status: 400 });

  try {
    const formRequest = await fetch(`${
      process.env.NODE_ENV === "development"
        ? process.env.DEV_URL
        : process.env.LIVE_URL
    }/auth/register`, {
      method: "POST",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        phone_no: phone_no,
        // enable_2fa: enable2fa.toLocaleLowerCase() === "yes" ? true : false,
        authentication_type: authenticationType,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (formRequest.status !== 200 && formRequest.status !== 201) {
      let error = (await formRequest.json()) as AuthActionResult;

      throw error;
    }

    const response = await formRequest.json();

    const data: AuthActionResult = {
      detail: "Registration successful!",
      data: {
        errors: [],
        success: { ...response },
      },
    };

    return json({ ...data }, { status: 201 });
  } catch (err: any) {
    let error = err as AuthActionResult;

    return json({ ...error }, { status: 400 });
  }
}

export default function Register() {
  const dt = useActionData() as AuthActionResult;

  const formRef = useRef(null);

  const navigate = useNavigate();

  const [formError, setFormError] = useState<{
    [x: string]: string | null | undefined;
  }>();

  useEffect(() => {
    if (dt && dt.data && dt.data.errors) {
      for (let { field, message } of dt.data.errors) {
        setFormError((prev) => ({
          ...prev,
          detail: dt.detail,
          [field]: message,
        }));
      }
    }

    if (dt && dt.data && !dt.data.success && dt.data.errors.length > 0) {
      toast.error(dt.detail, {
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

    return;
  }, [dt]);

  useEffect(() => {
    if (dt && !dt.data) {
      toast.error(dt.detail, {
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
    return;
  }, [dt]);

  useEffect(() => {
    if (dt && dt.data && dt.data.success) {
      // create toast notification here
      toast.success(dt.detail, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });

      if (formRef.current !== null) formRef.current.reset();

      setTimeout(() => {
        navigate("/auth/login");
      }, 3100);
    }
  }, [dt && dt.data && dt.data.success]);

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
      <h1 className="text-center font-semibold text-4xl pb-12 text-yellow-300">
        Register
      </h1>
      <Form
        ref={formRef}
        method="post"
        className="w-10/12 mx-auto sm:w-3/4 md:w-2/4 lg:w-2/4 rounded-md px-8 py-16 bg-white shadow-lg grid gap-6"
      >
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <label htmlFor="first_name">
              First name
              <input
                onChange={handleInputChange}
                type="text"
                name="first_name"
                placeholder="John"
                className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500"
              />
              {formError && (
                <p className="text-red-500 text-sm">{formError.first_name}</p>
              )}
            </label>

            <label htmlFor="last_name">
              Last name
              <input
                onChange={handleInputChange}
                type="text"
                name="last_name"
                placeholder="Doe"
                className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500"
              />
              {formError && (
                <p className="text-red-500 text-sm">{formError.last_name}</p>
              )}
            </label>
          </div>

          <label htmlFor="email">
            Email
            <input
              onChange={handleInputChange}
              required
              name="email"
              type="email"
              placeholder="johndoe@example.com"
              className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500"
            />
            {formError && (
              <p className="text-red-500 text-sm">{formError.email}</p>
            )}
          </label>

          <label htmlFor="password">
            Password
            <input
              onChange={handleInputChange}
              required
              name="password"
              type="password"
              placeholder="********"
              className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500"
            />
            {formError && (
              <p className="text-red-500 text-sm">{formError.password}</p>
            )}
          </label>

          <label htmlFor="phone">
            Phone No
            <input
              onChange={handleInputChange}
              required
              type="tel"
              name="phone_no"
              placeholder="2349000000000"
              className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500 bg-gray"
            />
            {formError && (
              <p className="text-red-500 text-sm">{formError.phone_no}</p>
            )}
          </label>
          <label htmlFor="authentication_type" className="grid">
            <span>2FA Authentication Type</span>
            <select name="authentication_type" id="" className="w-fit bg-gray-200 p-2 rounded-md">
              <option value="SMS">SMS</option>``
              <option value="Google-Authenticator">Google Authenticator</option>
            </select>
          </label>
          <button
            type="submit"
            className="btn-primary bg-purple-600 hover:bg-purple-700 text-gray-100 p-3 rounded-md mt-8"
          >
            Create account
          </button>
        </div>
        <div className="flex items-center gap-1">
          <p>Have an account?</p>
          <Link to="/auth/login" className="font-bold text-purple-500">
            Login
          </Link>
        </div>
      </Form>
    </div>
  );
}
