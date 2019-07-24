import { getRestClient, handleReqError, getAuthHeaders } from "./network";

export const getExchangeHistory = async params => {
	const client = getRestClient();
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/exchanges", {
			headers: {
				...authHeaders,
			},
			params: {
				...params,
			},
		});
		return data;
	} catch (er) {
		return handleReqError(er);
	}
};
