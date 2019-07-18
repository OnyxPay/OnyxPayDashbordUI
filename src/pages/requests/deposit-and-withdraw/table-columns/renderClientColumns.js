import React from "react";
import { Button, Popconfirm } from "antd";
import { convertAmountToStr } from "utils/number";
import { getLocalTime, getPerformerName, is24hOver, is12hOver } from "utils";
import { h24Mc, operationMessageStatus } from "api/constants";
import Countdown from "../../Countdown";
import { styles } from "../../styles";
import CancelRequest from "../../CancelRequest";

function isAgentAccepted(operationMessages) {
	// check if at least one agent is accepted the request
	return operationMessages.some(mg => mg.status_code === operationMessageStatus.accepted);
}

function renderComplainButton(record, handleComplain, isComplainActive) {
	let button;
	if (!is12hOver(record.choose_timestamp)) {
		button = (
			<Button
				style={styles.btn}
				type="danger"
				onClick={() => handleComplain(record.request_id, false)} // can't complain
			>
				Complain
			</Button>
		);
	} else {
		if (isComplainActive) {
			button = (
				<Button
					type="danger"
					style={styles.btn}
					loading={isComplainActive}
					disabled={isComplainActive}
				>
					Complain
				</Button>
			);
		} else {
			button = (
				<Popconfirm
					title="Sure to complain?"
					cancelText="No"
					onConfirm={() => handleComplain(record.request_id, true)}
				>
					<Button
						type="danger"
						style={styles.btn}
						loading={isComplainActive}
						disabled={isComplainActive}
					>
						Complain
					</Button>
				</Popconfirm>
			);
		}
	}
	return button;
}

export default function renderClientColumns({
	activeRequestId,
	activeAction,
	modals,
	fetchData,
	showModal,
	handleComplain,
	requestsStatus = "active", // active | closed
	requestsType = "depositOrWithdraw", // deposit | withdraw | depositOnyxCash
}) {
	if (requestsStatus === "active") {
		if (requestsType === "depositOrWithdraw") {
			return [
				{
					title: "Id",
					dataIndex: "id",
				},
				{
					title: "Asset",
					dataIndex: "asset",
				},
				{
					title: "Amount",
					render: (text, record, index) => {
						return convertAmountToStr(record.amount, 8);
					},
				},
				{
					title: "Status",
					dataIndex: "status",
				},
				{
					title: "Created",
					render: (text, record, index) => {
						return getLocalTime(record.trx_timestamp);
					},
				},
				{
					title: "Performer",
					render: (text, record, index) => {
						return record.taker_addr ? getPerformerName(record) : "n/a";
					},
				},
				{
					title: "Countdown",
					render: (text, record, index) => {
						return record.taker_addr &&
							record.choose_timestamp &&
							record.status !== "complained" ? (
							<Countdown date={new Date(record.choose_timestamp).getTime() + h24Mc} />
						) : (
							"n/a"
						);
					},
				},
				{
					title: "Actions",
					render: (text, record, index) => {
						const isComplainActive =
							record.request_id === activeRequestId && activeAction === "complain";

						return (
							<>
								{record.status === "opened" && !record.operation_messages.length && (
									<Button
										style={styles.btn}
										onClick={showModal(modals.SEND_REQ_TO_AGENT, {
											requestId: record.id,
											isSendingMessage: true,
										})}
									>
										Send to agents
									</Button>
								)}

								{(record.status === "opened" || record.status === "choose") && (
									<CancelRequest
										btnStyle={styles.btn}
										requestId={record.request_id}
										fetchRequests={fetchData}
										disabled={isComplainActive}
									/>
								)}
								{isAgentAccepted(record.operation_messages) && record.status === "opened" && (
									<Button
										style={styles.btn}
										onClick={showModal(modals.SEND_REQ_TO_AGENT, {
											requestId: record.request_id,
											isSendingMessage: false,
											operationMessages: record.operation_messages.filter(
												msg => msg.status_code === operationMessageStatus.accepted
											),
										})}
									>
										Choose agent
									</Button>
								)}
								{record.taker_addr &&
									record.choose_timestamp &&
									record.status !== "complained" &&
									!is24hOver(record.choose_timestamp) &&
									renderComplainButton(record, handleComplain, isComplainActive)}
							</>
						);
					},
				},
			];
		}
	} else {
		if (requestsType === "depositOrWithdraw") {
			return [
				{
					title: "Id",
					dataIndex: "id",
				},
				{
					title: "Asset",
					dataIndex: "asset",
				},
				{
					title: "Amount",
					render: (text, record, index) => {
						return convertAmountToStr(record.amount, 8);
					},
				},
				{
					title: "Status",
					dataIndex: "status",
				},
				{
					title: "Created",
					render: (text, record, index) => {
						return new Date(record.trx_timestamp).toLocaleString();
					},
				},
				{
					title: "Performer",
					render: (text, record, index) => {
						return record.taker_addr ? getPerformerName(record) : "n/a";
					},
				},
			];
		}
	}
}