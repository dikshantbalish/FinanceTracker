const jwt = require("jsonwebtoken");
const UserModel = require("../Models/User");
const {
    generateInsights,
    parseTransactionFromEmail,
    parseTransactionFromImage,
    parseTransactionFromText,
    recommendedModel
} = require("../Services/FinanceAIService");

const financeInboxLocalPart = process.env.FINANCE_FORWARD_LOCAL_PART || "receipts";
const financeInboxDomain = process.env.FINANCE_FORWARD_DOMAIN || "";
const financeInboxAddressTemplate = process.env.FINANCE_FORWARD_ADDRESS_TEMPLATE || "";
const financeInboxProvider = process.env.FINANCE_INBOX_PROVIDER || "Webhook automation";

const sortByNewest = (items = []) => {
    return items.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const escapeRegex = (value = "") => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const pickFirstValue = (value) => {
    if (Array.isArray(value)) {
        return value[0] || "";
    }

    return value || "";
};

const extractEmailAddress = (value = "") => {
    const source = pickFirstValue(value);
    const match = String(source).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return match ? match[0].toLowerCase() : "";
};

const getInboxTokenSecret = () => {
    return process.env.FINANCE_INBOX_SIGNING_SECRET || process.env.JWT_SECRET || "";
};

const createInboxToken = (userId) => {
    const secret = getInboxTokenSecret();
    if (!secret || !userId) {
        return "";
    }

    return jwt.sign(
        {
            scope: "finance-inbox",
            sub: String(userId)
        },
        secret
    );
};

const resolveInboxToken = (value = "") => {
    const secret = getInboxTokenSecret();
    if (!secret || !value) {
        return "";
    }

    try {
        const parsed = jwt.verify(String(value), secret);
        if (parsed?.scope !== "finance-inbox" || !parsed?.sub) {
            return "";
        }

        return String(parsed.sub);
    } catch (error) {
        return "";
    }
};

const getFinanceInboxAddress = (userId) => {
    if (financeInboxAddressTemplate) {
        return financeInboxAddressTemplate.replace(/\{\{\s*userId\s*\}\}/g, String(userId));
    }

    if (!financeInboxDomain) {
        return "";
    }

    return `${financeInboxLocalPart}+${userId}@${financeInboxDomain}`;
};

const extractUserIdFromRecipient = (recipientValue = "") => {
    if (!financeInboxDomain) {
        return "";
    }

    const recipient = extractEmailAddress(recipientValue);
    const recipientPattern = new RegExp(
        `^${escapeRegex(financeInboxLocalPart)}\\+([^@]+)@${escapeRegex(financeInboxDomain)}$`,
        "i"
    );

    return recipient.match(recipientPattern)?.[1] || "";
};

const getWebhookSecret = () => {
    return process.env.FINANCE_INBOX_WEBHOOK_SECRET || "";
};

const getPublicBaseUrl = (req) => {
    const explicitBaseUrl = (
        process.env.FINANCE_INBOX_PUBLIC_BASE_URL
        || process.env.PUBLIC_API_BASE_URL
        || process.env.RENDER_EXTERNAL_URL
        || process.env.API_BASE_URL
        || process.env.APP_BASE_URL
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
    );

    if (explicitBaseUrl) {
        return explicitBaseUrl.replace(/\/+$/g, "");
    }

    const forwardedHost = pickFirstValue(req.headers["x-forwarded-host"]);
    const host = forwardedHost || req.get("host") || "";
    const forwardedProto = pickFirstValue(req.headers["x-forwarded-proto"]);
    const protocol = forwardedProto || req.protocol || "http";

    if (!host) {
        return "";
    }

    return `${protocol}://${host}`.replace(/\/+$/g, "");
};

const isPublicWebhookReady = (baseUrl = "") => {
    if (!baseUrl) {
        return false;
    }

    try {
        const parsed = new URL(baseUrl);
        return !/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(parsed.hostname);
    } catch (error) {
        return false;
    }
};

const buildWebhookUrl = (req, userId) => {
    const token = createInboxToken(userId);
    const baseUrl = getPublicBaseUrl(req);

    if (!baseUrl || !token) {
        return "";
    }

    const webhookUrl = new URL("/finance/inbox/webhook", `${baseUrl}/`);
    webhookUrl.searchParams.set("token", token);
    return webhookUrl.toString();
};

const buildForwardingConfig = (req, userId) => {
    const forwardingAddress = getFinanceInboxAddress(userId);
    const publicBaseUrl = getPublicBaseUrl(req);
    const publicWebhookReady = isPublicWebhookReady(publicBaseUrl);
    const webhookUrl = buildWebhookUrl(req, userId);
    const emailAddressEnabled = Boolean(forwardingAddress);
    const webhookEnabled = Boolean(webhookUrl);
    const ingestionMode = emailAddressEnabled ? "email-address" : (webhookEnabled ? "webhook" : "not-ready");

    let instructions = [];

    if (emailAddressEnabled) {
        instructions = [
            "Forward bill or receipt emails directly to the dedicated inbox below.",
            "Keep the sender, subject, and receipt body intact so the parser can identify the merchant and amount.",
            "If you also use Gmail or Outlook automations, point them to the secure webhook URL as a fallback."
        ];
    } else if (publicWebhookReady && webhookEnabled) {
        instructions = [
            "Connect Gmail, Outlook, or another mailbox to Make, Zapier, Pipedream, or n8n.",
            "Trigger the workflow on new receipt emails, then POST the email subject, from, text, and html fields to the secure webhook URL below.",
            "This runs in real time and avoids fake inbox domains completely."
        ];
    } else {
        instructions = [
            "Deploy the backend to a public HTTPS URL or expose it with a tunnel such as ngrok or Cloudflare Tunnel.",
            "Set FINANCE_INBOX_PUBLIC_BASE_URL so the app can generate a real webhook URL for Gmail or Outlook automations.",
            "Optional: configure FINANCE_FORWARD_DOMAIN or FINANCE_FORWARD_ADDRESS_TEMPLATE only if you own a real inbound email domain."
        ];
    }

    return {
        forwardingAddress,
        webhookUrl,
        provider: financeInboxProvider,
        localPart: financeInboxLocalPart,
        domain: financeInboxDomain,
        emailAddressEnabled,
        webhookEnabled,
        ingestionMode,
        publicWebhookReady,
        publicBaseUrl,
        billScanningEnabled: Boolean(process.env.OPENAI_API_KEY),
        automationProviders: ["Make", "Zapier", "Pipedream", "n8n"],
        supportedSenders: ["Swiggy", "Zomato", "Amazon", "Blinkit", "Uber", "Ola"],
        instructions
    };
};

const buildDashboardPayload = (userData) => {
    const expenses = sortByNewest(userData?.expenses || []);
    const investments = sortByNewest(userData?.investments || []);
    const debts = sortByNewest(userData?.debts || []);

    const income = expenses
        .filter((item) => item.amount > 0)
        .reduce((sum, item) => sum + item.amount, 0);

    const expense = Math.abs(expenses
        .filter((item) => item.amount < 0)
        .reduce((sum, item) => sum + item.amount, 0));

    const balance = income - expense;
    const savingsRate = income > 0 ? Number(((balance / income) * 100).toFixed(1)) : 0;

    const investmentValue = investments.reduce((sum, item) => sum + (item.currentValue || 0), 0);
    const investedAmount = investments.reduce((sum, item) => sum + (item.amountInvested || 0), 0);
    const debtBalance = debts.reduce((sum, item) => sum + (item.balance || 0), 0);
    const monthlyEmi = debts.reduce((sum, item) => sum + (item.emi || 0), 0);

    const expenseByCategory = expenses
        .filter((item) => item.amount < 0)
        .reduce((acc, item) => {
            const key = item.category || "General";
            acc[key] = (acc[key] || 0) + Math.abs(item.amount);
            return acc;
        }, {});

    const topExpenseCategory = Object.entries(expenseByCategory)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    const upcomingPayments = debts
        .filter((item) => item.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3)
        .map((item) => ({
            title: item.title,
            dueDate: item.dueDate,
            emi: item.emi
        }));

    return {
        profile: {
            name: userData?.name || "User"
        },
        summary: {
            income,
            expense,
            balance,
            savingsRate,
            investmentValue,
            investedAmount,
            debtBalance,
            monthlyEmi,
            topExpenseCategory
        },
        expenses,
        investments,
        debts,
        alerts: {
            upcomingPayments,
            overspending: savingsRate < 20 ? "Savings rate has dropped below a healthy level." : ""
        },
        recommendedModel
    };
};

const getDashboard = async (req, res) => {
    const { _id } = req.user;

    try {
        const userData = await UserModel.findById(_id).select("name expenses investments debts");
        return res.status(200).json({
            success: true,
            data: buildDashboardPayload(userData)
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to fetch finance dashboard",
            error: err
        });
    }
};

const getForwardingConfig = async (req, res) => {
    const { _id } = req.user;

    return res.status(200).json({
        success: true,
        data: buildForwardingConfig(req, _id)
    });
};

const addInvestment = async (req, res) => {
    const { _id } = req.user;
    const payload = {
        name: req.body.name,
        type: req.body.type || "Mutual Fund",
        amountInvested: Number(req.body.amountInvested || 0),
        currentValue: Number(req.body.currentValue || 0),
        expectedRate: Number(req.body.expectedRate || 12),
        years: Number(req.body.years || 5),
        monthlyContribution: Number(req.body.monthlyContribution || 0)
    };

    try {
        const userData = await UserModel.findByIdAndUpdate(
            _id,
            { $push: { investments: payload } },
            { new: true }
        ).select("investments");

        return res.status(200).json({
            success: true,
            message: "Investment added successfully",
            data: sortByNewest(userData?.investments)
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to add investment",
            error: err
        });
    }
};

const addDebt = async (req, res) => {
    const { _id } = req.user;
    const payload = {
        title: req.body.title,
        type: req.body.type || "Loan",
        totalAmount: Number(req.body.totalAmount || 0),
        balance: Number(req.body.balance || 0),
        interestRate: Number(req.body.interestRate || 10),
        emi: Number(req.body.emi || 0),
        monthsLeft: Number(req.body.monthsLeft || 12),
        dueDate: req.body.dueDate || ""
    };

    try {
        const userData = await UserModel.findByIdAndUpdate(
            _id,
            { $push: { debts: payload } },
            { new: true }
        ).select("debts");

        return res.status(200).json({
            success: true,
            message: "Debt added successfully",
            data: sortByNewest(userData?.debts)
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to add debt",
            error: err
        });
    }
};

const getInsights = async (req, res) => {
    const { _id } = req.user;

    try {
        const userData = await UserModel.findById(_id).select("name expenses investments debts");
        const dashboard = buildDashboardPayload(userData);
        const insights = await generateInsights(dashboard);

        return res.status(200).json({
            success: true,
            data: insights
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to generate AI insights",
            error: err
        });
    }
};

const addAiTransaction = async (req, res) => {
    const { _id } = req.user;
    const source = req.body.source || "voice";
    const text = req.body.text || "";

    if (!text.trim()) {
        return res.status(400).json({
            success: false,
            message: "Text input is required"
        });
    }

    try {
        const transaction = await parseTransactionFromText({ text, source });
        const userData = await UserModel.findByIdAndUpdate(
            _id,
            { $push: { expenses: transaction } },
            { new: true }
        ).select("expenses");

        return res.status(200).json({
            success: true,
            message: "AI transaction added successfully",
            data: sortByNewest(userData?.expenses),
            transaction
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to process AI transaction",
            error: err
        });
    }
};

const scanBill = async (req, res) => {
    const { _id } = req.user;
    const imageDataUrl = req.body.imageDataUrl;

    if (!imageDataUrl) {
        return res.status(400).json({
            success: false,
            message: "Bill image is required"
        });
    }

    try {
        const transaction = await parseTransactionFromImage({
            imageDataUrl,
            source: "bill"
        });

        const userData = await UserModel.findByIdAndUpdate(
            _id,
            { $push: { expenses: transaction } },
            { new: true }
        ).select("expenses");

        return res.status(200).json({
            success: true,
            message: "Bill scanned and transaction added successfully",
            data: sortByNewest(userData?.expenses),
            transaction
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message || "Unable to scan bill",
            error: err
        });
    }
};

const receiveForwardedEmail = async (req, res) => {
    const configuredSecret = getWebhookSecret();
    const providedSecret = pickFirstValue(
        req.headers["x-finance-inbox-secret"] || req.body.secret || req.query.secret
    );
    const tokenUserId = resolveInboxToken(
        pickFirstValue(req.headers["x-finance-inbox-token"] || req.body.token || req.query.token)
    );

    if (!tokenUserId && configuredSecret && providedSecret !== configuredSecret) {
        return res.status(401).json({
            success: false,
            message: "Invalid inbox webhook secret"
        });
    }

    const recipient = extractEmailAddress(
        req.body.to
        || req.body.recipient
        || req.body.envelope?.to
        || req.body.headers?.to
        || req.body.email?.to
        || req.body.payload?.to
        || req.body.message?.to
        || req.body.destination
    );
    const trustedUserId = (!tokenUserId && configuredSecret && providedSecret === configuredSecret)
        ? pickFirstValue(req.body.userId || req.query.userId || req.headers["x-finance-user-id"])
        : "";
    const userId = tokenUserId || trustedUserId || extractUserIdFromRecipient(recipient);
    const subject = pickFirstValue(
        req.body.subject
        || req.body.email?.subject
        || req.body.payload?.subject
        || req.body.message?.subject
    );
    const text = pickFirstValue(
        req.body.text
        || req.body.textBody
        || req.body.plain
        || req.body.body
        || req.body.bodyPlain
        || req.body.strippedText
        || req.body.snippet
        || req.body.email?.text
        || req.body.payload?.text
        || req.body.message?.text
        || req.body.message?.plainText
    );
    const html = pickFirstValue(
        req.body.html
        || req.body.htmlBody
        || req.body.bodyHtml
        || req.body.strippedHtml
        || req.body.email?.html
        || req.body.payload?.html
        || req.body.message?.html
    );
    const from = extractEmailAddress(
        req.body.from
        || req.body.sender
        || req.body.email?.from
        || req.body.payload?.from
        || req.body.message?.from
    );

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "Unable to resolve the finance inbox user"
        });
    }

    if (!subject && !text && !html) {
        return res.status(400).json({
            success: false,
            message: "Forwarded email payload is empty"
        });
    }

    try {
        const transaction = await parseTransactionFromEmail({
            subject,
            text,
            html,
            from,
            source: "email"
        });

        const userData = await UserModel.findByIdAndUpdate(
            userId,
            { $push: { expenses: transaction } },
            { new: true }
        ).select("expenses");

        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "Finance inbox user not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Forwarded receipt processed successfully",
            data: sortByNewest(userData?.expenses),
            transaction
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to process forwarded receipt email",
            error: err
        });
    }
};

module.exports = {
    addAiTransaction,
    addDebt,
    addInvestment,
    getDashboard,
    getForwardingConfig,
    getInsights,
    receiveForwardedEmail,
    scanBill
};
