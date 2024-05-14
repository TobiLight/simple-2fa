import { Link } from "@remix-run/react";

export default function Index() {
	return (
		<main className="flex flex-col justify-center items-center min-h-screen">
			<h1 className="text-4xl text-center font-bold">Two-Factor Authentication Project (2FA)</h1>
			<div className="buttons flex items-center gap-4 mt-10">
				<Link to="/auth/login" className="btn-primary text-purple-500 hover:bg-purple-200">Login</Link>
				<Link to="/auth/register" className="btn-primary text-gray-100 bg-purple-600">Register</Link>
			</div>
		</main>
	)
}