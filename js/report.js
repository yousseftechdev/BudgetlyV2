// === report.js ===

function getTransactions() {
    const cookies = document.cookie.split("; ");
    const match = cookies.find(c => c.startsWith("transactions="));
    if (!match) return [];
    try {
        return JSON.parse(decodeURIComponent(match.split("=")[1]));
    } catch (e) {
        return [];
    }
}

function generatePieData(transactions) {
    const totals = { income: 0, expense: 0 };
    const categories = {};

    transactions.forEach(t => {
        totals[t.type] += t.amount;
        if (!categories[t.category]) categories[t.category] = 0;
        categories[t.category] += t.amount;
    });

    return { totals, categories };
}

function buildConicGradient(data, colors) {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    let current = 0;
    let segments = [];
    let index = 0;

    for (const key in data) {
        const percent = (data[key] / total) * 100;
        const start = current;
        const end = current + percent;
        segments.push(`${colors[index % colors.length]} ${start}% ${end}%`);
        current = end;
        index++;
    }

    return `conic-gradient(${segments.join(", ")})`;
}

function renderLegend(container, data, colors) {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    container.innerHTML = "<ul>" + Object.entries(data).map(([key, value], i) => {
        const percentage = ((value / total) * 100).toFixed(2);
        return `<li><span style="background:${colors[i % colors.length]}"></span> ${key}: ${value} (${percentage}%)</li>`;
    }).join("") + "</ul>";
}

function loadThemeState() {
    const cookies = document.cookie.split("; ");
    const match = cookies.find(c => c.startsWith("theme="));
    return match ? match.split("=")[1] : "dark"; // Default to dark mode
}

function applyTheme(isDark) {
    document.body.classList.toggle("dark-theme", isDark);
    document.body.style.setProperty("--background-color", isDark ? "#2f3640" : "#f5f6fa");
    document.body.style.setProperty("--text-color", isDark ? "#f5f6fa" : "#2f3640");
    document.body.style.setProperty("--primary-color", isDark ? "#273c75" : "#00a8ff");
    document.body.style.setProperty("--glass-bg", isDark ? "rgba(47, 54, 64, 0.7)" : "rgba(255, 255, 255, 0.7)");
}

// Apply theme on page load
applyTheme(loadThemeState() === "dark");

const transactions = getTransactions();
const { totals, categories } = generatePieData(transactions);

const pie1 = document.getElementById("type-pie");
const legend1 = document.getElementById("type-legend");
const legend2 = document.getElementById("category-legend");

const colorPalette = ["#44bd32", "#e84118", "#00a8ff", "#fbc531", "#9c88ff", "#e1b12c"];

if (Object.keys(totals).length > 0) {
    pie1.style.background = buildConicGradient(totals, ["#44bd32", "#e84118"]);
    renderLegend(legend1, totals, ["#44bd32", "#e84118"]);
}

const incomeCategories = {};
const expenseCategories = {};

transactions.forEach(t => {
    if (t.type === "income") {
        if (!incomeCategories[t.category]) incomeCategories[t.category] = 0;
        incomeCategories[t.category] += t.amount;
    } else {
        if (!expenseCategories[t.category]) expenseCategories[t.category] = 0;
        expenseCategories[t.category] += t.amount;
    }
});

const pieIncome = document.getElementById("income-category-pie");
const pieExpense = document.getElementById("expense-category-pie");
const legendIncome = document.getElementById("income-category-legend");
const legendExpense = document.getElementById("expense-category-legend");

if (Object.keys(incomeCategories).length > 0) {
    pieIncome.style.background = buildConicGradient(incomeCategories, colorPalette);
    renderLegend(legendIncome, incomeCategories, colorPalette);
}

if (Object.keys(expenseCategories).length > 0) {
    pieExpense.style.background = buildConicGradient(expenseCategories, colorPalette);
    renderLegend(legendExpense, expenseCategories, colorPalette);
}