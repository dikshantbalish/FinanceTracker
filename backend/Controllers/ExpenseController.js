const UserModel = require("../Models/User");

const addTransaction = async (req, res) => {
    const { _id } = req.user;
    const payload = {
        text: req.body.text,
        amount: Number(req.body.amount),
        category: req.body.category || 'General',
        source: req.body.source || 'manual',
        createdAt: req.body.createdAt || new Date()
    };

    try {
        const userData = await UserModel.findByIdAndUpdate(
            _id,
            { $push: { expenses: payload } },
            { new: true } // For Returning the updated documents
        )
        res.status(200)
            .json({
                message: "Transaction added successfully",
                success: true,
                data: userData?.expenses?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            })
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err,
            success: false
        })
    }
}

const getAllTransactions = async (req, res) => {
    const { _id } = req.user;
    try {
        const userData = await UserModel.findById(_id).select('expenses');
        res.status(200)
            .json({
                message: "Fetched transactions successfully",
                success: true,
                data: userData?.expenses?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            })
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err,
            success: false
        })
    }
}

const deleteTransaction = async (req, res) => {
    const { _id } = req.user;
    const expenseId = req.params.expenseId;
    try {
        const userData = await UserModel.findByIdAndUpdate(
            _id,
            { $pull: { expenses: { _id: expenseId } } },
            { new: true } // For Returning the updated documents
        )
        res.status(200)
            .json({
                message: "Transaction deleted successfully",
                success: true,
                data: userData?.expenses?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            })
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err,
            success: false
        })
    }
}

module.exports = {
    addTransaction,
    getAllTransactions,
    deleteTransaction
}
