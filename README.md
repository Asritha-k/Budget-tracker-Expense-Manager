# 💰 Budget Tracker & Expense Manager

A full-stack web application that helps users **track expenses**, **manage income**, **set budgets**, and gain **insightful analytics** into their financial habits.

---

## 📌 Features

- Add, update, and delete expense/income entries
- Categorize transactions (e.g., Food, Bills, Salary)
- Set budget limits for different categories
- View monthly summaries and spending trends
- Responsive and user-friendly UI

---

## 🧱 Tech Stack

| Layer      | Technology        |
|------------|-------------------|
| Frontend   | HTML, CSS, JavaScript |
| Backend    | Node.js, Express.js |
| Database   | MySQL              |

---

## 🛠️ Getting Started

### 📂 Clone the Repository

```bash
git clone https://github.com/Asritha-k/Budget-tracker-Expense-Manager.git
cd Budget-tracker-Expense-Manager

Backend Setup
Install dependencies
npm install

Set up MySQL Database
Create a new MySQL database (e.g., budget_tracker)
Import the SQL schema from /db/schema.sql (or your schema location)
Update your MySQL config in your backend code:
const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_mysql_username',
  password: 'your_mysql_password',
  database: 'budget_tracker'
});
Start the backend
node app.js

🌐 Frontend Setup
If you’re using plain HTML/CSS/JS:

Open index.html in your browser
If you’re using a frontend framework:

cd client
npm install
npm start
