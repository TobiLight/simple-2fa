import { Form } from "@remix-run/react";
import { useState } from "react";

const OTPForm = ({email, password}: {email: string, password: string}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  return (
    <div className="min-h-[inherit] flex flex-col items-center justify-center place-content-center w-full">
      <div className="w-full flex flex-col items-center">
        <h1 className="text-6xl font-semibold text-yellow-300">Welcome Back</h1>
        <p className="text-gray-100 text-lg mt-3">
          Verify the Authentication Code
        </p>

        <div className="bg-gray-300 rounded-md grid gap-6 p-8 w-11/12 mx-auto sm:w-3/6 md:w-2/5 mt-4">
          <div className="text-center">
            <h1 className="text-xl font-bold">Two-Factor Authentication</h1>
            <p className="text-sm">
              Open the two-step verification app on your mobile device to get
              your verification code.
            </p>
          </div>
          <Form method="post" className="grid gap-4">
            <input type="hidden" name="form_type" value="otp-verification" />
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="password" value={password} />
            <label htmlFor="otp">
              <input
                type="text"
                name="otp"
                placeholder="Authentication code"
                className="w-full p-3 rounded shadow-inner"
              />
            </label>
            <button disabled={isLoading} className={`${isLoading ? 'opacity-60' : ''} text-gray-100 bg-black w-full p-3 rounded-md`}>
              {!isLoading ? 'Authenticate' : 'Authenticating...'}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default OTPForm;
