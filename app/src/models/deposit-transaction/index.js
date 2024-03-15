import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const DepositTransaction = sequelize.define('deposit_transaction', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	sum: DataTypes.DECIMAL(15, 2),
	curatorProfit: DataTypes.DECIMAL(15, 2),
})

export default DepositTransaction
