import { Form, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Bounce, toast, ToastContainer } from "react-toastify";

const OTPVerification = ({
  otp_auth_url,
  otp_secret,
  hideOTPForm,
}: {
  otp_auth_url: string;
  otp_secret: string;
  hideOTPForm: () => void;
  // verifyOTP: () => void
}) => {
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const otpFetcher = useFetcher<{ detail?: string, is_2fa_setup?: boolean }>({key: 'otp-verification-form'});
  const [OTP, setOTP] = useState<string>("");

  const handleSubmit = () => {
    otpFetcher.submit({ otp: OTP }, { method: "post" });
  };

  // useEffect(() => {
  //   console.log("otpFetcher", otpFetcher);
  // }, [otpFetcher.state === "idle" && otpFetcher.data]);

  useEffect(() => {
    if (otpFetcher.data && otpFetcher.data.detail){
      toast.error(otpFetcher.data?.detail, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        // theme: "light",
        transition: Bounce,
      });

      return
}

    if (otpFetcher.data && otpFetcher.data.is_2fa_setup){
      // toast.success("OTP verified!", {
      //   position: "top-right",
      //   autoClose: 2000,
      //   hideProgressBar: false,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      //   progress: undefined,
      //   // theme: "light",
      //   transition: Bounce,
      // })
      hideOTPForm()
    }
    return;
  }, [otpFetcher.data]);

  return (
      <div className="bg-white rounded shadow-xl py-6 overflow-y-scroll max-h-[90vh] w-11/12 mx-auto sm:w-2/3 lg:w-2/4">
        <div className="heading border-b p-6 pb-3">
          <h1 className="text-2xl font-semibold">
            Two-Factor Authentication (2FA)
          </h1>
        </div>

        <div className="body p-6 grid gap-6">
          <div className="google">
            <h2 className="text-lg font-semibold text-purple-600 pb-1 border-b">
              Configure Google Authenticator
            </h2>
            <div className="steps mt-3 grid gap-1 text-sm">
              <p>
                1. Install Google Authenticator from Playstore or Appstore
                (Android / iOS).
              </p>
              <p>2. In the authenticator app, select the "+" icon.</p>
              <p>
                3. Select "Scan a barcode (or QR Code)" and use the phone's
                camera to scan this barcode.
              </p>
            </div>
          </div>

          <div className="scan-code">
            <h2 className="text-lg font-semibold text-purple-600 pb-1 border-b">
              Scan QR Code
            </h2>
            <div className="qr mt-3">
              <QRCode value={otp_auth_url} size={164} />
            </div>
          </div>

          <div className="enter-secret-key">
            <h2 className="text-lg font-semibold text-purple-600 pb-1 border-b">
              OR Enter the secret key into the Google Authenticator App
            </h2>
            <div className="step mt-3 text-sm">
              <p>
                SecretKey:{" "}
                <span className="px-2 bg-gray-200 rounded-md font-bold">
                  {otp_secret ? otp_secret : ""}
                </span>
              </p>
            </div>
          </div>

          <div className="verify-code">
            <h2 className="text-lg font-semibold text-purple-600 pb-1 border-b">
              Verify Code
            </h2>
            <div className="step mt-3 grid gap-3 text-sm">
              <p>
                For changing this setting, please verify the authentication code
              </p>

              <otpFetcher.Form method="post" className="grid gap-4">
                <label htmlFor="otp" className="w-full sm:w-2/4">
                  <input
                    type="text"
                    name="otp"
                    id="otp"
                    disabled={otpFetcher.state !== "idle"}
                    placeholder="Authentication Code"
                    className="bg-gray-200 rounded-md px-4 py-2 focus:outline-purple-600 w-full"
                  />
                </label>
                <div className="flex items-center gap-3">
                  <button
                    disabled={otpFetcher.state !== "idle"}
                    type="button"
                    onClick={hideOTPForm}
                    className="bg-gray-200 hover:bg-gray-300 rounded-md px-5 py-3 font-semibold"
                  >
                    Close
                  </button>
                  <button
                    disabled={otpFetcher.state !== "idle"}
                    type="submit"
                    onClick={(e) => {
                      otpFetcher.data = undefined;
                      handleSubmit();
                    }}
                    className={`${
                      otpFetcher.state !== "idle" ? "opacity-50" : ""
                    } bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-md text-white font-semibold`}
                  >
                    {otpFetcher.state !== "idle"
                      ? "Verifying..."
                      : "Verify & Activate"}
                  </button>
                </div>
              </otpFetcher.Form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default OTPVerification;
