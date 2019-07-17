import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { walletReducer } from "./wallet";
import { contractsReducer } from "./contracts";
import { balanceReducer } from "./balance";
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
import { activeDepositRequestsReducer } from "./requests/assets/activeDeposit";
import { activeWithdrawRequestsReducer } from "./requests/assets/activeWithdraw";
import { closedDepositRequestsReducer } from "./requests/assets/closedDeposit";
import { closedWithdrawRequestsReducer } from "./requests/assets/closedWithdraw";

export default history =>
	combineReducers({
		router: connectRouter(history),
		user: userReducer,
		upgradeRequest: upgradeReducer,
		wallet: walletReducer,
		walletUnlock: walletUnlockReducer,
		contracts: contractsReducer,
		balance: balanceReducer,
		auth: authReducer,
		settlements: settlementsReducer,
		loading: loaderReducer,
		session: sessionReducer,
		adminUsers: adminUsersReducer,
		userSettlement: setUserSettlementDataReducer,
		assets: assetsReducer,
		globalLoading: loadingReducer,
		activeDepositRequests: activeDepositRequestsReducer,
		activeWithdrawRequests: activeWithdrawRequestsReducer,
		closedDepositRequests: closedDepositRequestsReducer,
		closedWithdrawRequests: closedWithdrawRequestsReducer,
	});
