import jwt from 'jsonwebtoken'
import { tokenService } from '../services/index.js'

export default (req, res, next) => {
	try {
		const authorizationHeader = req.headers.authorization

		if (!authorizationHeader) {
			return next(
				res.status(401).json({
					success: false,
					message: 'Нет доступа',
				}),
			)
		}

		const accessToken = authorizationHeader.replace(/Bearer\s?/, '')

		if (!accessToken) {
			return next(
				res.status(401).json({
					success: false,
					message: 'Нет доступа',
				}),
			)
		}

		const userData = tokenService.verifyAccessToken(accessToken)

		if (!userData) {
			return next(
				res.status(401).json({
					success: false,
					message: 'Нет доступа',
				}),
			)
		}

		req.userId = userData._id
		req.userRoles = userData.userInfo.roles

		next()
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: 'Нет доступа',
		})
	}
}
