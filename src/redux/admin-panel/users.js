import { message } from "antd";
import { TransactionBuilder, Parameter, ParameterType, CONST, utils } from "ontology-ts-sdk";
import { gasPrice, cryptoAddress } from "../../utils/blockchain";
import { resolveContractAddress } from "../contracts";

//api
import { getBcClient, getRestClient, handleReqError, getAuthHeaders } from "../../api/network";
import { unlockWalletAccount } from "../../api/wallet";

const client = getRestClient();
const ADMIN_USERS = "ADMIN_USERS";
const ADMIN_BLOCKED_USERS = "ADMIN_BLOCKED_USERS";
const USER_SETTLEMENT_DATA = "USER_SETTLEMENT_DATA";

export const adminUsersReducer = (state, action) => {
	switch (action.type) {
		case ADMIN_USERS:
			return action.payload;
		default:
			return state || null;
	}
};

export const setUserSettlementDataReducer = (state, action) => {
	switch (action.type) {
		case USER_SETTLEMENT_DATA:
			return action.payload;
		default:
			return state || null;
	}
};

export const blockedUsersReducer = (state, action) => {
	switch (action.type) {
		case ADMIN_BLOCKED_USERS:
			return action.payload;
		default:
			return state || null;
	}
};

export const saveBlockedUsers = users => {
	return { type: ADMIN_USERS, payload: users };
};

export const saveUsers = users => {
	return { type: ADMIN_USERS, payload: users };
};

export const getUsersData = params => async dispatch => {
	console.log(1);
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/admin/users", {
			headers: {
				...authHeaders,
			},
			params: {
				...params,
			},
		});
		dispatch(saveUsers(data.items));
		return { adminUsers: data };
	} catch (er) {
		return handleReqError(er);
	}
};

export const saveUserSettlementData = userSettlements => {
	return { type: USER_SETTLEMENT_DATA, payload: userSettlements };
};

export const getUserSettlementData = user_id => async dispatch => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get(`admin/user/${user_id}/settlements`, {
			headers: {
				...authHeaders,
			},
		});
		dispatch(saveUserSettlementData(data.items));
		return { userSettlementData: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};

export const BlockUser = (userAccountAddress, reason, duration) => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const { pk, accountAddress } = await unlockWalletAccount();
			const funcName = "BlockUser";
			const address = await dispatch(resolveContractAddress("OnyxPay"));
			const userAddress = utils.reverseHex(cryptoAddress(userAccountAddress).toHexString());
			if (!address) {
				throw new Error("contract address is not found");
			}

			const p1 = new Parameter("userAddress", ParameterType.ByteArray, userAddress);
			const p2 = new Parameter("reason", ParameterType.Integer, reason);
			const p3 = new Parameter("duration", ParameterType.Integer, duration);

			//make transaction
			const tx = TransactionBuilder.makeInvokeTransaction(
				funcName,
				[p1, p2, p3],
				cryptoAddress(address),
				gasPrice,
				CONST.DEFAULT_GAS_LIMIT,
				accountAddress
			);
			TransactionBuilder.signTransaction(tx, pk);
			try {
				const res = await client.sendRawTransaction(tx.serialize(), false, true);
				console.log(res);
				if (res.Error === 0) {
					message.success("User was successfully blocked");
				}
			} catch (error) {
				console.log(error);
				message.error("Operation is failed", 5);
			}
		} catch (error) {
			if (error.message === "contract address is not found") {
				message.error(error.message);
			}
			console.log(error);
		}
	};
};

export const UnblockUser = userAccountAddress => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const { pk, accountAddress } = await unlockWalletAccount();
			const funcName = "UnblockUser";
			const address = await dispatch(resolveContractAddress("OnyxPay"));
			const userAddress = utils.reverseHex(cryptoAddress(userAccountAddress).toHexString());
			if (!address) {
				throw new Error("contract address is not found");
			}

			const p1 = new Parameter("userAddress", ParameterType.ByteArray, userAddress);

			//make transaction
			const tx = TransactionBuilder.makeInvokeTransaction(
				funcName,
				[p1],
				cryptoAddress(address),
				gasPrice,
				CONST.DEFAULT_GAS_LIMIT,
				accountAddress
			);
			TransactionBuilder.signTransaction(tx, pk);
			try {
				const res = await client.sendRawTransaction(tx.serialize(), false, true);
				console.log(res);
				if (res.Error === 0) {
					message.success("User was successfully unblocked");
				}
			} catch (error) {
				console.log(error);
				message.error("Operation is failed", 5);
			}
		} catch (error) {
			if (error.message === "contract address is not found") {
				message.error(error.message);
			}
			console.log(error);
		}
	};
};

export const IsBlockedUser = userAccountAddress => {
	return async dispatch => {
		const client = getBcClient();

		try {
			const funcName = "IsBlockedUser";
			const address = await dispatch(resolveContractAddress("OnyxPay"));
			const userAddress = utils.reverseHex(cryptoAddress(userAccountAddress).toHexString());
			if (!address) {
				throw new Error("contract address is not found");
			}

			const p1 = new Parameter("userAddress", ParameterType.ByteArray, userAddress);

			//make transaction
			const tx = TransactionBuilder.makeInvokeTransaction(
				funcName,
				[p1],
				cryptoAddress(address),
				gasPrice,
				CONST.DEFAULT_GAS_LIMIT
			);
			try {
				const res = await client.sendRawTransaction(tx.serialize(), true);
				const data = res.Result.Result;
				console.log(res, data);
				if (res.Error === 0) {
					message.success("User was successfully blocked");
				}
				return data;
			} catch (error) {
				console.log(error);
				message.error("Operation is failed", 5);
			}
		} catch (error) {
			if (error.message === "contract address is not found") {
				message.error(error.message);
			}
			console.log(error);
		}
	};
};

export const searchUser = accountAddress => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get(`/admin/users?addr=${accountAddress}`, {
			headers: {
				...authHeaders,
			},
		});
		return { userData: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};

export const BlockedUsersData = () => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get(`/admin/users?status="blocked"`, {
			headers: {
				...authHeaders,
			},
		});
		return { blockedUsersData: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};
