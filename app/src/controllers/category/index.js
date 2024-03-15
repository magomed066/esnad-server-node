import { Category } from '../../models/index.js'

export const getAllCategories = async (req, res) => {
	try {
		const data = await Category.findAll()

		res.json({
			success: true,
			data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить категории' })
	}
}
