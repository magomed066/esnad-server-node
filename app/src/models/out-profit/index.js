import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const OutProfit = sequelize.define('out_profit', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	createdDate: DataTypes.DATE,
	amount: DataTypes.DECIMAL(15, 2),
	comment: DataTypes.TEXT,
	deleted: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
	},
})

export default OutProfit
