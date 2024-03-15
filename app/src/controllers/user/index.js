import { USER_ROLES } from '../../config/constants.js'
// import generateToken from '../../helpers/generate-token.js'
import {
	CuratorProfitPercentage,
	CuratorWallet,
	Investment,
	InvestorInfo,
	InvestorWallet,
	User,
	Withdrawal,
} from '../../models/index.js'
import bcrypt from 'bcryptjs'
import { tokenService } from '../../services/index.js'
import InvestorConfidant from '../../models/investor-confidant/index.js'
import { where } from 'sequelize'

export const registerUser = async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			middleName,
			email,
			phone,
			password,
			roles,
			profitPercentage,
			tariff,
			contractTerm,
			investorConfidant,
		} = req.body

		const isExist = await User.findOne({
			where: { email },
		})

		if (isExist) {
			res.status(404).json({
				success: false,
				message: 'Пользователь с таким email уже существует!',
			})

			return
		}

		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		const data = await User.create({
			firstName,
			lastName,
			middleName,
			fullName: `${firstName} ${lastName} ${middleName}`,
			email,
			phone,
			password: hashedPassword,
			roles: JSON.stringify(roles),
		})

		const isCurator = roles.includes(USER_ROLES.Curator)

		const isInvestor = roles.includes(USER_ROLES.Investor)

		if (isCurator) {
			await CuratorWallet.create({
				sum: 0,
				curatorId: data?.dataValues.id,
			})

			await CuratorProfitPercentage.create({
				percentage: Number(profitPercentage),
				curatorId: data?.dataValues.id,
			})
		}

		if (isInvestor) {
			await InvestorWallet.create({
				sum: 0,
				investorId: data?.dataValues.id,
				tariff,
				contractTerm,
				reinvestment: true,
			})

			await InvestorConfidant.create({
				first_name: investorConfidant.firstName,
				last_name: investorConfidant.lastName,
				middle_name: investorConfidant.middleName,
				phone: investorConfidant.phone,
				address: investorConfidant.address,
				investor_id: data?.dataValues.id,
			})
		}

		const { password: hashPass, ...userData } = data.dataValues

		const userRoles = JSON.parse(userData.roles)

		const { accessToken, refreshToken } = tokenService.generateTokens({
			_id: userData.id,
			userInfo: {
				roles: userRoles,
			},
		})

		await tokenService.saveToken(userData.id, refreshToken)

		res.cookie('refreshToken', refreshToken, {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			secure: false,
		})

		res.json({
			success: true,
			data: {
				...userData,
				roles: userRoles,
				accessToken,
				refreshToken,
			},
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось зарегистрироваться' })
	}
}

