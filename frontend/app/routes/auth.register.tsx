import { ActionFunction, ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";

type ActionError = {
	detail: string
	errors: Array<{
		field: string
		message: string
	}>
}

type ActionSuccess = {
	email: string,
	first_name: string,
	last_name: string,
	phone_no: string,
	id: string,
	created_at: string,
	// updated_at: "2024-05-10T17:15:41.959Z",
	is_2fa_enabled: Boolean,
	auth_2fa_type: string
}

export async function action<ActionFunction>({ request }: ActionFunctionArgs) {
	const form = await request.formData()

	let firstName = form.get('first_name') as string || null

	let lastName = form.get('last_name') as string || null

	let email = form.get("email") as string

	let password = form.get("password") as string

	let phone_no = form.get("phone_no") as string

	let enable2fa = form.get("enable_2fa") as string

	let authenticationType = form.get("authentication_type") as string

	console.log("enable2fa", enable2fa)


	try {
		const formRequest = await fetch("http://localhost:8000/auth/register", {
			method: "POST",
			body: JSON.stringify({
				"first_name": firstName,
				"last_name": lastName,
				"email": email,
				"password": password,
				"phone_no": phone_no,
				"enable_2fa": enable2fa.toLocaleLowerCase() === 'yes' ? true : false,
				"authentication_type": authenticationType
			}),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		})

		if (formRequest.status !== 200) {
			let error = await formRequest.json() as ActionError

			throw error
		}

		const data = await formRequest.json() as ActionSuccess

		return json({ ...data }, { status: 201 })
	} catch (err: any) {
		let error = err as ActionError

		return json({ ...error }, { status: 400 })
	}
}

export default function Register() {
	const data = useActionData() as ActionError & ActionSuccess

	const [errors, setErrors] = useState<ActionError>()

	const [formError, setFormError] = useState<Record<string, any>>()


	useEffect(() => {
		if (data && data.detail) {
			for (let { field, message } of data.errors) {
				setFormError(prev => ({
					...prev,
					[field]: message
				}))
			}
		}
	}, [data])

	console.log(formError)

	return (
		<div className="min-h-[inherit] py-20 flex flex-col justify-center items-center bg-gray-100">
			<h1 className="text-center font-semibold text-4xl pb-12">Register</h1>
			<Form method="post" className="w-10/12 mx-auto sm:w-3/4 md:w-2/4 lg:w-2/4 rounded-md p-4 bg-white shadow-lg grid gap-6">
				<div className="grid gap-4">
					<div className="grid grid-cols-2 gap-8 items-center">
						<label htmlFor="first_name">
							First name
							<input type="text" name="first_name" placeholder="John" className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500" />
							{formError && <p className="text-red-500 text-sm">{formError.first_name}</p>}
						</label>

						<label htmlFor="last_name">
							Last name
							<input type="text" name="last_name" placeholder="Doe" className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500" />
							{formError && <p className="text-red-500 text-sm">{formError.last_name}</p>}
						</label>
					</div>

					<label htmlFor="email">
						Email
						<input required name="email" type="email" placeholder="johndoe@example.com" className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500" />
						{formError && <p className="text-red-500 text-sm">{formError.email}</p>}
					</label>

					<label htmlFor="password">
						Password
						<input required name="password" type="password" placeholder="********" className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500" />
						{formError && <p className="text-red-500 text-sm">{formError.password}</p>}
					</label>

					<label htmlFor="phone">
						Phone No
						<input required type="tel" name="phone_no" placeholder="+2349000000009" className="px-4 py-2 rounded w-full shadow-inner border focus:outline-purple-500 bg-gray" />
					</label>
					<div className="grid lg:grid-cols-2 gap-8 items-center">
						<label htmlFor="enable_2fa" className="grid">
							Enable 2FA
							<select name="enable_2fa" id="enable-2fa" className="p-2 border w-[content] focus:outline-purple-500">
								<option value="">Choose an option</option>
								<option value="yes">Yes</option>
								<option value="no">No</option>
							</select>
						</label>
						<label htmlFor="authentication_type" className="grid">
							2FA Authentication Type
							<select name="authentication-type" id="authentication-type" className="p-2 border w-[content] focus:outline-purple-500">
								<option value="Google-Authenticator">Google Authenticator</option>
								<option value="SMS">SMS</option>
							</select>
						</label>
					</div>

					<button type="submit" className="btn-primary bg-purple-600 hover:bg-purple-700 text-gray-100 p-3 rounded-md mt-8">Create account</button>
				</div>
				<div className="flex items-center gap-1">
					<p>Have an account?</p>
					<Link to="/auth/login" className="font-bold text-purple-500">Login</Link>
				</div>
			</Form>
		</div>
	)
}