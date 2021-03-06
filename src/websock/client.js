import { wssBackEnd, wsEvents } from "../api/constants";
import io from "socket.io-client";
import { getStore } from "../store";

let socket;
const wsClientConnect = walletAddress => {
	socket = io.connect(wssBackEnd, {
		path: "/wsapp/",
		query: { walletAddress: walletAddress },
	});
	Object.values(wsEvents).forEach(type =>
		socket.on(type, payload => {
			getStore().dispatch({ type: type, payload: payload });
		})
	);
};
const wsClientDisconnect = () => {
	if (socket) {
		socket.close();
	}
};
let currentWalletAddr;
export const wsClientRun = () => {
	getStore().subscribe(() => {
		let state = getStore().getState();
		if (state.auth && state.auth.OnyxAddr !== currentWalletAddr) {
			currentWalletAddr = state.auth.OnyxAddr;
			wsClientConnect(currentWalletAddr);
		} else if (!state.auth && currentWalletAddr) {
			wsClientDisconnect();
			currentWalletAddr = undefined;
		}
	});
};
