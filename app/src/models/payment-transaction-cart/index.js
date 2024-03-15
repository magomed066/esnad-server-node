import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const PaymentTransactionCart = sequelize.define('payment_transaction_cart', {
	id: {
		primaryKey: true,
		type: DataTypes.INTEGER,
		autoIncrement: true,
	},
	curatorId: DataTypes.INTEGER,
	payment_transaction_id: DataTypes.INTEGER,
})

export default PaymentTransactionCart
