import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Guarantor = sequelize.define('guarantor', {
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
	email: DataTypes.TEXT,
})

export default Guarantor
