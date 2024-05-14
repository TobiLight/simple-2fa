import { Link, Outlet } from "@remix-run/react"

function DashboardLayout() {
	return (
		<main className='min-h-screen h-full'>
			<header className="p-4 flex items-center justify-end gap-8 font-semibold border-b shadow">
				<Link to="/">Home</Link>
				<button className="">Logout</button>
			</header>
			<Outlet />
		</main>
	)
}

export default DashboardLayout