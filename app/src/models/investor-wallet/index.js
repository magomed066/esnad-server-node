import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const InvestorWallet = sequelize.define('investor_wallet', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	investorId: DataTypes.INTEGER,
	sum: DataTypes.DECIMAL(15, 2),
	tariff: DataTypes.INTEGER,
	contractTerm: DataTypes.INTEGER,
	reinvestment: DataTypes.BOOLEAN,
})

export default InvestorWallet
