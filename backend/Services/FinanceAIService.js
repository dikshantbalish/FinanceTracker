const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const OpenAIImport = require("openai");
const OpenAI = OpenAIImport.default || OpenAIImport;



const CONFIG = {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    insightsBackoffMs: 5 * 60 * 1000,
    maxTextLength: 80,
};



let _client = null;

const getClient = () => {
    if (!process.env.OPENAI_API_KEY) return null;
    if (!_client) {
        _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _client;
};


const safeJsonParse = (value) => {
    try { return JSON.parse(value); } catch { return null; }
};

const normalizeAmount = (value) => {
    const num = Number(String(value || 0).replace(/,/g, ""));
    return Number.isFinite(num) ? Math.abs(num) : 0;
};

const stripHtml = (html = "") =>
    String(html)
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const extractResponseText = (response) => {
    if (response?.output_text) return response.output_text;
    return (response?.output || [])
        .flatMap((item) => item.content || [])
        .map((item) => item.text || "")
        .join("\n")
        .trim();
};

const CATEGORY_RULES = [
    { pattern: /salary|freelance|income|credited|bonus|refund|received/, label: "Income" },
    { pattern: /swiggy|zomato|food|restaurant|coffee|grocer|milk|snack/, label: "Food" },
    { pattern: /uber|ola|taxi|petrol|fuel|train|bus|metro/, label: "Transport" },
    { pattern: /rent|emi|loan|maintenance|electricity|water|internet|wifi/, label: "Bills" },
    { pattern: /amazon|shopping|myntra|flipkart|store/, label: "Shopping" },
    { pattern: /sip|stock|mutual fund|investment/, label: "Investment" },
];

const categorizeText = (text = "") => {
    const lower = text.toLowerCase();
    const match = CATEGORY_RULES.find(({ pattern }) => pattern.test(lower));
    return match ? match.label : "General";
};


const ERROR_MESSAGES = {
    401: "OpenAI rejected the API key. Verify OPENAI_API_KEY in backend/.env, then restart the backend server.",
    403: "Your OpenAI project does not have access to the selected model. Try a different OPENAI_MODEL or enable access for this project.",
    429: "OpenAI rate limit or billing limit reached. Check your project usage and billing, then try again.",
};

const formatOpenAIError = (error, fallbackMessage) => {
    const status = Number(error?.status || 0);
    const known = ERROR_MESSAGES[status];
    if (known) return known;
    const message = String(error?.message || "").trim();
    return message ? `OpenAI request failed: ${message}` : fallbackMessage;
};

const isRateLimitError = (error) => Number(error?.status || 0) === 429;


let insightsBackoffUntil = 0;

const isInBackoff = () => insightsBackoffUntil > Date.now();

const activateBackoff = () => {
    insightsBackoffUntil = Date.now() + CONFIG.insightsBackoffMs;
};


const TRANSACTION_SYSTEM_PROMPT =
    "Extract a finance transaction and return strict JSON with keys: " +
    "text, category, amount, transactionType, createdAt. " +
    "transactionType must be either 'expense' or 'income'. " +
    "amount must be numeric and positive before sign conversion. " +
    "createdAt should be ISO date when available, otherwise current date.";

const callAI = async (userContent, { throwOnError = false } = {}) => {
    const client = getClient();
    if (!client) return null;

    try {
        const response = await client.responses.create({
            model: CONFIG.model,
            input: [
                {
                    role: "system",
                    content: [{ type: "input_text", text: TRANSACTION_SYSTEM_PROMPT }],
                },
                { role: "user", content: userContent },
            ],
        });
        return safeJsonParse(extractResponseText(response));
    } catch (error) {
        if (throwOnError) {
            throw new Error(formatOpenAIError(error, "Unable to reach OpenAI right now."));
        }
        return null;
    }
};


const normalizeAiTransaction = (parsed, source) => {
    const amount = normalizeAmount(parsed?.amount);
    const type = String(parsed?.transactionType || "expense").toLowerCase();
    const rawDate = parsed?.createdAt ? new Date(parsed.createdAt) : new Date();

    return {
        text: String(parsed?.text || "Smart finance entry").slice(0, CONFIG.maxTextLength),
        category: String(parsed?.category || "General"),
        amount: type === "income" ? amount : -amount,
        source,
        createdAt: Number.isNaN(rawDate.getTime()) ? new Date() : rawDate,
    };
};


const fallbackParseTransaction = ({ text, source = "manual" }) => {
    const amountMatch = text.match(/(?:rs\.?|inr|₹)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i);
    const amount = normalizeAmount(amountMatch?.[1] || 0);
    const isIncome = /salary|income|credited|refund|received|bonus|freelance/.test(text.toLowerCase());

    return {
        text: text.trim().slice(0, CONFIG.maxTextLength) || "Smart entry",
        category: categorizeText(text),
        amount: isIncome ? amount : -amount,
        source,
        createdAt: new Date(),
    };
};

const generateFallbackInsights = (dashboard, notice = "") => {
    const { savingsRate, monthlyEmi, income, topExpenseCategory, balance } = dashboard.summary;
    const upcomingCount = dashboard.alerts?.upcomingPayments?.length || 0;

    const priorities = [];

    if (savingsRate < 20) {
        priorities.push("Your savings rate is low. Try to protect at least 20% of income before increasing discretionary spending.");
    } else {
        priorities.push("Your current cash flow is healthy. Move part of the surplus into SIPs or debt reduction automatically.");
    }

    if (monthlyEmi > income * 0.3) {
        priorities.push("Loan pressure is high relative to income. Avoid taking new EMIs until existing balances are lower.");
    } else if (upcomingCount > 0) {
        priorities.push(`You have ${upcomingCount} upcoming payment reminder(s). Keep that cash reserved first.`);
    }

    if (topExpenseCategory) {
        priorities.push(`Your highest expense category is ${topExpenseCategory}. Review that bucket for easy savings opportunities.`);
    } else {
        priorities.push("Track a few more transactions to unlock sharper spending analysis and category-level recommendations.");
    }

    if (priorities.length < 3) {
        priorities.push("Keep all spending, investing, and loan activity in one place so the dashboard can flag risks earlier.");
    }

    return {
        headline: balance >= 0
            ? "Your finances are under control, and the next opportunity is turning surplus into long-term growth."
            : "Your recent spending is putting pressure on balance, so cash-flow discipline should be the immediate focus.",
        priorities: priorities.slice(0, 3),
        knowledge: "Consistent expense capture matters more than perfect budgeting. When financial data is captured quickly, decisions improve naturally.",
        source: "fallback",
        recommendedModel: CONFIG.model,
        notice,
    };
};


const parseTransactionFromText = async ({ text, source }) => {
    const parsed = await callAI([{ type: "input_text", text }]);
    return parsed
        ? normalizeAiTransaction(parsed, source)
        : fallbackParseTransaction({ text, source });
};

const parseTransactionFromEmail = async ({ subject = "", text = "", html = "", from = "", source }) => {
    const combined = [
        subject && `Subject: ${subject}`,
        from     && `From: ${from}`,
        text     && `Body: ${text}`,
        html     && `HTML Snapshot: ${stripHtml(html)}`,
    ].filter(Boolean).join("\n");

    const parsed = await callAI([
        { type: "input_text", text: "Read this forwarded receipt email and extract the most likely single transaction. Prefer merchant, category, amount, purchase date, and whether it is an expense or income." },
        { type: "input_text", text: combined },
    ]);

    return parsed
        ? normalizeAiTransaction(parsed, source)
        : fallbackParseTransaction({ text: combined, source });
};

const parseTransactionFromImage = async ({ imageDataUrl, source }) => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("Bill scanning is not enabled. Add OPENAI_API_KEY to backend/.env and restart the backend server.");
    }

    const parsed = await callAI(
        [
            { type: "input_text", text: "Read this bill or receipt and extract the most likely single transaction." },
            { type: "input_image", image_url: imageDataUrl },
        ],
        { throwOnError: true }
    );

    if (!parsed) {
        throw new Error("Bill scanning could not reach OpenAI. Verify OPENAI_API_KEY, OPENAI_MODEL, and restart the backend server.");
    }

    return normalizeAiTransaction(parsed, source);
};

