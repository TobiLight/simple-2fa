import { Link, Outlet } from "@remix-run/react"

function OTPLayout() {
	return (
		<main className="min-h-screen h-full bg-purple-500">
			<Outlet />
			<footer className="relative text-white bottom-0 w-full text-center flex items-center justify-center py-2 border-t text-sm">
				<p className="text-lg font-sembiold font-semibold tracking-wider">Made with love</p>
			</footer>
		</main>
	)
}

export default OTPLayout