import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { walletReducer } from "./wallet";
import { contractsReducer } from "./contracts";
import { balanceReducer } from "./balance";
import { rewardsReducer } from "./rewards";
import { userReducer } from "./user";
import { upgradeReducer } from "./upgradeRequest";
import { walletUnlockReducer } from "./walletUnlock";
import { authReducer } from "./auth";
import { settlementsReducer } from "./settlements";
import { loaderReducer } from "./loading";
import { sessionReducer } from "./session";
import { adminUsersReducer, setUserSettlementDataReducer } from "./admin-panel/users";
import { assetsReducer } from "./assets";
import { loadingReducer } from "./globalLoading";
import { opRequestsReducer } from "./requests";
import { opMessagesReducer } from "./messages";
export default history =>
	combineReducers({
		router: connectRouter(history),
		user: userReducer,
		upgradeRequest: upgradeReducer,
		wallet: walletReducer,
		walletUnlock: walletUnlockReducer,
		contracts: contractsReducer,
		balance: balanceReducer,
		rewards: rewardsReducer,
		auth: authReducer,
		settlements: settlementsReducer,
		loading: loaderReducer,
		session: sessionReducer,
		adminUsers: adminUsersReducer,
		userSettlement: setUserSettlementDataReducer,
		assets: assetsReducer,
		globalLoading: loadingReducer,
		opRequests: opRequestsReducer,
		opMessages: opMessagesReducer,
	});
