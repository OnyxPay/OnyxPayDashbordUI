import { getRestClient, getAuthHeaders, handleReqError } from "./network";

const restClient = getRestClient();

export async function getTelegramBotLink() {
	const authHeaders = getAuthHeaders();
	const form = await restClient.put("/profile/phone", null, { headers: { ...authHeaders } });
	return form;
}

export async function confirmEmail(token) {
	const authHeaders = getAuthHeaders();
	const form = await restClient.put("/profile/confirm-email", token, {
		headers: { ...authHeaders },
	});
	return form;
}

export async function changeProfile(data) {
	const authHeaders = getAuthHeaders();
	const form = await restClient.put("/profile", data, { headers: { ...authHeaders } });
	return form;
}

export async function deleteUserAccount() {
	const authHeaders = getAuthHeaders();
	try {
		const res = await restClient.delete("profile", {
			headers: {
				...authHeaders,
			},
		});
		return res.data;
	} catch (error) {
		return handleReqError(error);
	}
}
