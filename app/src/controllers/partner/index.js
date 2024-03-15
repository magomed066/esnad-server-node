import { Category, Partner } from '../../models/index.js'

export const getAllPartners = async (req, res) => {
	try {
		const data = await Partner.findAll()

		res.json({
			success: true,
			data,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить партнеров' })
	}
}
