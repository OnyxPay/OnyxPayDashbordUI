import {
	cryptoAddress,
	cryptoPrivateKey,
	gasPrice,
	reverseAddressHex,
} from "../../utils/blockchain";
import { isEmpty } from "lodash";
import { TransactionBuilder, Parameter, ParameterType, utils } from "ontology-ts-sdk";
import { getBcClient } from "../../api/network";
import { unlockWalletAccount } from "../../api/wallet";

export const setAmount = (secret_hash, amount, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		let { contracts /*wallet*/ } = getState();
		const client = getBcClient();
		const gasLimit = 20000;
		const { pk, accountAddress /*publicKey */ } = await unlockWalletAccount();
		const activeAccAdress = cryptoAddress(accountAddress);
		const activeAccPrivateKey = cryptoPrivateKey(pk.key);
		const funcName = "SetAmount";
		const contractAdress =
			!isEmpty(contracts) &&
			contracts["Investments"] &&
			reverseAddressHex(contracts["Investments"]);

		const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);
		const p2 = new Parameter("Amount", ParameterType.Integer, amount);
		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1, p2],
			contractAdress,
			gasPrice,
			gasLimit,
			activeAccAdress
		);
		TransactionBuilder.signTransaction(tx, activeAccPrivateKey);
		await client
			.sendRawTransaction(tx.serialize(), false, true)
			.then(res => {
				console.log(res);
				setSubmitting(false);
				resetForm();
			})
			.catch(er => {
				console.log(er);
				setSubmitting(false);
				resetForm();
			});
	};
};

export const getUnclaimed = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		let { contracts /*wallet */ } = getState();
		const client = getBcClient();
		const gasLimit = 20000;
		const { pk, accountAddress /* publicKey */ } = await unlockWalletAccount();
		const activeAccAdress = cryptoAddress(accountAddress);
		const activeAccPrivateKey = cryptoPrivateKey(pk.key);
		const funcName = "GetUnclaimed";
		const contractAdress =
			!isEmpty(contracts) &&
			contracts["Investments"] &&
			reverseAddressHex(contracts["Investments"]);

		const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);

		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1],
			contractAdress,
			gasPrice,
			gasLimit,
			activeAccAdress
		);
		TransactionBuilder.signTransaction(tx, activeAccPrivateKey);
		try {
			let res = await client.sendRawTransaction(tx.serialize(), true);
			const data = res.Result.Result;
			const balance = parseInt(utils.reverseHex(data), 16);
			console.log("response:", res);
			console.log(balance);
			setSubmitting(false);
			resetForm();
			/*
				if response = 0, user is blocked
				if error, user is not found
			*/
			return balance;
		} catch (e) {
			return null;
		}
	};
};

export const Block = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		let { contracts /*wallet*/ } = getState();
		const client = getBcClient();
		const gasLimit = 20000;
		const { pk, accountAddress /* publicKey*/ } = await unlockWalletAccount();
		const activeAccAdress = cryptoAddress(accountAddress);
		const activeAccPrivateKey = cryptoPrivateKey(pk.key);
		const funcName = "Block";
		const contractAdress =
			!isEmpty(contracts) &&
			contracts["Investments"] &&
			reverseAddressHex(contracts["Investments"]);

		const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);
		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1],
			contractAdress,
			gasPrice,
			gasLimit,
			activeAccAdress
		);
		TransactionBuilder.signTransaction(tx, activeAccPrivateKey);
		await client
			.sendRawTransaction(tx.serialize(), false, true)
			.then(res => {
				console.log(res);
				setSubmitting(false);
				resetForm();
			})
			.catch(er => {
				console.log(er);
				setSubmitting(false);
				resetForm();
			});
	};
};

export const Unblock = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		let { contracts /*wallet*/ } = getState();
		const client = getBcClient();
		const gasLimit = 20000;
		const { pk, accountAddress /*publicKey*/ } = await unlockWalletAccount();
		const activeAccAdress = cryptoAddress(accountAddress);
		const activeAccPrivateKey = cryptoPrivateKey(pk.key);
		const funcName = "Unblock";
		const contractAdress =
			!isEmpty(contracts) &&
			contracts["Investments"] &&
			reverseAddressHex(contracts["Investments"]);

		const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);
		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1],
			contractAdress,
			gasPrice,
			gasLimit,
			activeAccAdress
		);
		TransactionBuilder.signTransaction(tx, activeAccPrivateKey);
		await client
			.sendRawTransaction(tx.serialize(), false, true)
			.then(res => {
				console.log(res);
				setSubmitting(false);
				resetForm();
			})
			.catch(er => {
				console.log(er);
				setSubmitting(false);
				resetForm();
			});
	};
};
