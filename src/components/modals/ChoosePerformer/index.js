import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Select, Form, Button } from "antd";
import { getData as getCountriesData } from "country-list";
import { Formik } from "formik";
import PerformersTable from "./PerformersTable";
import { searchUsers } from "api/users";
import { sendMessage } from "api/operation-messages";
import { choosePerformer } from "api/requests";
import { showNotification } from "components/notification";
import { convertAmountToStr } from "utils/number";
import { handleBcError } from "api/network";
const { Option } = Select;

function convertAsset(assetAmount, assetSymbol, exchangeRates) {
	try {
		const rate = exchangeRates.find(rate => rate.symbol === assetSymbol);
		return (rate.buy / 10 ** 8) * assetAmount;
	} catch (e) {
		return 0;
	}
}

class ChoosePerformer extends Component {
	state = this.getInitialState();

	getInitialState() {
		return {
			loading: false,
			users: null,
			selectedRows: [],
			selectedRowKeys: [],
			pagination: { current: 1, pageSize: 20 },
			country: null,
		};
	}

	componentDidUpdate(prevProps, prevState) {
		const { isModalVisible, isSendingMessage } = this.props;

		if (isModalVisible && prevProps.isModalVisible !== isModalVisible && isSendingMessage) {
			this.fetchUsers();
		}
	}

	handleFormSubmit = async (values, formActions) => {
		const { requestId, isSendingMessage, fetchRequests, openedRequestData } = this.props;
		const { selectedRows } = this.state;

		if (isSendingMessage) {
			const ids = [];
			selectedRows.forEach(row => {
				ids.push(row.user_id);
			});
			const res = await sendMessage(requestId, ids);
			if (!res.error) {
				formActions.resetForm();
				showNotification({
					type: "success",
					msg: "Request is successfully sent to agent/agents",
				});
				fetchRequests();
				this.handleClose();
			}
		} else {
			try {
				const performer = selectedRows[0].receiver;
				await choosePerformer(requestId, performer.wallet_addr);
				formActions.resetForm();
				if (openedRequestData.type === "withdraw") {
					showNotification({
						type: "success",
						msg: "You successfully chosen an agent",
						desc:
							"Next, you should wait until fiat money is coming, and then finalize the request by clicking on the 'Perform' button",
					});
				} else {
					let assetSymbol = openedRequestData.asset;
					const splittedAssetSymbol = openedRequestData.asset.split("");
					if (splittedAssetSymbol[0] === "o") {
						assetSymbol = splittedAssetSymbol.slice(1).join("");
					}

					showNotification({
						type: "success",
						msg: "You successfully chosen an agent",
						desc: `Send ${convertAmountToStr(
							openedRequestData.amount,
							8
						)} FIAT ${assetSymbol} to agent ${performer.first_name} ${
							performer.last_name
						} settlement account or hand over the cash by hand`,
					});
				}

				fetchRequests();
				this.handleClose();
			} catch (e) {
				handleBcError(e);
			} finally {
				formActions.setSubmitting(false);
			}
		}
	};

	handleTableChange = (pagination, filters, sorter) => {
		let sorOrder;
		const { country } = this.state;

		if (sorter.order === "ascend") {
			sorOrder = "asc";
		} else if (sorter.order === "descend") {
			sorOrder = "desc";
		}

		this.setState(
			{
				pagination: {
					...this.state.pagination,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				this.fetchUsers({
					...filters,
					sort_field: sorter.field,
					sort: sorOrder,
					country: country,
				});
			}
		);
	};

	handleSendAllAgents = async () => {
		const { fetchRequests, requestId } = this.props;
		const { country, pagination } = this.state;
		await this.fetchUsers({
			pageSize: pagination.total,
			pageNum: 1,
			country: country,
		});
		const { users } = this.state;
		const ids = [];
		users.items.forEach(user => {
			ids.push(user.user_id);
		});
		const res = await sendMessage(requestId, ids);
		if (!res.error) {
			showNotification({
				type: "success",
				msg: "Request is successfully sent to agent/agents",
			});
			fetchRequests();
			this.handleClose();
		}
	};

	handleCountryChange = (setFieldValue, setSubmitting) => async countryId => {
		await this.fetchUsers({
			country: countryId,
		});
		// reset selected users
		this.setState({ selectedRowKeys: [], selectedRows: [], country: countryId });
		setFieldValue("country", countryId);
	};

	async fetchUsers(opts = {}) {
		const { user, performer, accountAddress, openedRequestData, rates } = this.props;
		const { pagination } = this.state;
		const convertedAmount = convertAsset(openedRequestData.amount, openedRequestData.asset, rates);
		try {
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				role: performer,
				country: user.countryId,
				status: "active",
				consolidated_balance: convertedAmount,
				...opts,
			};

			this.setState({ loading: true });
			const res = await searchUsers(params);
			pagination.total = res.total;
			const performers = res.items.filter(performer => performer.wallet_addr !== accountAddress);
			this.setState({
				loading: false,
				users: { items: performers, total: res.total },
				pagination,
				country: user.countryId,
			});
		} catch (e) {}
	}

