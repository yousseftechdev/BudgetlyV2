const form = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const list = document.getElementById("transaction-list");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const themeToggle = document.getElementById("theme-toggle");
const clearTransactionsBtn = document.getElementById("clear-transactions");

let transactions = loadTransactions();

renderTransactions();
updateSummary();

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const type = typeInput.value;
    const category = categoryInput.value.trim();
    const amount = parseFloat(amountInput.value);
    if (!category || isNaN(amount) || amount <= 0) return;

    const newTransaction = {
        id: Date.now(),
        type,
        category,
        amount,
        date: new Date().toISOString().split("T")[0]
    };

    transactions.push(newTransaction);
    saveTransactions(transactions);
    renderTransactions();
    updateSummary();
    form.reset();
});

function saveThemeState(isDark) {
    document.cookie = `theme=${isDark ? "dark" : "light"}; path=/`;
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
    document.body.style.setProperty("--glass-bg", isDark ? "rgba(47, 54, 64, 0.3)" : "rgba(255, 255, 255, 0.7)");
    typeInput.style.setProperty("color", isDark ? "#fff" : "#000");
    categoryInput.style.setProperty("color", isDark ? "#fff" : "#000");
    amountInput.style.setProperty("color", isDark ? "#fff" : "#000");
}

themeToggle.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark-theme");
    applyTheme(isDark);
    saveThemeState(isDark);
});

// Apply theme on page load
applyTheme(loadThemeState() === "dark");

clearTransactionsBtn.addEventListener("click", () => {
    transactions = [];
    saveTransactions(transactions);
    renderTransactions();
    updateSummary();
});

function renderTransactions() {
    list.innerHTML = "";
    transactions.forEach(({ id, type, category, amount, date }) => {
        const li = document.createElement("li");
        li.className = type;
        li.innerHTML = `
      <span>${date} | ${category}</span>
      <span>${type === "income" ? "+" : "-"}${amount} EGP</span>
      <button onclick="deleteTransaction(${id})">✖</button>
    `;
        list.appendChild(li);
    });
}

function updateSummary() {
    const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    totalIncomeEl.textContent = income.toFixed(2);
    totalExpenseEl.textContent = expense.toFixed(2);
    balanceEl.textContent = balance.toFixed(2);
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions(transactions);
    renderTransactions();
    updateSummary();
}

function saveTransactions(data) {
    document.cookie = "transactions=" + encodeURIComponent(JSON.stringify(data)) + "; path=/";
}

function loadTransactions() {
    const cookies = document.cookie.split("; ");
    const match = cookies.find(c => c.startsWith("transactions="));
    if (!match) return [];
    try {
        return JSON.parse(decodeURIComponent(match.split("=")[1]));
    } catch (e) {
        return [];
    }
}
