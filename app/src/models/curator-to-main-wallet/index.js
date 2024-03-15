import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const CuratorToMainWalletTransaction = sequelize.define(
	'curator_to_main_wallet_transaction',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		curatorId: DataTypes.INTEGER,
		sum: DataTypes.DECIMAL(15, 2),
		message: DataTypes.TEXT,
	},
)

export default CuratorToMainWalletTransaction
