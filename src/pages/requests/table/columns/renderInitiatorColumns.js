import React from "react";
import { Button, Popconfirm, Tooltip } from "antd";
import { convertAmountToStr } from "utils/number";
import { getLocalTime, getPerformerName, is24hOver, is12hOver } from "utils";
import { h24Mc, operationMessageStatus } from "api/constants";
import Countdown from "components/Countdown";
import { styles } from "../../styles";
import CancelRequest from "../../CancelRequest";
import { aa } from "../../common";
import { renderPerformBtn, isTimeUp } from "../index";

function isAgentAccepted(operationMessages) {
	// check if at least one potential performer is accepted the request
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

function renderCancelBtn(
	record,
	requestsType,
	cancelRequest,
	isComplainActive,
	isCancelRequestActive
) {
	let btn = null;
	if (requestsType === "withdraw") {
		if (record.status === "opened") {
			btn = (
				<CancelRequest
					btnStyle={styles.btn}
					disabled={isComplainActive}
					isActionActive={isCancelRequestActive}
					handleCancel={e => {
						return cancelRequest(record.request_id);
					}}
				/>
			);
		}
	} else {
		if (
			record.status === "opened" ||
			(record.status === "choose" && !isTimeUp(record.choose_timestamp, h24Mc))
		) {
			btn = (
				<CancelRequest
					btnStyle={styles.btn}
					disabled={isComplainActive}
					isActionActive={isCancelRequestActive}
					handleCancel={e => {
						return cancelRequest(record.request_id);
					}}
				/>
			);
		}
	}
	return btn;
}

export default function renderInitiatorColumns({
	activeRequestId,
	activeAction,
	modals,
	fetchData,
	showModal,
	handleComplain,
	requestsStatus, // active | closed
	requestsType, // deposit | withdraw | depositOnyxCash
	showUserSettlementsModal,
	performRequest, // for withdraw
	cancelRequest,
}) {
	if (requestsStatus === "active") {
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
					return record.trx_timestamp ? getLocalTime(record.trx_timestamp) : "n/a";
				},
			},
			{
				title: "Performer",
				render: (text, record, index) => {
					return record.taker_addr && record.taker
						? getPerformerName(record.taker_addr, record.taker)
						: "n/a";
				},
			},
			{
				title: "Settl. acc",
				render: (text, record, index) => {
					return record.taker ? (
						<Tooltip title="See settlement accounts">
							<Button
								shape="round"
								icon="account-book"
								onClick={e => showUserSettlementsModal(record.taker.id)}
							/>
						</Tooltip>
					) : (
						"n/a"
					);
				},
			},
			{
				title: "Countdown",
				render: (text, record, index) => {
					return record.taker_addr && record.choose_timestamp && record.status !== "complained" ? (
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
						record.request_id === activeRequestId && activeAction === aa.complain;

					const isPerformActive =
						record.request_id === activeRequestId && activeAction === aa.perform;

					const isCancelRequestActive =
						record.request_id === activeRequestId && activeAction === aa.cancel;

					return (
						<>
							{/* Send to agents (performers) */}
							{record.status === "opened" &&
								record.operation_messages &&
								!record.operation_messages.length && (
									<Button
										style={styles.btn}
										disabled={isCancelRequestActive}
										onClick={showModal(modals.SEND_REQ_TO_AGENT, {
											requestId: record.id,
											isSendingMessage: true,
											openedRequestData: record,
										})}
									>
										Send to agents
									</Button>
								)}

							{/* Cancel request */}
							{renderCancelBtn(
								record,
								requestsType,
								cancelRequest,
								isComplainActive,
								isCancelRequestActive
							)}

							{/* Choose agent (performer) */}
							{record.operation_messages &&
								isAgentAccepted(record.operation_messages) &&
								record.status === "opened" && (
									<Button
										style={styles.btn}
										onClick={showModal(modals.SEND_REQ_TO_AGENT, {
											requestId: record.request_id,
											isSendingMessage: false,
											openedRequestData: record,
											operationMessages: record.operation_messages.filter(
												msg => msg.status_code === operationMessageStatus.accepted
											),
										})}
									>
										Choose agent
									</Button>
								)}

							{/* Complain on request */}
							{record.taker_addr &&
								record.choose_timestamp &&
								record.status !== "complained" &&
								!is24hOver(record.choose_timestamp) &&
								renderComplainButton(record, handleComplain, isComplainActive)}

							{/* Perform withdraw request */}
							{requestsType === "withdraw" &&
								renderPerformBtn(record, performRequest, null, requestsType, isPerformActive)}
						</>
					);
				},
			},
		];
	} else {
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
					return record.taker_addr && record.taker
						? getPerformerName(record.taker_addr, record.taker)
						: "n/a";
				},
			},
		];
	}
}
