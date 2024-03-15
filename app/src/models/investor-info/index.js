import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const InvestorInfo = sequelize.define('investor_info', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	capital_share: DataTypes.INTEGER,
	share_percentage: DataTypes.INTEGER,
	profit_share: DataTypes.INTEGER,
	tariff: DataTypes.INTEGER,
	investor_net_profit: DataTypes.INTEGER,
	reinvested: DataTypes.BOOLEAN,
})

export default InvestorInfo
