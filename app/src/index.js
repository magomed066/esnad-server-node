import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import colors from 'colors'
import db from './config/db.js'
import cors from 'cors'

import {
	authRouter,
	categoriesRouter,
	curatorRouter,
	dealRouter,
	expenseRouter,
	investorRouter,
	partnersRouter,
	profitRouter,
	transactionRouter,
	walletRouter,
} from './routes/index.js'
import './connections/index.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT ?? 3000

const app = express()

app.use(express.static(path.join(__dirname, '../dist')))

app.use(express.json())
app.use(cors())

app.use('/api/auth', authRouter)
app.use('/api/investor', investorRouter)
app.use('/api/curator', curatorRouter)
app.use('/api/wallet', walletRouter)
app.use('/api/deal', dealRouter)
app.use('/api/transaction', transactionRouter)
app.use('/api/category', categoriesRouter)
app.use('/api/partner', partnersRouter)
app.use('/api/expense', expenseRouter)
app.use('/api/profit', profitRouter)

db.sync()
	.then(() => {
		console.log(colors.bgGreen('Connected to the DB...'))

		app.listen(PORT, () => {
			console.log(
				`Server has been started on port ${colors.bgBlue(
					`http://esnad.ru:${PORT}`,
				)}`,
			)
		})
	})
	.catch((err) => {
		console.log(err)
	})
