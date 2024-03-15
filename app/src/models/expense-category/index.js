import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const ExpenseCategory = sequelize.define('expense_category', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: DataTypes.TEXT,
})

export default ExpenseCategory
