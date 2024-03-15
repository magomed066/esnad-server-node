import {
	Category,
	Client,
	Deal,
	Partner,
	Payment,
	PaymentTransaction,
	User,
} from '../../models/index.js'

class DealService {
	async getDealById(id) {
		const deal = await Deal.findByPk(id, {
			include: [
				{
					model: Payment,
					as: 'payments',
					include: [
						{
							model: PaymentTransaction,
							as: 'transactions',
							order: [['id', 'DESC']],
							where: {
								deleted: 0,
							},
							separate: true, // Use separate subqueries for transactions
						},
					],
					where: {
						deal_id: id,
					},
					order: [['id', 'ASC']],
				},
				{
					model: User,
					as: 'curator',
					attributes: {
						exclude: ['password'],
					},
				},
				{
					model: Partner,
					as: 'partner',
					attributes: {
						include: ['name', 'id'],
					},
				},
				{
					model: Category,
					as: 'category',
					attributes: {
						include: ['name', 'id'],
					},
				},
				{
					model: Client,
					as: 'client',
				},
			],
		})

		return deal?.dataValues
	}
}

const dealService = new DealService()

export default dealService
