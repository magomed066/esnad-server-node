import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Profit = sequelize.define('profit', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	earnings: DataTypes.DECIMAL(15, 2),
	costPrice: DataTypes.DECIMAL(15, 2),
	markup: DataTypes.DECIMAL(15, 2),
	curatorsShare: DataTypes.DECIMAL(15, 2),
	allInvestorCash: DataTypes.DECIMAL(15, 2),
	marginalIncome: DataTypes.DECIMAL(15, 2),
	expense: DataTypes.DECIMAL(15, 2),
	operatingIncome: DataTypes.DECIMAL(15, 2),
	fixedIncome: DataTypes.DECIMAL(15, 2),
	lucre: DataTypes.DECIMAL(15, 2),
})

export default Profit
