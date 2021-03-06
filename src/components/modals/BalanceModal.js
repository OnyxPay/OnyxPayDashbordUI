import React from "react";
import { Modal, Table, Typography } from "antd";
import { roles } from "../../api/constants";
const { Title, Text } = Typography;

function BalanceModal({ isModalVisible, hideModal, balance, role, RewardsBalance }) {
	let columns = [];
	if (role === roles.c) {
		columns = [
			{ title: "Asset", dataIndex: "symbol" },
			{ title: "Amount", dataIndex: "amount" },
			{ title: "USD equivalent", dataIndex: "assetConverted" },
		];
	} else {
		columns = [
			{ title: "Asset", dataIndex: "symbol" },
			{ title: "Amount", dataIndex: "amount" },
			{ title: "OnyxCash equivalent", dataIndex: "assetConverted" },
		];
	}

	return (
		<Modal
			title={RewardsBalance ? "Total rewards by asset:" : "Detailed balance"}
			visible={isModalVisible}
			onCancel={hideModal}
			footer={null}
			className="detailed-balance-modal"
		>
			{(role === roles.a || role === roles.sa) && balance.onyxCash && (
				<Title level={4}>
					OnyxCash: <Text>{balance.onyxCash}</Text>
				</Title>
			)}

			<Table
				columns={columns}
				dataSource={balance.assets}
				bordered
				pagination={false}
				className="ovf-auto"
			/>
		</Modal>
	);
}

export default BalanceModal;
