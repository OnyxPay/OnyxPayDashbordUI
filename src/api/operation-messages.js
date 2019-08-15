import { getRestClient, handleReqError, getAuthHeaders } from "./network";
const client = getRestClient();

export async function sendMessage(requestId, receivers = []) {
	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.post(
			`operation-request/${requestId}/messages`,
			{ receivers },
			{
				headers: {
					...authHeaders,
				},
			}
		);
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}

export async function hideMessage(requestId) {
	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.put(`operation-message/${requestId}/hide`, null, {
			headers: {
				...authHeaders,
			},
		});
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}

export async function getMessages(params, requestType, fetchActive) {
	let requestStatus = "active-requests";
	if (!fetchActive) {
		requestStatus = "close-requests";
	}

	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get(`operation-messages/${requestType}/${requestStatus}`, {
			headers: {
				...authHeaders,
			},
			params,
		});
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}

export async function getMessagesForActiveRequests(params, requestType = "deposit") {
	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get(`operation-messages/${requestType}/active-requests`, {
			headers: {
				...authHeaders,
			},
			params,
		});
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}

export async function getMessagesForClosedRequests(params, requestType = "deposit") {
	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get(`operation-messages/${requestType}/close-requests`, {
			headers: {
				...authHeaders,
			},
			params,
		});
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}

export async function sendSettlementAccountsData(userId, receivers = []) {
	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.post(
			`admin/user/${userId}/send-message`,
			{ receivers },
			{
				headers: {
					...authHeaders,
				},
			}
		);
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}
