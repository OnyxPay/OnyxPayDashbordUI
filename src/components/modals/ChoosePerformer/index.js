import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Select, Form, Button } from "antd";
import { getData as getCountriesData } from "country-list";
import { Formik } from "formik";
import PerformersTable from "./PerformersTable";
import { searchUsers } from "api/users";
import { sendMessage } from "api/operation-messages";
import { chooseAgent } from "api/requests";
import { TimeoutError } from "promise-timeout";
import { showNotification, showTimeoutNotification, showBcError } from "components/notification";

const { Option } = Select;

class SendToAgent extends Component {
	state = this.getInitialState();

	getInitialState() {
		return {
			loading: false,
			users: null,
			selectedRows: [],
			selectedRowKeys: [],
			pagination: { current: 1, pageSize: 20 },
		};
	}

	componentDidUpdate(prevProps, prevState) {
		const { isModalVisible, isSendingMessage } = this.props;

		if (isModalVisible && prevProps.isModalVisible !== isModalVisible && isSendingMessage) {
			this.fetchUsers();
		}
	}

	handleFormSubmit = async (values, formActions) => {
		const { requestId, isSendingMessage, fetchRequests } = this.props;
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
				const agentAddress = selectedRows[0].receiver.wallet_addr;
				await chooseAgent(requestId, agentAddress);
				formActions.resetForm();
				showNotification({
					type: "success",
					msg: "You successfully chosen an agent",
				});
				fetchRequests();
				this.handleClose();
			} catch (e) {
				if (e instanceof TimeoutError) {
					showTimeoutNotification();
				} else {
					showBcError(e.message);
				}
			} finally {
				formActions.setSubmitting(false);
			}
		}
	};

	handleTableChange = (pagination, filters, sorter) => {
		let sorOrder;

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
				});
			}
		);
	};

	handleCountryChange = (setFieldValue, setSubmitting) => async countryId => {
		await this.fetchUsers({
			country: countryId,
		});
		// reset selected users
		this.setState({ selectedRowKeys: [], selectedRows: [] });
		setFieldValue("country", countryId);
	};

	async fetchUsers(opts = {}) {
		try {
			const { pagination } = this.state;
			const { user } = this.props;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				role: "agent",
				country: user.countryId,
				...opts,
			};

			this.setState({ loading: true });
			const res = await searchUsers(params);
			pagination.total = res.total;
			this.setState({ loading: false, users: res, pagination });
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
				title="Send deposit request"
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
											Send request
										</Button>
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
	};
})(SendToAgent);