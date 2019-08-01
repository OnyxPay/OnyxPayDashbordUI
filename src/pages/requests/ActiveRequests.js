import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table } from "antd";
import queryString from "query-string";
import { push } from "connected-react-router";
import {
	acceptRequest,
	performRequest,
	cancelAcceptedRequest,
	complain,
	cancelRequest,
} from "api/requests";
import { hideMessage } from "api/operation-messages";
import ChoosePerformerModal from "components/modals/ChoosePerformer";
import { roles } from "api/constants";
import { showNotification } from "components/notification";
import { createLoadingSelector } from "selectors/loading";
import UserSettlementsModal from "components/modals/UserSettlementsModal";
import renderInitiatorColumns from "./table/columns/renderInitiatorColumns";
import renderPerformerColumns from "./table/columns/renderPerformerColumns";
import { renderPageTitle, aa, parseRequestType, isThisAgentInitiator } from "./common";
import { handleTableChange, getColumnSearchProps } from "./table";
import { getOpRequests, GET_OPERATION_REQUESTS } from "redux/requests";
import { handleBcError } from "api/network";
import Actions from "redux/actions";

const modals = {
	SEND_REQ_TO_AGENT: "SEND_REQ_TO_AGENT",
	USER_SETTLEMENT_ACCOUNTS: "USER_SETTLEMENT_ACCOUNTS",
};

