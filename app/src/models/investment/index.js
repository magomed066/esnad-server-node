import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Investment = sequelize.define('investment', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	investor_id: DataTypes.INTEGER,
	sum: DataTypes.DECIMAL(15, 2),
	comment: DataTypes.TEXT,
	createdDate: DataTypes.DATE,
	deleted: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
	},
})

export default Investment
