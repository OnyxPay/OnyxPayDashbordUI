import { setWallet, clearWallet } from "./wallet";
import { resolveContractAddress } from "./contracts";
import { setAssetsBalance, setOnyxCashBalance } from "./balance";
import { setExchangeRates } from "./exchangeRates";
import { saveUser, getUserData } from "./user";
import { getUsersData, getUserSettlementData } from "./admin-panel/users/index";
import {
	showWalletUnlockModal,
	hideWalletUnlockModal,
	setUnlockWallet,
	getWalletPassword,
} from "./walletUnlock";
import { signUp, login, confirmEmail, logOut } from "./auth";
import { startLoading, finishLoading } from "./loading";
import { getSettlementsList, add, deleteAccount } from "./settlements";
import { showSessionExpiredModal } from "./session";

export default {
	wallet: { clearWallet, setWallet },
	contracts: { resolveContractAddress },
	balance: { setAssetsBalance, setOnyxCashBalance },
	exchangeRates: { setExchangeRates },
	user: { saveUser, getUserData },
	adminUsers: { getUsersData },
	userSettlementAccountData: { getUserSettlementData },
	walletUnlock: {
		showWalletUnlockModal,
		hideWalletUnlockModal,
		setUnlockWallet,
		getWalletPassword,
	},
	auth: { signUp, login, confirmEmail, logOut },
	settlements: {
		getSettlementsList,
		add,
		deleteAccount,
	},
	loading: {
		startLoading,
		finishLoading,
	},
	session: {
		showSessionExpiredModal,
	},
};
