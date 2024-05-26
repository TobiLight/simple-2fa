import { Form, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Bounce, toast, ToastContainer } from "react-toastify";

const SMSVerification = ({
  phone,
  hideOTPForm,
}: {
  phone: string;
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

       <form action="" className="p-6 grid gap-4">
        <label htmlFor="phone" className="grid">
          <span>Phone No</span>
        <input type="text" placeholder="Enter OTP" className="p-3 rounded-md border-0 w-auto bg-gray-300" />
        </label>
        <div className="flex items-center gap-3">
        <button onClick={() => hideOTPForm()} className="p-3 bg-gray-300">Close</button>
        <button className="p-3 text-white bg-purple-600">Verify</button>
        </div>
       </form>
      </div>
  );
};

export default SMSVerification;
