import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const PaymentTransaction = sequelize.define('payment_transaction', {
	amount: DataTypes.DECIMAL(15, 2),
	date: DataTypes.DATE,
	deleted: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
	},
	curatorProfit: DataTypes.DECIMAL(15, 2),
	comment: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
})

export default PaymentTransaction
