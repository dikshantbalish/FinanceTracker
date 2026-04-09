const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    expenses: [
        {
            text: {
                type: String,
                required: true
            },
            category: {
                type: String,
                default: 'General'
            },
            source: {
                type: String,
                default: 'manual'
            },
            amount: {
                type: Number,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    investments: [
        {
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                default: 'Mutual Fund'
            },
            amountInvested: {
                type: Number,
                required: true
            },
            currentValue: {
                type: Number,
                required: true
            },
            expectedRate: {
                type: Number,
                default: 12
            },
            years: {
                type: Number,
                default: 5
            },
            monthlyContribution: {
                type: Number,
                default: 0
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    debts: [
        {
            title: {
                type: String,
                required: true
            },
            type: {
                type: String,
                default: 'Loan'
            },
            totalAmount: {
                type: Number,
                required: true
            },
            balance: {
                type: Number,
                required: true
            },
            interestRate: {
                type: Number,
                default: 10
            },
            emi: {
                type: Number,
                required: true
            },
            monthsLeft: {
                type: Number,
                default: 12
            },
            dueDate: {
                type: String,
                default: ''
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
