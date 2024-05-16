import { Link, Outlet } from "@remix-run/react"
import BTMLogo from "/images/btm_logo.png?url"
import ShellLogo from "/images/shell_logo.png?url"

function AuthLayout() {
	return (
		<main className='min-h-screen h-full'>
			<header className="p-4 flex items-center justify-center font-semibold">
				<Link to="/">Home</Link>
			</header>
			<Outlet />
			<footer className="relative bottom-0 w-full text-center flex items-center justify-center py-2 border-t text-sm">
				<p className="text-lg font-sembiold font-semibold tracking-wider">Made with love</p>
			</footer>
		</main>
	)
}

export default AuthLayout