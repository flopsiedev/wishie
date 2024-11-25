import { redirect } from "@sveltejs/kit";
import { validateSessionToken } from "$lib/server/session";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const token = event.cookies.get("session");
	
	if (!token) {
		return {
			authenticated: false,
			session: null
		};
	}

	const { session, user } = await validateSessionToken(token);
	
	if (!session || !user) {
		return {
			authenticated: false,
			session: null
		};
	}

	return {
		authenticated: true,
		user,
		session
	};
};