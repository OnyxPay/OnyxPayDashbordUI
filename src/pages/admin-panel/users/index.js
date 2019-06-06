import React, { Component } from "react";
import { Table, Input, Button, Icon, Modal } from "antd";
import Highlighter from "react-highlight-words";
import { connect } from "react-redux";
import Actions from "../../../redux/actions";
import UserSettlement from "./userSettlement";

class Users extends Component {
	constructor(props) {
		super();
		this.state = {
			searchText: "",
			data: [],
		};
		console.log(props);
	}

	getColumnSearchProps = dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={node => {
						this.searchInput = node;
					}}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
					style={{ width: 188, marginBottom: 8, display: "block" }}
				/>
				<Button
					type="primary"
					onClick={() => this.handleSearch(selectedKeys, confirm)}
					icon="search"
					size="small"
					style={{ width: 90, marginRight: 8 }}
				>
					Search
				</Button>
				<Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
					Reset
				</Button>
			</div>
		),
		filterIcon: filtered => (
			<Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
		),
		onFilter: (value, record) =>
			record[dataIndex]
				.toString()
				.toLowerCase()
				.includes(value.toLowerCase()),
		onFilterDropdownVisibleChange: visible => {
			if (visible) {
				setTimeout(() => this.searchInput.select());
			}
		},
		render: text => (
			<Highlighter
				highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
				searchWords={[this.state.searchText]}
				autoEscape
				textToHighlight={text ? text.toString() : "n/a"}
			/>
		),
	});

	handleSearch = (selectedKeys, confirm) => {
		confirm();
		this.setState({ searchText: selectedKeys[0] });
	};

	handleReset = clearFilters => {
		clearFilters();
		this.setState({ searchText: "" });
	};

	componentWillMount = () => {
		this.props.getUsersData();
		const { adminUsers } = this.props;
		this.setState({
			data: adminUsers,
		});
	};

	render() {
		const showSettlement = dataIndex => {
			alert(dataIndex);
			return <UserSettlement />;
		};

		const columns = [
			{
				title: "firstName",
				dataIndex: "first_name",
				key: "first_name",
				width: "10%",
				...this.getColumnSearchProps("first_name"),
			},
			{
				title: "lastName",
				dataIndex: "last_name",
				key: "last_name",
				width: "10%",
				...this.getColumnSearchProps("last_name"),
			},
			{
				title: "Сountry",
				dataIndex: "country",
				key: "country",
				width: "10%",
				...this.getColumnSearchProps("country"),
			},
			{
				title: "Email",
				dataIndex: "email",
				key: "email",
				width: "10%",
				...this.getColumnSearchProps("email"),
			},
			{
				title: "phoneNumber",
				dataIndex: "phone_number",
				key: "phone_number",
				width: "10%",
				...this.getColumnSearchProps("phone_number"),
			},
			{
				title: "telegramChatId",
				dataIndex: "chat_id",
				key: "chat_id",
				width: "10%",
				...this.getColumnSearchProps("chat_id"),
			},
			{
				title: "settlementsAccounts",
				dataIndex: "is_settlements_exists",
				key: "is_settlements_exists",
				width: "10%",
				render: dataIndex =>
					dataIndex ? (
						<Button type="primary" onClick={() => showSettlement(dataIndex)}>
							showSettlement
						</Button>
					) : (
						"n/a"
					),
			},
		];

		return <Table columns={columns} dataSource={this.state.data} />;
	}
}

const mapStateToProps = state => ({
	adminUsers: state.adminUsers,
});

export default connect(
	mapStateToProps,
	{
		getUsersData: Actions.adminUsers.getUsersData,
		getUserSetElementData: Actions.userSettlementAccountData.getUserSetElementData,
	}
)(Users);
