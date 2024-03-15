import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.js'

const Category = sequelize.define('category', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: DataTypes.TEXT,
})

export default Category
