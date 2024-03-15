import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

// Доход куратора в процентах
const CuratorProfitPercentage = sequelize.define('curator_profit_percentage', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	curatorId: DataTypes.INTEGER,
	percentage: DataTypes.INTEGER,
})

export default CuratorProfitPercentage
