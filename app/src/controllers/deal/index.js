import moment from 'moment'
import {
	CuratorWallet,
	Deal,
	Payment,
	User,
	Client,
	Guarantor,
	GuarantorToDeal,
	PaymentTransaction,
	Partner,
	Category,
	PaymentTransactionCart,
	MainWallet,
	CuratorProfitPercentage,
	DepositTransaction,
	// DepositTransaction,
} from '../../models/index.js'
import { dealService, guarantorService } from '../../services/index.js'
import { Op } from 'sequelize'
import { Statuses, USER_ROLES } from '../../config/constants.js'

export const addDeal = async (req, res) => {
	try {
		const {
			product,
			price,
			curatorId,
			installmentPeriod,
			deposit,
			status,
			originPrice,
			boughtAt,
			categoryId,
			partnerId,
			firstName,
			lastName,
			middleName,
			address,
			phone,
			email,
			passportNumber,
			passportSeries,
			guarantors,
		} = req.body

		const curator = await User.findByPk(curatorId, {
			include: [{ model: CuratorWallet }],
		})

		if (!curator) {
			return res.status(404).json({
				success: false,
				message: 'Такого куратора нет',
			})
		}

		if (!guarantors) {
			return res.status(404).json({
				success: false,
				message: 'Добавьте поручителей',
			})
		}

		await CuratorWallet.update(
			{
				sum: Number(
					(
						curator?.dataValues?.curator_wallet?.dataValues?.sum -
						originPrice +
						deposit
					).toFixed(2),
				),
			},
			{ where: { curatorId } },
		)

		const perMonth = deposit
			? (price - deposit) / installmentPeriod
			: price / installmentPeriod

		let client = await Client.findOne({
			where: {
				phone,
			},
		})

		if (!client) {
			client = await Client.create({
				first_name: firstName,
				last_name: lastName,
				middle_name: middleName,
				passport_number: passportNumber,
				passport_series: passportSeries,
				full_name: `${lastName} ${firstName} ${middleName}`,
				phone,
				address,
				email,
			})
		}

		let guarantorsForDeal = []

		if (guarantors && guarantors.length > 0) {
			// смотрим есть ли поручители у нас в базе

			for (let guarantor of guarantors) {
				const existingGuarantor = await Guarantor.findOne({
					where: {
						first_name: guarantor.firstName.trim(),
						last_name: guarantor.lastName.trim(),
						middle_name: guarantor.middleName.trim(),
					},
				})

				if (existingGuarantor) {
					guarantorsForDeal.push(existingGuarantor)
				} else {
					const newGuarantor = await Guarantor.create({
						first_name: guarantor.firstName,
						last_name: guarantor.lastName,
						middle_name: guarantor.middleName,
						address: guarantor.address,
						phone: guarantor.phone,
						email: guarantor.email,
					})

					guarantorsForDeal.push(newGuarantor)
				}
			}
		}

		const curatorProfit = await CuratorProfitPercentage.findOne({
			where: { curatorId: curator.dataValues.id },
		})

		const deal = await Deal.create({
			curator_id: curatorId,
			product,
			price,
			installment_period: installmentPeriod,
			payment_per_month: perMonth,
			deposit: deposit,
			status: status || 0,
			originPrice: originPrice,
			bought_at: boughtAt,
			client_id: client.dataValues.id,
			category_id: categoryId,
			partner_id: partnerId,
			curator_profit_percentage:
				partnerId !== 1 ? 10 : curatorProfit?.dataValues.percentage,
		})

		if (deposit) {
			const curatorProfit =
				((deal?.dataValues.price - deal?.dataValues.originPrice) / 100) *
				deal?.dataValues.curator_profit_percentage

			await DepositTransaction.create({
				dealId: deal.dataValues.id,
				sum: deposit,
				curatorProfit: (curatorProfit / deal.dataValues.price) * deposit,
			})
		}

		const period = Number(installmentPeriod)
		const startDate = moment()

		for (let i = 1; i <= period; i++) {
			const paymentDate = moment(startDate)

			paymentDate.add(i, 'months') // Увеличиваем месяц на i

			const formattedDate = paymentDate.format('YYYY-MM-DD HH:mm:ss')

			await Payment.create({
				sum: 0,
				payment_date: formattedDate,
				status: 0,
				deal_id: deal.dataValues.id,
			})
		}

		if (guarantors && guarantors.length > 0) {
			// Устанавливаем ассоциации между сделкой и поручителями
			await deal.setGuarantors(guarantorsForDeal)
		}

		res.json({
			success: true,
			data: deal.dataValues.id,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось открыть сделку' })
	}
}

export const getAllDeals = async (req, res) => {
	try {
		const deals = await Deal.findAll({
			include: [
				{
					model: User,
					as: 'curator',
					attributes: {
						exclude: ['password'],
					},
				},
				{
					model: Client,
					as: 'client',
				},
			],
		})

		res.json({
			success: true,
			data: deals,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить сделки' })
	}
}

export const getCuratorDeals = async (req, res) => {
	try {
		const curatorId = req.userId

		const curator = await User.findByPk(curatorId)

		if (!curator)
			return res.status(404).json({
				success: false,
				message: 'Такого инвестора нет',
			})

		const deals = await Deal.findAll({
			include: [
				{
					model: User,
					as: 'curator',
					attributes: {
						exclude: ['password'],
					},
				},
				{ model: Client, as: 'client' },
			],
			where: { curator_id: curatorId },
		})

		res.json({
			success: true,
			data: deals,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить сделки' })
	}
}

function getPaymentStatus(deal, payment, sum) {
	const isWholeMonthPayed =
		Number(deal?.dataValues?.payment_per_month) <= Number(sum)
	const isExpiredInProcess =
		payment.dataValues.status == Statuses.EXPIRED_IN_PROCESS
	const isInProcess = payment.dataValues.status == Statuses.IN_PROCESS

	let paymentStatus

	if (isWholeMonthPayed && isExpiredInProcess) {
		paymentStatus = Statuses.EXPIRED_COMPLETED
	} else if (isWholeMonthPayed && isInProcess) {
		paymentStatus = Statuses.COMPLETED
	} else if (!isWholeMonthPayed && isExpiredInProcess) {
		paymentStatus = Statuses.EXPIRED_IN_PROCESS
	} else {
		paymentStatus = Statuses.IN_PROCESS
	}

	return paymentStatus
}

export const addPaymentDeal = async (req, res) => {
	const { dealId, sum, paymentId, comment } = req.body

	const roles = req.userRoles
	const curatorId = req.userId

	if (!roles.includes(USER_ROLES.Curator)) {
		return res.json({
			success: false,
			data: 'У вас нет прав доступа для добавления платежа.',
		})
	}

	const dealInfo = await dealService.getDealById(dealId)

	const payment = await Payment.findOne({
		where: {
			id: paymentId,
			deal_id: dealId,
		},
	})

	if (!payment) {
		return res.json({
			success: false,
			data: 'Платеж не найден.',
		})
	}

	const deal = await Deal.findOne({
		where: {
			id: dealId,
		},
	})

	if (
		Number(payment?.dataValues.sum) ===
		Number(deal?.dataValues.payment_per_month)
	) {
		return res.json({
			success: false,
			data: 'Данный платеж уже произведен.',
		})
	}

	const curatorProfit = Number(
		((deal?.dataValues.price - deal?.dataValues.originPrice) / 100) *
			deal?.dataValues.curator_profit_percentage,
	)

	let newPaymentSum = Number(payment.dataValues.sum) + Number(sum)
	const dealPaymentPerMonth = Number(deal?.dataValues.payment_per_month)

	let log = []

	if (newPaymentSum > dealPaymentPerMonth) {
		const payments = await Payment.findAll({
			where: {
				deal_id: dealId,
				status: {
					[Op.ne]: [1, 3],
				},
			},
		})

		let subPayment = newPaymentSum

		for (let paymentItem of payments) {
			const paymentItemSum = Number(paymentItem.dataValues.sum)

			if (subPayment <= 0) {
				break
			}

			if (paymentItemSum + subPayment > dealPaymentPerMonth) {
				await paymentItem.update({
					sum: dealPaymentPerMonth,
					status: getPaymentStatus(deal, paymentItem, dealPaymentPerMonth),
				})

				log.push({ dealPaymentPerMonth })
				log.push({ sum: dealPaymentPerMonth - paymentItemSum })
				await PaymentTransaction.create({
					paymentId: paymentItem?.dataValues.id,
					amount: dealPaymentPerMonth - paymentItemSum,
					date: moment(),
					comment,
					deleted: 0,
					curatorProfit:
						(curatorProfit / deal?.dataValues.price) * dealPaymentPerMonth,
				})

				console.log('Payment 1')

				await CuratorWallet.increment('sum', {
					by: dealPaymentPerMonth - paymentItemSum,
					where: {
						curatorId,
					},
				})
			} else {
				let nPayment = paymentItemSum + subPayment

				await paymentItem.update({
					sum: paymentItemSum + subPayment,
					status: getPaymentStatus(deal, paymentItem, nPayment),
				})

				log.push({ sum: paymentItemSum + subPayment })
				await PaymentTransaction.create({
					paymentId: paymentItem?.dataValues.id,
					amount: nPayment,
					date: moment(),
					comment,
					deleted: 0,
					curatorProfit: (curatorProfit / deal?.dataValues.price) * subPayment,
				})

				console.log('Payment 2')

				await CuratorWallet.increment('sum', {
					by: nPayment,
					where: {
						curatorId,
					},
				})
			}

			subPayment = subPayment - dealPaymentPerMonth
			log.push({ subPayment, paymentItemSum })
		}
	} else {
		const payments = await Payment.findAll({
			where: {
				deal_id: dealId,
				status: {
					[Op.ne]: [1, 3],
				},
			},
		})

		const lastPayment = payments[payments.length - 1]

		/// было += 0.01 заменено на рассчет Делается Тест и сделать проверку транзакция равна ли per month если да то делать нижний рассчет если не то как обычный платеж
		let lastPay = Number(
			dealInfo?.payment_per_month * dealInfo?.installment_period -
				(dealInfo?.deposit
					? dealInfo?.price - dealInfo?.deposit
					: dealInfo?.price),
		)

		if (
			lastPayment?.dataValues.id === payment.dataValues.id &&
			newPaymentSum === dealPaymentPerMonth
		) {
			newPaymentSum -= lastPay
		}

		if (
			lastPayment?.dataValues.id === payment.dataValues.id &&
			newPaymentSum >= dealPaymentPerMonth - lastPay
		) {
			newPaymentSum += lastPay
		}

		/// если оплачено полностью то изменить sum на PerMonth если нет то newPaymentSum
		await payment.update({
			sum: newPaymentSum,
			status: getPaymentStatus(deal, payment, newPaymentSum),
		})

		await PaymentTransaction.create({
			paymentId: payment?.dataValues.id,
			amount:
				Number(sum) >= dealPaymentPerMonth
					? Number(sum) - lastPay
					: Number(sum),
			date: moment(),
			comment,
			deleted: 0,
			curatorProfit: (curatorProfit / deal?.dataValues.price) * newPaymentSum,
		})

		await CuratorWallet.increment('sum', {
			by:
				Number(sum) >= dealPaymentPerMonth
					? Number(sum) - lastPay
					: Number(sum),
			where: {
				curatorId,
			},
		})
	}

	const allPayedPayments = await Payment.findAll({
		where: { deal_id: dealId, status: [1, 3] },
	})

	let isAllPayedInTime = true

	allPayedPayments.forEach((el) => {
		if (el.dataValues === 3) {
			isAllPayedInTime = false
		}
	})

	if (
		deal?.dataValues.installment_period === allPayedPayments.length &&
		isAllPayedInTime
	) {
		await deal.update({ status: 1 }, { where: { id: dealId } })
	}

	if (
		deal?.dataValues.installment_period === allPayedPayments.length &&
		!isAllPayedInTime
	) {
		await deal.update({ status: 3 }, { where: { id: dealId } })
	}

	res.json({
		success: true,
		data: 'Оплата прошла успешно!',
	})

	try {
	} catch (error) {
		console.log(error)
		return res
			.status(500)
			.json({ success: false, message: 'Не удалось сделать оплату' })
	}
}

export const getDealById = async (req, res) => {
	const id = req.params.id

	try {
		const deal = await dealService.getDealById(id)

		const leftToPay = Number(
			Number(deal.price) -
				Number(deal.deposit) -
				(deal.payments
					.filter((payment) => Number(payment.sum) !== 0)
					.reduce((acc, curr) => acc + Number(curr.sum), 0) || 0),
		)

		// Получите текущую дату
		const currentDate = new Date()

		let isPros = false

		// Проверьте просрочку для каждого месяца
		for (const payment of deal.payments) {
			const expectedPaymentDate = new Date(payment.payment_date)

			// Если текущая дата больше даты ожидаемого платежа, то это просрочка
			if (currentDate > expectedPaymentDate) {
				isPros = true
			}
		}

		const guarantors = await guarantorService.getGuarantors(id)

		const curatorProfit =
			((deal.price - deal.originPrice) / 100) * deal.curator_profit_percentage

		const lastPayment =
			deal.payment_per_month -
			(deal.payment_per_month * deal.installment_period -
				(deal.deposit ? deal.price - deal.deposit : deal.price))
		// 07.12.2023 Рамзан changed === to <= 0
		res.json({
			success: true,
			data: {
				...deal,
				curator_profit: curatorProfit,
				deposit_profit: (curatorProfit / deal.price) * deal.deposit,
				left_to_pay: leftToPay,
				lastPayment: lastPayment,
				is_all_payed: leftToPay <= 0 ? true : false,
				isPros: isPros,
				guarantors,
			},
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить сделку' })
	}
}

export const deletePaymentTransaction = async (req, res) => {
	const { transactionId, paymentId, sum, dealId } = req.body
	const curatorId = req.userId

	const roles = req.userRoles

	if (!roles.includes(USER_ROLES.Curator)) {
		return res.json({
			success: false,
			data: 'Нельзя удалить платеж',
		})
	}

	try {
		const deal = await Deal.findOne({ where: { id: dealId } })
		const curatorWallet = await CuratorWallet.findOne({ where: { curatorId } })
		const payment = await Payment.findOne({ where: { id: paymentId } })

		await CuratorWallet.update(
			{
				sum: curatorWallet?.dataValues.sum - sum,
			},
			{
				where: {
					curatorId,
				},
			},
		)

		const paymentStatus =
			payment?.dataValues.status === 2 || payment?.dataValues.status === 3
				? 2
				: payment?.dataValues.sum - sum >= deal?.dataValues.payment_per_month
				? 1
				: 0

		await Payment.update(
			{
				sum: payment?.dataValues.sum - sum,
				status: paymentStatus,
			},
			{ where: { id: paymentId } },
		)

		await Deal.update(
			{
				status:
					deal?.dataValues.status === 2 || deal?.dataValues.status === 3
						? 2
						: 0,
			},
			{
				where: {
					id: deal?.dataValues.id,
				},
			},
		)

		await PaymentTransaction.update(
			{ deleted: 1 },
			{ where: { id: transactionId } },
		)

		await PaymentTransactionCart.create({
			payment_transaction_id: transactionId,
			curatorId,
		})

		res.json({
			success: true,
			data: 'Транзакция успешно удалена',
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось удалить транзакцию' })
	}
}

export const getDelinquency = async (req, res) => {
	try {
		const deals = await Deal.findAll({
			include: [
				{
					model: Payment,
					as: 'payments',
					order: [['id', 'ASC']],
				},
			],
			where: {
				status: [0, 2], // Фильтруем сделки по статусам 0 и 2
			},
		})

		const currentDate = moment()

		for (const deal of deals) {
			let dealStatusUpdated = false

			for (const payment of deal.dataValues.payments) {
				if (payment.status !== 1) {
					const paymentDate = moment(payment.payment_date)

					if (paymentDate < currentDate) {
						await Payment.update(
							{
								status: 2, // Установите нужный статус, например, 2 для просрочки
							},
							{
								where: {
									id: payment.id,
								},
							},
						)

						dealStatusUpdated = true
					}
				}
			}

			if (dealStatusUpdated) {
				await Deal.update(
					{
						status: 2,
					},
					{
						where: {
							id: deal.dataValues.id,
						},
					},
				)
			}
		}

		res.json({
			success: true,
			data: deals,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить просрочки' })
	}
}

export const restorePaymentTransaction = async (req, res) => {
	try {
		const { curatorId, transactionId } = req.body

		await PaymentTransaction.update(
			{ deleted: 0 },
			{ where: { id: transactionId } },
		)

		await PaymentTransactionCart.destroy({
			where: {
				payment_transaction_id: transactionId,
			},
		})

		const transaction = await PaymentTransaction.findOne({
			where: { id: transactionId },
		})

		await CuratorWallet.increment('sum', {
			by: Number(transaction?.dataValues.amount),
			where: {
				id: curatorId,
			},
		})

		const payment = await Payment.findOne({
			where: {
				id: transaction?.dataValues.paymentId,
			},
		})

		const deal = await Deal.findOne({
			where: {
				id: payment?.dataValues.deal_id,
			},
		})

		const paymentStatus =
			payment?.dataValues.status === 2 || payment?.dataValues.status === 3
				? 2
				: Number(payment?.dataValues.sum) +
						Number(transaction?.dataValues.amount) >=
				  Number(deal?.dataValues.payment_per_month)
				? 1
				: 0

		await Payment.update(
			{
				sum:
					Number(payment?.dataValues.sum) +
					Number(transaction?.dataValues.amount),
				status: paymentStatus,
			},
			{ where: { id: payment?.dataValues.id } },
		)

		const updatedDeal = await Deal.findOne({
			where: {
				id: payment?.dataValues.deal_id,
			},
			include: [{ model: Payment }],
		})

		let isCompleted = true

		for (let i = 0; i < updatedDeal?.dataValues.payments.length; i++) {
			if (
				updatedDeal?.dataValues.payments[i].status !== 1 &&
				updatedDeal?.dataValues.payments[i].status !== 3
			) {
				isCompleted = false
			}
		}

		if (isCompleted) {
			await Deal.update(
				{
					status:
						updatedDeal?.dataValues.status === 2
							? 3
							: updatedDeal?.dataValues.status === 0
							? 1
							: 3,
				},
				{
					where: { id: updatedDeal?.dataValues.id },
				},
			)
		}

		res.json({
			success: true,
			data: 'Транзакция восстановлена',
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			success: false,
			message: 'Не удалось восстановить транзакцию',
		})
	}
}

export const getDealsByFilter = async (req, res) => {
	try {
		const params = req.query

		const data = await Deal.findAll({
			where: {
				[Op.or]: {
					id: params.query,
					product: { [Op.contains]: params.query },
				},
			},
		})

		return res.json({ success: true, data })
	} catch (error) {}
}
