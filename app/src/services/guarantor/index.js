import { Deal, Guarantor, GuarantorToDeal } from '../../models/index.js'

class GuarantorService {
	async getGuarantors(dealId) {
		const guarantors = await Guarantor.findAll({
			include: [
				{
					model: Deal,
					through: GuarantorToDeal,
					where: { id: Number(dealId) }, // Замените на ваш критерий поиска сделки
					attributes: [], // Пустой список атрибутов для исключения информации о сделках
				},
			],
			attributes: [
				'first_name',
				'last_name',
				'middle_name',
				'phone',
				'address',
				'email',
			], // Пустой список атрибутов, чтобы получить только поручителей
		})

		return guarantors
	}
}

const guarantorService = new GuarantorService()

export default guarantorService
