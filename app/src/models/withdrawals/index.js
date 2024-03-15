import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Withdrawal = sequelize.define('withdrawal', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	investor_id: DataTypes.INTEGER,
	sum: DataTypes.DECIMAL(15, 2),
})

export default Withdrawal
