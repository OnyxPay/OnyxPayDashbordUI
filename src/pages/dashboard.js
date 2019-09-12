import React, { Component } from "react";
import { connect } from "react-redux";
import { PageTitle } from "../components";
import OperationsWidget from "components/paginated-list/OperationsWidget";
import { userStatus } from "api/constants";
import { Card } from "antd";
import Balance from "../components/balance/Balance";
import ConfirmEmailModal from "../components/modals/ConfirmEmail";

class Home extends Component {
	state = {
		isConfirmEmailModalVisible: false,
	};

	componentDidMount() {
		if (!this.isUserVerified()) {
			this.showModal();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.user.verified !== prevProps.user.verified) {
			this.hideModal();
		}
	}

	isUserVerified() {
		const { user } = this.props;
		return user.status !== userStatus.wait ? true : false;
	}

	showModal = () => {
		this.setState({ isConfirmEmailModalVisible: true });
	};

	hideModal = () => {
		this.setState({ isConfirmEmailModalVisible: false });
	};

	render() {
		const { isConfirmEmailModalVisible } = this.state;
		const { user } = this.props;

		return (
			<>
				<PageTitle>Dashboard</PageTitle>
				<Balance />

				<Card title="Recent Transactions">
					<OperationsWidget user={user} />
				</Card>

				<ConfirmEmailModal isModalVisible={isConfirmEmailModalVisible} hideModal={this.hideModal} />
			</>
		);
	}
}

export default connect(state => {
	return {
		user: state.user,
	};
})(Home);
