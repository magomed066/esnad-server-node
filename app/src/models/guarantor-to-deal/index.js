import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const GuarantorToDeal = sequelize.define('guarantor_to_deal', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	deal_id: DataTypes.INTEGER,
	guarantor_id: DataTypes.INTEGER,
})

export default GuarantorToDeal
