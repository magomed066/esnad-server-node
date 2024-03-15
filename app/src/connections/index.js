import {
	CuratorWallet,
	Deal,
	Investment,
	Transaction,
	User,
	Payment,
	Client,
	Guarantor,
	GuarantorToDeal,
	CuratorToMainWalletTransaction,
	PaymentTransaction,
	Category,
	Partner,
	PaymentTransactionCart,
	Expense,
	ExpenseCategory,
	InvestorWallet,
	CuratorProfitPercentage,
	DepositTransaction,
	InvestorInfo,
	Withdrawal,
} from '../models/index.js'
import InvestorConfidant from '../models/investor-confidant/index.js'

User.hasOne(CuratorWallet, { foreignKey: 'curatorId' })
User.hasOne(InvestorWallet, { foreignKey: 'investorId' })
User.hasOne(CuratorProfitPercentage, { foreignKey: 'curatorId' })

User.hasMany(Transaction, { as: 'userId' })

Transaction.belongsTo(User, { as: 'toUser', foreignKey: 'to_user_id' })
Transaction.belongsTo(User, { as: 'fromUser', foreignKey: 'from_user_id' })

User.hasMany(Deal, { foreignKey: 'curator_id' })
Deal.belongsTo(User, { as: 'curator', foreignKey: 'curator_id' })

Investment.belongsTo(User, { as: 'investor', foreignKey: 'investor_id' })
User.hasMany(Investment, { foreignKey: 'investor_id' })

InvestorInfo.belongsTo(User, { as: 'investor', foreignKey: 'investorId' })
User.hasMany(InvestorInfo, { foreignKey: 'investorId' })

Deal.hasMany(Payment, { foreignKey: 'deal_id' })
Payment.belongsTo(Deal, { foreignKey: 'deal_id', as: 'payment' })

Deal.hasOne(DepositTransaction, { foreignKey: 'dealId' })
DepositTransaction.belongsTo(Deal, {
	foreignKey: 'dealId',
	as: 'deposit_transaction',
})

Deal.belongsTo(Client, { foreignKey: 'client_id', as: 'client' })

// Связи между категориями и сделками
Deal.belongsTo(Category, { foreignKey: 'category_id', as: 'category' })
Category.hasMany(Deal, { foreignKey: 'category_id', as: 'deals' })
// Связи между категориями и партнерами
Deal.belongsTo(Partner, { foreignKey: 'partner_id', as: 'partner' })
Partner.hasMany(Deal, { foreignKey: 'partner_id', as: 'partners' })

User.hasMany(CuratorToMainWalletTransaction, { foreignKey: 'curatorId' })
CuratorToMainWalletTransaction.belongsTo(User, {
	as: 'curator',
	foreignKey: 'curatorId',
})

// Связи для расходов
Expense.belongsTo(ExpenseCategory, {
	foreignKey: 'expense_category_id',
	as: 'expense_category',
})
ExpenseCategory.hasMany(Expense, {
	foreignKey: 'expense_category_id',
	as: 'expenses',
})

Payment.hasMany(PaymentTransaction, { as: 'transactions' })
PaymentTransaction.belongsTo(Payment)

// Устанавливаем связь с моделью Transaction
PaymentTransactionCart.belongsTo(PaymentTransaction, {
	foreignKey: 'payment_transaction_id',
	as: 'transaction', // Псевдоним, который можно использовать для обращения к связанным транзакциям
})

PaymentTransaction.hasMany(PaymentTransactionCart, {
	foreignKey: 'payment_transaction_id',
	as: 'carts', // Псевдоним, который можно использовать для обращения к связанным корзинам
})

User.hasOne(InvestorConfidant, { foreignKey: 'investor_id' })
InvestorConfidant.belongsTo(User, {
	as: 'investor_confident',
	foreignKey: 'investor_id',
})

// Ассоциация для сделки (Deal)
Deal.belongsToMany(Guarantor, {
	through: GuarantorToDeal,
	foreignKey: 'deal_id',
	otherKey: 'guarantor_id',
})

// Ассоциация для поручителя (Guarantor)
Guarantor.belongsToMany(Deal, {
	through: GuarantorToDeal,
	foreignKey: 'guarantor_id',
	otherKey: 'deal_id',
})

Withdrawal.belongsTo(User, { foreignKey: 'investor_id', as: 'investor' })
User.hasMany(Withdrawal, { foreignKey: 'investor_id', as: 'withdrawals' })
