const express = require('express');
const {
    addAiTransaction,
    addDebt,
    addInvestment,
    getDashboard,
    getForwardingConfig,
    getInsights,
    scanBill
} = require('../Controllers/FinanceController');

const router = express.Router();

router.get('/dashboard', getDashboard);
router.get('/inbox/config', getForwardingConfig);
router.get('/insights', getInsights);
router.post('/ai-entry', addAiTransaction);
router.post('/scan-bill', scanBill);
router.post('/investments', addInvestment);
router.post('/debts', addDebt);

module.exports = router;
