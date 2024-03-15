import jwt from 'jsonwebtoken'

export const checkRole = (role) => {
	return (req, res, next) => {
		if (req.headers.role !== role) {
			return res.status(401).json({
				success: false,
				message: 'Нет доступа',
			})
		}

		next()
	}
}
