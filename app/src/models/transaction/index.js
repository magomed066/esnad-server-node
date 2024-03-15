import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Transaction = sequelize.define('transaction', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	from_user_id: DataTypes.INTEGER,
	to_user_id: DataTypes.INTEGER,
	sum: DataTypes.DECIMAL(15, 2),
	message: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
})

export default Transaction
