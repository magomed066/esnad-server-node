import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Expense = sequelize.define('expense', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	sum: DataTypes.DECIMAL(15, 2),
	expense_category_id: DataTypes.INTEGER,
	comment: DataTypes.TEXT,
	createdDate: DataTypes.DATE,
	deleted: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
	},
})

export default Expense
