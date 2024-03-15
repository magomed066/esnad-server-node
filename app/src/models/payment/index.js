import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Payment = sequelize.define('payment', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	sum: DataTypes.DECIMAL(15, 2),
	payment_date: DataTypes.TEXT,
	deal_id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
	},
	status: DataTypes.INTEGER,
})

export default Payment