const generateInsights = async (dashboard) => {
    const client = getClient();
    const fallback = generateFallbackInsights(
        dashboard,
        isInBackoff() ? "OpenAI is temporarily unavailable, so the app is using built-in finance insights for now." : ""
    );

    if (!client || isInBackoff()) return fallback;

    try {
        const response = await client.responses.create({
            model: CONFIG.model,
            input: [
                {
                    role: "system",
                    content: [{
                        type: "input_text",
                        text: "You are a smart personal finance assistant. Return strict JSON with keys headline, priorities, knowledge. priorities must be an array of exactly 3 short actionable strings. Focus on overspending warnings, payment reminders, and investment opportunities.",
                    }],
                },
                {
                    role: "user",
                    content: [{ type: "input_text", text: JSON.stringify(dashboard) }],
                },
            ],
        });

        const parsed = safeJsonParse(extractResponseText(response));
        if (!parsed) return fallback;

        return {
            headline: parsed.headline || fallback.headline,
            priorities: Array.isArray(parsed.priorities) && parsed.priorities.length
                ? parsed.priorities.slice(0, 3)
                : fallback.priorities,
            knowledge: parsed.knowledge || fallback.knowledge,
            source: CONFIG.model,
            recommendedModel: CONFIG.model,
            notice: "",
        };
    } catch (error) {
        const msg = formatOpenAIError(error, "Unable to generate AI insights");

        if (isRateLimitError(error)) {
            activateBackoff();
            console.warn("OpenAI insights fallback:", msg);
            return generateFallbackInsights(
                dashboard,
                "OpenAI is temporarily unavailable, so the app is using built-in finance insights for now."
            );
        }

        console.error("OpenAI insights error:", msg);
        return fallback;
    }
};

module.exports = {
    recommendedModel: CONFIG.model,
    generateInsights,
    parseTransactionFromEmail,
    parseTransactionFromImage,
    parseTransactionFromText,
};