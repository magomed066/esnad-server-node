import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const InvestorConfidant = sequelize.define('investor_confidant', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	first_name: DataTypes.TEXT,
	last_name: DataTypes.TEXT,
	middle_name: DataTypes.TEXT,
	address: DataTypes.TEXT,
	phone: DataTypes.TEXT,
	investor_id: DataTypes.INTEGER,
})

export default InvestorConfidant