class ActiveRequests extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pagination: { current: 1, pageSize: 20 },
			[modals.SEND_REQ_TO_AGENT]: false,
			[modals.USER_SETTLEMENT_ACCOUNTS]: false,
			requestId: null,
			isSendingMessage: false,
			operationMessages: [],
			activeAction: "",
			idParsedFromURL: "",
			openedRequestData: {}, // to choose performer
		};
		this.setState = this.setState.bind(this);
		this.searchInput = "";
	}

	componentDidMount() {
		const { location, getExchangeRates } = this.props;
		getExchangeRates();
		const values = queryString.parse(location.search);
		if (values.id) {
			this.setState({ idParsedFromURL: values.id });
			this.fetch({ requestId: values.id });
		} else {
			this.fetch();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const { location, getExchangeRates } = this.props;
		if (location.pathname !== prevProps.location.pathname) {
			this.fetch();
			getExchangeRates();
		}
	}

	hideModal = type => () => {
		this.setState({ [type]: false });
	};

	showModal = (type, options) => () => {
		if (options) {
			this.setState({ [type]: true, ...options });
		} else {
			this.setState({ [type]: true });
		}
	};

	fetch = (opts = {}) => {
		const { pagination } = this.state;
		const { user, location, getOpRequests } = this.props;
		const params = {
			pageSize: pagination.pageSize,
			pageNum: pagination.current,
			...opts,
		};
		const requestType = parseRequestType(location);

		if (user.role === roles.c) {
			params.type = requestType;
			params.status = "pending,opened,choose,complained";
			params.user = "maker";
			// deposit | withdraw
			getOpRequests({ params, requestType, fetchActive: true, isInitiator: true });
		} else {
			let isAgentInitiator = isThisAgentInitiator(user.role, location);
			if (isAgentInitiator) {
				params.type = requestType;
				params.status = "pending,opened,choose,complained";
				params.user = "maker";
				getOpRequests({ params, requestType, fetchActive: true, isInitiator: true });
			} else {
				getOpRequests({ params, requestType, fetchActive: true, isInitiator: false });
			}
		}
	};

	acceptRequest = async (requestId, requestAmount, requestAsset) => {
		// agent accepts deposit or withdraw request
		try {
			const { balanceAssets, balanceOnyxCash } = this.props;
			this.setState({ requestId, activeAction: aa.accept });

			const allow = balanceAssets.some(
				balance =>
					(balance.symbol === requestAsset && requestAmount <= balance.amount) ||
					(requestAsset === "OnyxCash" && requestAmount <= balanceOnyxCash)
			);
			if (!allow) {
				showNotification({
					type: "error",
					msg: "Request cannot be accepted. Insufficient amount of asset.",
				});
				return false;
			}
			await acceptRequest(requestId);
			showNotification({
				type: "success",
				msg: "You have accepted the request",
			});
			this.fetch();
		} catch (e) {
			handleBcError(e);
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	hideRequest = async requestId => {
		// agent hides request
		try {
			await hideMessage(requestId);
			this.fetch();
		} catch (e) {
			showNotification({
				type: "error",
				msg: e.message,
			});
		}
	};

	performRequest = async requestId => {
		// agent performs deposit and client withdraw request
		try {
			this.setState({ requestId, activeAction: aa.perform });
			await performRequest(requestId);
			showNotification({
				type: "success",
				msg: "You have performed the request",
			});
			this.fetch();
		} catch (e) {
			handleBcError(e);
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	cancelAcceptedRequest = async requestId => {
		// agent cancels request
		try {
			this.setState({ requestId, activeAction: aa.cancelAccepted });
			await cancelAcceptedRequest(requestId);
			showNotification({
				type: "success",
				msg: "You have cancelled the request, the assets will be sent back on your address.",
			});
			this.fetch();
		} catch (e) {
			handleBcError(e);
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	handleComplain = async (requestId, canComplain = false) => {
		// client complains
		if (canComplain) {
			try {
				this.setState({ requestId, activeAction: aa.complain });
				await complain(requestId);
				showNotification({
					type: "success",
					msg: "You have complained on the request",
				});
				this.fetch();
			} catch (e) {
				handleBcError(e);
			} finally {
				this.setState({ requestId: null, activeAction: "" });
			}
		} else {
			showNotification({
				type: "info",
				msg: "A complaint can only be filed 12 hours after the selection of the performer",
			});
		}
	};

	cancelRequest = async requestId => {
		try {
			this.setState({ requestId, activeAction: aa.cancel });
			await cancelRequest(requestId);
			this.fetch();
			showNotification({
				type: "success",
				msg: "You have canceled the request",
			});
		} catch (e) {
			handleBcError(e);
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	render() {
		const { user, walletAddress, location, data, isFetching } = this.props;
		const { requestId, activeAction, idParsedFromURL, openedRequestData } = this.state;
		let columns = [];
		let isAgentInitiator = isThisAgentInitiator(user.role, location);

		if (user.role === roles.c || isAgentInitiator) {
			columns = renderInitiatorColumns({
				activeRequestId: requestId,
				activeAction,
				modals,
				fetchData: this.fetch,
				showModal: this.showModal,
				handleComplain: this.handleComplain,
				requestsType: parseRequestType(location),
				requestsStatus: "active",
				showUserSettlementsModal: settlementsId =>
					this.showModal(modals.USER_SETTLEMENT_ACCOUNTS, {
						settlementsId,
					})(),
				performRequest: this.performRequest,
				cancelRequest: this.cancelRequest,
			});
		} else {
			columns = renderPerformerColumns({
				activeRequestId: requestId,
				activeAction,
				walletAddress,
				hideRequest: this.hideRequest,
				acceptRequest: this.acceptRequest,
				cancelAcceptedRequest: this.cancelAcceptedRequest,
				performRequest: this.performRequest,
				getColumnSearchProps: getColumnSearchProps(this.setState, this.searchInput),
				defaultFilterValue: idParsedFromURL,
				requestsType: parseRequestType(location),
				requestsStatus: "active",
			});
		}

		return (
			<>
				{renderPageTitle({
					requestType: parseRequestType(location),
					isRequestClosed: false,
					isUserInitiator: user.role === roles.c || isAgentInitiator,
				})}
				<Table
					columns={columns}
					rowKey={record => record.id}
					dataSource={data.items}
					pagination={{ ...this.state.pagination, total: data.total }}
					loading={isFetching}
					onChange={handleTableChange({
						fetchData: this.fetch,
						paginationState: this.state.pagination,
						setState: this.setState,
					})}
					className="ovf-auto tbody-white"
				/>
				<ChoosePerformerModal
					isModalVisible={this.state.SEND_REQ_TO_AGENT}
					hideModal={this.hideModal(modals.SEND_REQ_TO_AGENT)}
					requestId={this.state.requestId}
					isSendingMessage={this.state.isSendingMessage}
					operationMessages={this.state.operationMessages}
					fetchRequests={this.fetch}
					showUserSettlementsModal={settlementsId =>
						this.showModal(modals.USER_SETTLEMENT_ACCOUNTS, {
							settlementsId,
						})()
					}
					performer={user.role === roles.c ? roles.a : roles.sa}
					openedRequestData={openedRequestData}
				/>
				<UserSettlementsModal
					isModalVisible={this.state.USER_SETTLEMENT_ACCOUNTS}
					hideModal={this.hideModal(modals.USER_SETTLEMENT_ACCOUNTS)}
					userId={this.state.settlementsId}
				/>
			</>
		);
	}
}

const loadingSelector = createLoadingSelector([GET_OPERATION_REQUESTS]);

function mapStateToProps(state, ownProps) {
	return {
		user: state.user,
		walletAddress: state.wallet.defaultAccountAddress,
		data: state.opRequests,
		isFetching: loadingSelector(state),
		balanceAssets: state.balance.assets,
		balanceOnyxCash: state.balance.onyxCash,
	};
}

ActiveRequests = compose(
	withRouter,
	connect(
		mapStateToProps,
		{ push, getOpRequests, getExchangeRates: Actions.assets.getExchangeRates }
	)
)(ActiveRequests);

export default ActiveRequests;
