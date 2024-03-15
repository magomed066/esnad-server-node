import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Deal = sequelize.define('deal', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	product: DataTypes.TEXT,
	price: DataTypes.DECIMAL(15, 2),
	curator_id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
	},
	client_id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
	},
	category_id: DataTypes.INTEGER,
	partner_id: DataTypes.INTEGER,
	installment_period: DataTypes.INTEGER,
	payment_per_month: DataTypes.DECIMAL(15, 2),
	deposit: DataTypes.DECIMAL(15, 2),
	status: DataTypes.INTEGER,
	originPrice: DataTypes.DECIMAL(15, 2),
	bought_at: DataTypes.TEXT,
	curator_profit_percentage: DataTypes.INTEGER,
})

export default Deal
