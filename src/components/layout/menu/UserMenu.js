import React, { Component } from "react";
import { Icon, Menu } from "antd";
import { Link, withRouter } from "react-router-dom";
import { compose } from "redux";
import connect from "react-redux/es/connect/connect";

const SubMenu = Menu.SubMenu;

class UserMenu extends Component {
	render() {
		const { location } = this.props;
		return (
			<Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
				<Menu.Item key="/">
					<Link to="/" className="ant-menu-item-content">
						<Icon type="dashboard" />
						<span>Dashboard</span>
					</Link>
				</Menu.Item>
				<SubMenu
					key="operations"
					title={
						<span className="ant-menu-item-content">
							<Icon type="interaction" />
							<span>Assets</span>
						</span>
					}
				>
					<Menu.Item key="/deposit">
						<Link to="/deposit">Deposit</Link>
					</Menu.Item>
					<Menu.Item key="/send-asset">
						<Link to="/send-asset">Send</Link>
					</Menu.Item>
					<Menu.Item key="/withdraw">
						<Link to="/withdraw">Withdraw</Link>
					</Menu.Item>
				</SubMenu>
				<SubMenu
					key="active-requests"
					title={
						<span className="ant-menu-item-content">
							<Icon type="pull-request" />
							<span>Requests</span>
						</span>
					}
				>
					<Menu.Item key="/active-requests/deposit">
						<Link to="/active-requests/deposit">Active deposit requests</Link>
					</Menu.Item>
					<Menu.Item key="/active-requests/withdraw">
						<Link to="/active-requests/withdraw">Active withdraw requests</Link>
					</Menu.Item>

					<Menu.Item key="/closed-requests/deposit">
						<Link to="/closed-requests/deposit">Closed deposit requests</Link>
					</Menu.Item>
					<Menu.Item key="/closed-requests/withdraw">
						<Link to="/closed-requests/withdraw">Closed withdraw requests</Link>
					</Menu.Item>
				</SubMenu>
				<Menu.Item key="/exchange">
					<Link to="/exchange" className="ant-menu-item-content">
						<Icon type="wallet" />
						<span>Assets Exchange</span>
					</Link>
				</Menu.Item>
			</Menu>
		);
	}
}

function mapStateToProps(state) {
	return {
		user: state.user,
	};
}

UserMenu = compose(
	withRouter,
	connect(mapStateToProps)
)(UserMenu);

export default UserMenu;
