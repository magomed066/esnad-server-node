import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Partner = sequelize.define('partner', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: DataTypes.TEXT,
})

export default Partner
