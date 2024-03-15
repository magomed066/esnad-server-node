import { body } from 'express-validator'

export const loginValidation = [
	body('email', 'Неверный формат почты').isEmail(),
	body('password', 'Пароль должен быть минимум 5 символов').isLength({
		min: 5,
	}),
]

export const registerValidation = [
	body('email', 'Неверный формат почты').isEmail(),
	body('password', 'Пароль должен должен быть минимум 5 символов ').isLength({
		min: 5,
	}),
	body('firstName', 'Укажите имя').isLength({ min: 3 }),
	body('lastName', 'Укажите имя').isLength({ min: 3 }),
	body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(),
]
