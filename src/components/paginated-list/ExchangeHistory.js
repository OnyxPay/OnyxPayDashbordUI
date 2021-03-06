import React from "react";
import { getExchangeHistory } from "api/transactions-history";
import { convertAmountToStr } from "utils/number";
import PaginatedTable from "components/paginated-list/PaginatedTable";

const exchangeHistoryColumns = [
	{
		title: "Date",
		dataIndex: "timestamp",
		key: "date",
		render: timestamp => (timestamp ? new Date(timestamp).toLocaleString() : "n/a"),
	},
	{
		title: "Sold asset",
		dataIndex: "",
		key: "soldAsset",
		render: record =>
			(record.amountToSell ? convertAmountToStr(record.amountToSell, 8) : "n/a") +
			" " +
			(record.assetToSell ? record.assetToSell : "n/a"),
	},
	{
		title: "Bought Asset",
		dataIndex: "",
		key: "boughtAsset",
		render: record =>
			(record.amountToBuy ? convertAmountToStr(record.amountToBuy, 8) : "n/a") +
			" " +
			(record.assetToBuy ? record.assetToBuy : "n/a"),
	},
	{
		title: "Status",
		dataIndex: "status",
		key: "status",
		render: status => (status ? status : "Completed"),
	},
	{
		title: "Transaction Hash",
		dataIndex: "trxHast",
		key: "transactionHash",
		render: trxHast => (trxHast ? trxHast : "n/a"),
	},
];

function ExchangeHistory(props) {
	return (
		<>
			<PaginatedTable
				columns={exchangeHistoryColumns}
				rowKey="trxHast"
				fetchData={getExchangeHistory}
				passedOpts={{}}
				emptyTableMessage={"You haven't performed any exchange transactions yet."}
				className="exchange-history-table"
			/>
		</>
	);
}

export default ExchangeHistory;