export const login = async (req, res) => {
	try {
		const { password, email } = req.body

		const data = await User.findOne({
			where: { email },
		})

		if (!data) {
			return res.status(404).json({
				success: false,
				message: 'Пользователя с таким email нет',
			})
		}

		const { password: hashPass, ...userData } = data?.dataValues

		const isValidPassword = await bcrypt.compare(password, hashPass)

		if (!isValidPassword) {
			return res.status(404).json({
				success: false,
				message: 'Неверный логин или пароль',
			})
		}

		const userRoles = JSON.parse(userData.roles)

		const { accessToken, refreshToken } = tokenService.generateTokens({
			_id: userData.id,
			userInfo: {
				roles: userRoles,
			},
		})

		await tokenService.saveToken(userData.id, refreshToken)

		res.cookie('refreshToken', refreshToken, {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			secure: false,
		})

		res.json({
			success: true,
			data: {
				...userData,
				roles: userRoles,
				fullName: `${userData.lastName} ${userData.firstName} ${userData.middleName}`,
				accessToken,
				refreshToken,
			},
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось авторизоваться' })
	}
}

export const logout = async (req, res) => {
	try {
		const { refreshToken } = req.cookies

		await tokenService.removeToken(refreshToken)

		console.log(req.cookies)

		res.clearCookie('refreshToken')

		res.json({
			success: true,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось выйти из аккаунта' })
	}
}
export const refreshToken = async (req, res) => {
	try {
		const { refreshToken } = req.cookies

		const tokenData = tokenService.verifyRefreshToken(refreshToken)
		const tokenFromDB = await tokenService.findToken(refreshToken)

		if (!tokenData || !tokenFromDB) {
			res.status(401).json({
				success: false,
			})

			return
		}

		const tokens = tokenService.generateTokens({
			_id: tokenData._id,
			userInfo: {
				roles: tokenData.userInfo.roles,
			},
		})

		await tokenService.saveToken(tokenData._id, tokens.refreshToken)

		res.cookie('refreshToken', tokens.refreshToken, {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			secure: false,
		})

		res.json({
			success: true,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось выйти из аккаунта' })
	}
}

export const getUserWallet = async (req, res) => {
	try {
		const id = req.userId

		const curator = await User.findOne({ where: { id } })

		if (!curator) {
			return res.json({
				success: false,
				data: 'Такого куратора нет',
			})
		}

		const wallet = await CuratorWallet.findOne({ where: { curatorId: id } })

		if (!wallet) {
			return res.json({
				success: false,
				data: 'Не удалось получить кошелек',
			})
		}

		return res.json({
			success: true,
			data: wallet.dataValues,
		})
	} catch (error) {
		return res.status(404).json({
			success: false,
			data: 'Что-то пошло не так',
		})
	}
}

export const getAllInvestors = async (req, res) => {
	try {
		const investors = await User.findAll({
			where: { roles: JSON.stringify([USER_ROLES.Investor]) },
			include: [{ model: Investment }, { model: InvestorWallet }],
		})

		return res.json({
			success: true,
			data: investors,
		})
	} catch (error) {}
}

export const getAllCurators = async (req, res) => {
	try {
		const investors = await User.findAll({
			where: {
				roles: JSON.stringify([USER_ROLES.Curator]),
			},
			include: [{ model: CuratorWallet }],
		})

		return res.json({
			success: true,
			data: investors,
		})
	} catch (error) {}
}

export const deleteUserById = async (req, res) => {
	try {
		const { id } = req.params

		const isExist = await User.findByPk(id)

		if (!isExist) {
			return res.json({
				success: false,
				data: `Пользователь с таким id: ${id} - не найден`,
			})
		}

		await User.destroy({ where: { id } })

		res.json({
			success: true,
			data: 'Пользователь успешно удален',
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось удалить пользователя' })
	}
}

export const getUserById = async (req, res) => {
	try {
		const id = req.params.id

		const user = await User.findByPk(id, {
			attributes: {
				exclude: ['password'],
			},
			include: [{ model: CuratorProfitPercentage }, { model: InvestorWallet }],
		})

		const investorConfidant = await InvestorConfidant.findOne({
			where: { investor_id: id },
		})

		res.json({
			success: true,
			data: {
				...user?.dataValues,
				...(user?.dataValues.curator_profit_percentage?.percentage && {
					profitPercentage:
						user?.dataValues.curator_profit_percentage?.percentage,
				}),
				...(user?.dataValues.investor_wallet?.tariff && {
					tariff: user.dataValues.investor_wallet?.tariff,
				}),
				...(user?.dataValues.investor_wallet?.tariff && {
					contractTerm: user?.dataValues.investor_wallet?.contractTerm,
				}),
				confidant: investorConfidant,

				confidantFirstName: investorConfidant?.dataValues.first_name,
				confidantLastName: investorConfidant?.dataValues.last_name,
				confidantMiddleName: investorConfidant?.dataValues.middle_name,
				confidantPhone: investorConfidant?.dataValues.phone,
				confidantAddress: investorConfidant?.dataValues.address,
				confidantId: investorConfidant?.dataValues.id,
			},
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить пользователя' })
	}
}

export const updateUserById = async (req, res) => {
	try {
		const { id, data } = req.body

		const user = await User.findOne({ where: { id } })

		const confident = await InvestorConfidant.findOne({
			where: { id: Number(data.confidantId) },
		})

		const investorWallet = await InvestorWallet.findOne({
			where: { investorId: Number(id) },
		})

		const isCurator = JSON.parse(JSON.stringify(data.roles)).includes(
			USER_ROLES.Curator,
		)
		const isInvestor = JSON.parse(JSON.stringify(data.roles)).includes(
			USER_ROLES.Investor,
		)

		if (!user) {
			return res.json({
				success: false,
				data: 'Такого пользователя нет',
			})
		}

		if (!confident) {
			return res.json({
				success: false,
				data: 'Такого доверенного лица нет',
			})
		}

		if (!investorWallet) {
			return res.json({
				success: false,
				data: 'Такого инвестора нет',
			})
		}

		if (isCurator) {
			await CuratorProfitPercentage.update(
				{
					percentage: Number(data.profitPercentage),
				},
				{ where: { curatorId: id } },
			)
		}

		if (investorWallet) {
			await investorWallet.update(
				{
					tariff: Number(data.tariff),
					contractTerm: Number(data.contractTerm),
					reinvestment: data.investor_wallet.reinvestment ? 1 : 0,
				},
				{ where: { investorId: id } },
			)
		}

		if (confident) {
			await confident.update(
				{
					first_name: data.confidantFirstName,
					last_name: data.confidantLastName,
					middle_name: data.confidantMiddleName,
					phone: data.confidantPhone,
					address: data.confidantAddress,
				},
				{ where: { id: data.confidantId } },
			)
		}

		await user.update(
			{
				...data,
				fullName: `${data.lastName} ${data.firstName} ${data.middleName}`,
			},
			{
				where: { id },
			},
		)

		res.json({
			success: true,
			data: { ...user.dataValues, ...data },
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось обновить пользователя' })
	}
}

export const getInvestorById = async (req, res) => {
	try {
		const { id } = req.params

		const investor = await User.findOne({
			where: { id },
			attributes: ['firstName', 'lastName', 'middleName', 'phone', 'email'],
		})

		const investments = await Investment.findAll({
			where: {
				investor_id: id,
			},
		})

		const investorWallet = await InvestorWallet.findOne({
			where: {
				investorId: id,
			},
		})

		const investorProfit = await InvestorInfo.findAll({
			where: {
				investorId: id,
			},
		})

		const investorConfidant = await InvestorConfidant.findOne({
			where: {
				investor_id: id,
			},
		})

		const withdrawals = await Withdrawal.findAll({ where: { investor_id: id } })

		res.json({
			success: true,
			data: {
				investor,
				investments,
				wallet: investorWallet,
				profit: investorProfit,
				confidant: investorConfidant,
				withdrawals,
			},
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось получить куратора' })
	}
}

export const updateInvestorReinvestmentStatus = async (req, res) => {
	try {
		const { investorId, reinvestment } = req.body

		await InvestorWallet.update(
			{
				reinvestment,
			},
			{
				where: {
					investorId,
				},
			},
		)

		res.json({
			success: true,
			message: 'Статус успешно сменен',
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ success: false, message: 'Не удалось обновить статус' })
	}
}
