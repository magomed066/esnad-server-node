import express from 'express'
import checkAuth from '../../helpers/check-auth.js'

import verifyRoles from '../../helpers/verifyRoles.js'
import { USER_ROLES } from '../../config/constants.js'
import { getAllPartners } from '../../controllers/index.js'

const router = express.Router()

router.get(
	'/all',
	checkAuth,
	verifyRoles(USER_ROLES.Admin, USER_ROLES.Curator),
	getAllPartners,
)

export default router
