const verifyRoles = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req?.userRoles) return res.sendStatus(401)

		const rolesArray = [...allowedRoles]

		const result = req.userRoles
			.map((item) => rolesArray.includes(item))
			.find((val) => val === true)

		if (!result) return res.sendStatus(401)

		next()
	}
}

export default verifyRoles
