import { Link } from "@remix-run/react";

export default function Login() {
	return (
		<div className="min-h-[inherit] py-20 flex flex-col justify-center items-center bg-gray-100">
			<h1 className="text-center font-semibold text-4xl pb-12">Login</h1>

			<form action="" method="POST" className="w-10/12 mx-auto sm:w-3/4 md:w-2/4 lg:w-2/5 rounded-md p-4 bg-white shadow-lg grid gap-6">
				<div className="grid gap-4">
					<label htmlFor="email">
						Email
						<input required type="email" placeholder="johndoe@example.com" className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500" />
					</label>

					<label htmlFor="password">
						Password
						<input required type="password" placeholder="********" className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500" />
					</label>

					<button className="btn-primary bg-purple-600 hover:bg-purple-700 text-gray-100 p-3 rounded-md mt-3">Login</button>
				</div>
				<div className="flex items-center gap-1">
					<p>Need an account?</p>
					<Link to="/auth/register" className="font-bold text-purple-500">Create one here</Link>
				</div>
			</form>
		</div>
	)
}