import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { Token } from '../../models/index.js'

class TokenService {
	generateTokens(payload) {
		const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: '10d',
		})
		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {
			expiresIn: '30d',
		})

		return { accessToken, refreshToken }
	}

	async saveToken(userId, refreshToken) {
		const tokenData = await Token.findOne({ where: { userId } })

		if (tokenData) {
			await Token.update(
				{
					refreshToken,
				},
				{ where: { userId } },
			)

			return
		}

		const token = await Token.create({ userId, refreshToken })
		return token
	}

	async removeToken(refreshToken) {
		await Token.destroy({ where: { refreshToken } })
	}

	verifyAccessToken(token) {
		try {
			const userData = jwt.verify(token, process.env.JWT_SECRET)
			return userData
		} catch (error) {
			return null
		}
	}

	verifyRefreshToken(token) {
		try {
			const userData = jwt.verify(token, process.env.JWT_REFRESH_TOKEN)
			return userData
		} catch (error) {
			return null
		}
	}

	async findToken(refreshToken) {
		const data = await Token.findOne({ where: { refreshToken } })

		return data?.dataValues
	}
}

export default new TokenService()
