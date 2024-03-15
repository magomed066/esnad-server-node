// import { Curator, CuratorWallet } from '../../models/index.js'

// export const addCurator = async (req, res) => {
// 	try {
// 		const { firstName, lastName, middleName, email, phone } = req.body

// 		const isExist = await Curator.findOne({
// 			where: { email },
// 		})

// 		if (isExist) {
// 			res.status(404).json({
// 				success: false,
// 				message: 'Куратор с таким email уже существует!',
// 			})

// 			return
// 		}

// 		const data = await Curator.create({
// 			firstName,
// 			lastName,
// 			middleName,
// 			fullName: `${firstName} ${lastName} ${middleName}`,
// 			email,
// 			phone,
// 		})

// await CuratorWallet.create({
// 	sum: 0,
// 	curatorId: data?.dataValues.id,
// })

// 		res.json({
// 			success: true,
// 			data: data.dataValues,
// 		})
// 	} catch (error) {
// 		console.log(error)
// 		res
// 			.status(500)
// 			.json({ success: false, message: 'Не удалось добавить куратора' })
// 	}
// }

// export const getAllCurators = async (req, res) => {
// 	try {
// 		const Curators = await Curator.findAll()

// 		res.json({
// 			success: true,
// 			data: Curators,
// 		})
// 	} catch (error) {
// 		console.log(error)
// 		res
// 			.status(500)
// 			.json({ success: false, message: 'Не удалось получить кураторов' })
// 	}
// }

// export const getCuratorById = async (req, res) => {
// 	try {
// 		const id = req.params.id

// 		const curator = await Curator.findByPk(id, {
// 			include: [{ model: CuratorWallet }],
// 		})

// 		res.json({
// 			success: true,
// 			data: curator,
// 		})
// 	} catch (error) {
// 		console.log(error)
// 		res
// 			.status(500)
// 			.json({ success: false, message: 'Не удалось получить куратора' })
// 	}
// }

// export const updateCuratorById = async (req, res) => {
// 	try {
// 		const { id, data } = req.body

// 		const curator = await Curator.findOne({ where: { id } })

// 		if (!curator) {
// 			return res.json({
// 				success: false,
// 				data: 'Такого куратора нет',
// 			})
// 		}

// 		await Curator.update(
// 			{
// 				...data,
// 				fullName: `${data.lastName} ${data.firstName} ${data.middleName}`,
// 			},
// 			{
// 				where: { id },
// 			},
// 		)

// 		res.json({
// 			success: true,
// 			data: { ...curator.dataValues, ...data },
// 		})
// 	} catch (error) {
// 		console.log(error)
// 		res
// 			.status(500)
// 			.json({ success: false, message: 'Не удалось обновить куратора' })
// 	}
// }

// export const deleteCuratorById = async (req, res) => {
// 	try {
// 		const { id } = req.params

// 		const isExist = await Curator.findByPk(id)

// 		if (!isExist) {
// 			return res.json({
// 				success: false,
// 				data: `Куратор с таким id: ${id} - не найден`,
// 			})
// 		}

// 		await Curator.destroy({ where: { id } })

// 		res.json({
// 			success: true,
// 			data: 'Куратор успешно удален',
// 		})
// 	} catch (error) {
// 		console.log(error)
// 		res
// 			.status(500)
// 			.json({ success: false, message: 'Не удалось удалить куратора' })
// 	}
// }
