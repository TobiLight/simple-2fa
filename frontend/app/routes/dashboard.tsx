import { ActionFunction, ActionFunctionArgs, json, LoaderFunction, LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Link, Outlet, useLoaderData } from "@remix-run/react"
import { getUser, requireUserSession} from "~/session.server"

export const loader: LoaderFunction = async ({request}: LoaderFunctionArgs) => {
	const user = await getUser(request)

	if (!user)
		return redirect("/auth/login")

	return json({...user}, {status: 200})
}

function DashboardLayout() {
	return (
		<main className='min-h-screen h-full'>
			<header className="p-4 flex items-center justify-end gap-8 font-semibold border-b shadow">
				<Link to="/">Home</Link>
				<Link to="/auth/login" className="">Logout</Link>
			</header>
			<Outlet />
		</main>
	)
}

export default DashboardLayout