	handleClose = () => {
		this.props.hideModal();
		this.setState(this.getInitialState());
	};

	onSelectedRow = (selectedRowKeys, selectedRows) => {
		this.setState({ selectedRowKeys, selectedRows });
	};

	render() {
		const {
			isModalVisible,
			user,
			operationMessages,
			isSendingMessage,
			showUserSettlementsModal,
		} = this.props;
		const { loading, users, selectedRowKeys } = this.state;

		return (
			<Modal
				title={
					isSendingMessage ? "Send request to potential performer/ performers" : "Choose performer"
				}
				visible={isModalVisible}
				onCancel={this.handleClose}
				footer={null}
				destroyOnClose={true}
				className="send-to-agents-modal"
			>
				<Formik
					onSubmit={this.handleFormSubmit}
					initialValues={{ country: user ? user.countryId : "" }}
				>
					{({
						values,
						errors,
						isSubmitting,
						handleChange,
						handleBlur,
						handleSubmit,
						setFieldValue,
						touched,
						setSubmitting,
					}) => {
						return (
							<div>
								<form onSubmit={handleSubmit}>
									{isSendingMessage && (
										<Form.Item
											label="Country"
											validateStatus={errors.country && touched.country ? "error" : ""}
											help={errors.country && touched.country ? errors.country : ""}
										>
											<Select
												showSearch
												name="country"
												placeholder="Select a country"
												optionFilterProp="children"
												value={values.country}
												onChange={this.handleCountryChange(setFieldValue, setSubmitting)}
												filterOption={(input, option) =>
													option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
												disabled={isSubmitting}
												loading={isSubmitting}
											>
												{getCountriesData().map((country, index) => {
													return (
														<Option key={country.code} value={country.code}>
															{country.name}
														</Option>
													);
												})}
											</Select>
										</Form.Item>
									)}

									<PerformersTable
										loading={loading}
										data={isSendingMessage ? users : operationMessages}
										onSelectedRowKeysChange={this.onSelectedRow}
										selectedRowKeys={selectedRowKeys}
										pagination={this.state.pagination}
										onChange={this.handleTableChange}
										isSendingMessage={isSendingMessage}
										showUserSettlementsModal={userId => {
											return showUserSettlementsModal(userId);
										}}
									/>
									<div className="ant-modal-custom-footer">
										<Button key="back" onClick={this.handleClose} style={{ marginRight: 10 }}>
											Cancel
										</Button>
										<Button
											type="primary"
											htmlType="submit"
											disabled={!selectedRowKeys.length || isSubmitting}
											loading={isSubmitting}
										>
											{isSendingMessage ? "Send request" : "Choose"}
										</Button>
										{isSendingMessage ? (
											<Button
												type="primary"
												key="allAgent"
												onClick={() => this.handleSendAllAgents()}
												style={{ marginLeft: 10 }}
												disabled={(users && !users.length) || isSubmitting}
												loading={isSubmitting}
											>
												Send to all agents
											</Button>
										) : null}
									</div>
								</form>
							</div>
						);
					}}
				</Formik>
			</Modal>
		);
	}
}

export default connect(state => {
	return {
		user: state.user,
		accountAddress: state.wallet.defaultAccountAddress,
		rates: state.assets.rates,
	};
})(ChoosePerformer);
