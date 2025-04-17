"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  DollarSign,
  Filter,
  Home as Home_,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type Category =
  | "Food"
  | "Transport"
  | "Housing"
  | "Entertainment"
  | "Utilities"
  | "Shopping"
  | "Health"
  | "Other";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: Date;
  category: Category;
}

function FontLoader() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap");
      @import url("https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap");

      :root {
        --font-raleway: "Raleway", sans-serif;
        --font-biorhyme: "BioRhyme", serif;
      }

      h1,
      h2,
      h3,
      button,
      .font-heading {
        font-family: var(--font-raleway);
      }

      .display-value,
      .chart-heading,
      .brand-text {
        font-family: var(--font-biorhyme);
      }

      body {
        font-family: var(--font-oswald);
      }
    `}</style>
  );
}

const getInitialExpenses = (): Expense[] => {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  return [
    {
      id: "1",
      title: "Groceries",
      amount: 85.45,
      date: new Date(now.getTime() - 2 * oneDay),
      category: "Food",
    },
    {
      id: "2",
      title: "Electricity bill",
      amount: 120.3,
      date: new Date(now.getTime() - 5 * oneDay),
      category: "Utilities",
    },
    {
      id: "3",
      title: "Movie tickets",
      amount: 28.5,
      date: new Date(now.getTime() - 3 * oneDay),
      category: "Entertainment",
    },
    {
      id: "4",
      title: "Gas",
      amount: 45.0,
      date: new Date(now.getTime() - 1 * oneDay),
      category: "Transport",
    },
    {
      id: "5",
      title: "Rent",
      amount: 1200,
      date: new Date(now.getTime() - 7 * oneDay),
      category: "Housing",
    },
    {
      id: "6",
      title: "Restaurant",
      amount: 68.25,
      date: new Date(now.getTime() - 4 * oneDay),
      category: "Food",
    },
    {
      id: "7",
      title: "New shoes",
      amount: 89.99,
      date: new Date(now.getTime() - 6 * oneDay),
      category: "Shopping",
    },
    {
      id: "8",
      title: "Doctor visit",
      amount: 50.0,
      date: new Date(now.getTime() - 10 * oneDay),
      category: "Health",
    },
  ];
};

const CATEGORY_COLORS = {
  Food: "#FF6384",
  Transport: "#36A2EB",
  Housing: "#FFCE56",
  Entertainment: "#4BC0C0",
  Utilities: "#9966FF",
  Shopping: "#FF9F40",
  Health: "#6DD48C",
  Other: "#C9CBCF",
};

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [monthlyCap, setMonthlyCap] = useState(2000);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">(
    "All"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    amount: "",
    category: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setExpenses(getInitialExpenses());
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalSpending(total);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch = expense.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || expense.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, selectedCategory]);

  const expensesByCategory = useMemo(() => {
    const grouped = {} as Record<Category, number>;

    expenses.forEach((expense) => {
      if (grouped[expense.category]) {
        grouped[expense.category] += expense.amount;
      } else {
        grouped[expense.category] = expense.amount;
      }
    });

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const expensesByDay = useMemo(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const days = {} as Record<string, number>;

    for (let i = 0; i < 7; i++) {
      const date = new Date(lastWeek);
      date.setDate(date.getDate() + i);
      const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });
      days[dateStr] = 0;
    }

    expenses.forEach((expense) => {
      if (expense.date >= lastWeek && expense.date <= today) {
        const dateStr = expense.date.toLocaleDateString("en-US", {
          weekday: "short",
        });
        if (days[dateStr] !== undefined) {
          days[dateStr] += expense.amount;
        }
      }
    });

    return Object.entries(days).map(([name, amount]) => ({ name, amount }));
  }, [expenses]);

  const handleAddExpense = (newExpense: Omit<Expense, "id">) => {
    const expense: Expense = {
      ...newExpense,
      id: Date.now().toString(),
    };
    setExpenses([...expenses, expense]);
    setShowAddForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ease-in-out ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-800"
      }`}
    >
      <FontLoader />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute rounded-full w-64 h-64 top-0 right-0 transform translate-x-1/3 -translate-y-1/3 ${
            isDark ? "bg-indigo-800 bg-opacity-10" : "bg-blue-400 bg-opacity-10"
          } blur-3xl`}
        ></div>
        <div
          className={`absolute rounded-full w-96 h-96 bottom-0 left-0 transform -translate-x-1/3 translate-y-1/3 ${
            isDark
              ? "bg-purple-800 bg-opacity-10"
              : "bg-purple-400 bg-opacity-10"
          } blur-3xl`}
        ></div>
      </div>

      <div className="relative container mx-auto px-4 py-6">
        <header
          className={`${
            isDark ? "bg-gray-800 bg-opacity-70" : "bg-white bg-opacity-70"
          } backdrop-blur-lg rounded-2xl p-4 flex items-center justify-between shadow-lg transition-all duration-300`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`${
                isDark ? "bg-indigo-500" : "bg-blue-500"
              } w-10 h-10 flex items-center justify-center rounded-lg shadow-lg`}
            >
              <h1 className="text-xl font-bold">B</h1>
            </div>
            <h1 className="text-xl font-bold">BudgetPro</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-all duration-300 ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <h2 className="text-2xl font-bold mt-2 md:mt-0">
            Track your expenses with elegance
          </h2>
          <div className="flex items-center space-x-2">
            <Calendar
              size={18}
              className={`${isDark ? "text-indigo-400" : "text-blue-500"}`}
            />
            <span className="text-sm opacity-70">{todayFormatted}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-36 rounded-xl ${
                  isDark
                    ? "bg-gray-800 bg-opacity-50"
                    : "bg-white bg-opacity-80"
                } animate-pulse`}
              ></div>
            ))}
            <div
              className={`h-72 col-span-1 md:col-span-2 rounded-xl ${
                isDark ? "bg-gray-800 bg-opacity-50" : "bg-white bg-opacity-80"
              } animate-pulse`}
            ></div>
            <div
              className={`h-72 col-span-1 md:col-span-2 rounded-xl ${
                isDark ? "bg-gray-800 bg-opacity-50" : "bg-white bg-opacity-80"
              } animate-pulse`}
            ></div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                className={`p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? "bg-gray-800 bg-opacity-70"
                    : "bg-white bg-opacity-80"
                } backdrop-blur-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm opacity-70">Total Spent</span>
                    <span className="text-2xl font-bold mt-1">
                      ${totalSpending.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-full ${
                      isDark ? "bg-indigo-900 bg-opacity-70" : "bg-blue-100"
                    }`}
                  >
                    <DollarSign
                      size={20}
                      className={`${
                        isDark ? "text-indigo-400" : "text-blue-500"
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-opacity-20 border-gray-400">
                  <div className="flex items-center">
                    {monthlyCap > totalSpending ? (
                      <TrendingDown size={16} className="text-green-500 mr-1" />
                    ) : (
                      <TrendingUp size={16} className="text-red-500 mr-1" />
                    )}
                    <span className="text-xs">
                      {monthlyCap > totalSpending
                        ? `${(
                            ((monthlyCap - totalSpending) / monthlyCap) *
                            100
                          ).toFixed(0)}% under budget`
                        : `${(
                            ((totalSpending - monthlyCap) / monthlyCap) *
                            100
                          ).toFixed(0)}% over budget`}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? "bg-gray-800 bg-opacity-70"
                    : "bg-white bg-opacity-80"
                } backdrop-blur-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm opacity-70">Monthly Budget</span>
                    <span className="text-2xl font-bold mt-1">
                      ${monthlyCap.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-full ${
                      isDark ? "bg-purple-900 bg-opacity-70" : "bg-purple-100"
                    }`}
                  >
                    <Settings
                      size={20}
                      className={`${
                        isDark ? "text-purple-400" : "text-purple-500"
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-300 bg-opacity-30 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      totalSpending / monthlyCap < 0.7
                        ? "bg-green-500"
                        : totalSpending / monthlyCap < 1
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (totalSpending / monthlyCap) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-xs opacity-70 text-right">
                  {Math.min(100, (totalSpending / monthlyCap) * 100).toFixed(0)}
                  % used
                </div>
              </div>

              <div
                className={`p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? "bg-gray-800 bg-opacity-70"
                    : "bg-white bg-opacity-80"
                } backdrop-blur-md`}
              >
                {expenses.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm opacity-70">
                          Highest Expense
                        </span>
                        <span className="text-2xl font-bold mt-1">
                          $
                          {Math.max(...expenses.map((e) => e.amount)).toFixed(
                            2
                          )}
                        </span>
                      </div>
                      <div
                        className={`p-3 rounded-full ${
                          isDark ? "bg-red-900 bg-opacity-70" : "bg-red-100"
                        }`}
                      >
                        <ArrowUpCircle
                          size={20}
                          className={`${
                            isDark ? "text-red-400" : "text-red-500"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-opacity-20 border-gray-400">
                      <div className="flex items-center">
                        <span className="text-xs">
                          {
                            expenses.reduce((prev, current) =>
                              prev.amount > current.amount ? prev : current
                            ).title
                          }
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-70">
                    <span>No expenses yet</span>
                  </div>
                )}
              </div>

              <div
                className={`p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? "bg-gray-800 bg-opacity-70"
                    : "bg-white bg-opacity-80"
                } backdrop-blur-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm opacity-70">Categories Used</span>
                    <span className="text-2xl font-bold mt-1">
                      {[...new Set(expenses.map((e) => e.category))].length}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-full ${
                      isDark ? "bg-green-900 bg-opacity-70" : "bg-green-100"
                    }`}
                  >
                    <Filter
                      size={20}
                      className={`${
                        isDark ? "text-green-400" : "text-green-500"
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-opacity-20 border-gray-400">
                  <div className="flex items-center">
                    <span className="text-xs">
                      {expensesByCategory.length > 0
                        ? `Most spent on: ${
                            expensesByCategory.sort(
                              (a, b) => b.value - a.value
                            )[0]?.name
                          }`
                        : "No categories yet"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className={`p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? "bg-gray-800 bg-opacity-70"
                    : "bg-white bg-opacity-80"
                } backdrop-blur-md`}
              >
                <h3 className="text-lg font-bold mb-4">
                  Weekly Spending Trend
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={expensesByDay}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#4b5563" : "#e5e7eb"}
                      />
                      <XAxis
                        dataKey="name"
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                      />
                      <YAxis stroke={isDark ? "#9ca3af" : "#6b7280"} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111827",
                          border: "none",
                          borderRadius: "0.5rem",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke={isDark ? "#818cf8" : "#4f46e5"}
                        strokeWidth={3}
                        dot={{
                          stroke: isDark ? "#818cf8" : "#4f46e5",
                          strokeWidth: 2,
                          r: 4,
                          fill: isDark ? "#1f2937" : "#ffffff",
                        }}
                        activeDot={{
                          r: 6,
                          stroke: isDark ? "#818cf8" : "#4f46e5",
                          strokeWidth: 2,
                          fill: isDark ? "#818cf8" : "#4f46e5",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div
                className={`p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? "bg-gray-800 bg-opacity-70"
                    : "bg-white bg-opacity-80"
                } backdrop-blur-md`}
              >
                <h3 className="text-lg font-bold mb-4">Spending by Category</h3>
                {expensesByCategory.length > 0 ? (
                  <div className="">
                    <div className="w-full">
                      <div className="hidden md:block">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={expensesByCategory}
                              labelLine={false}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={2}
                              animationDuration={1000}
                              animationBegin={0}
                              animationEasing="ease-out"
                            >
                              {expensesByCategory.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CATEGORY_COLORS[entry.name as Category] ||
                                    "#CCCCCC"
                                  }
                                  stroke={isDark ? "#1f2937" : "#ffffff"}
                                  strokeWidth={1}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [
                                `${value.toFixed(2)}`,
                                "Amount",
                              ]}
                              contentStyle={{
                                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                                color: isDark ? "#ffffff" : "#111827",
                                border: "none",
                                borderRadius: "0.5rem",
                                boxShadow:
                                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                              }}
                              itemStyle={{
                                color: isDark ? "#ffffff" : "#111827",
                              }}
                              labelStyle={{
                                color: isDark ? "#ffffff" : "#111827",
                              }}
                            />
                            <Legend
                              layout="vertical"
                              verticalAlign="middle"
                              align="left"
                              iconSize={10}
                              iconType="circle"
                              formatter={(value, entry, index) => {
                                const totalValue = expensesByCategory.reduce(
                                  (sum, category) => sum + category.value,
                                  0
                                );
                                const percent = (
                                  (entry.payload.value / totalValue) *
                                  100
                                ).toFixed(0);
                                return (
                                  <span
                                    style={{
                                      color: isDark ? "#ffffff" : "#111827",
                                    }}
                                  >
                                    {value} ({percent}%)
                                  </span>
                                );
                              }}
                              wrapperStyle={{
                                paddingLeft: 20,
                                fontSize: 16,
                                fontWeight: 500,
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="md:hidden">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={expensesByCategory}
                              labelLine={false}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={2}
                              animationDuration={1000}
                              animationBegin={0}
                              animationEasing="ease-out"
                            >
                              {expensesByCategory.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CATEGORY_COLORS[entry.name as Category] ||
                                    "#CCCCCC"
                                  }
                                  stroke={isDark ? "#1f2937" : "#ffffff"}
                                  strokeWidth={1}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [
                                `${value.toFixed(2)}`,
                                "Amount",
                              ]}
                              contentStyle={{
                                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                                color: isDark ? "#ffffff" : "#111827",
                                border: "none",
                                borderRadius: "0.5rem",
                                boxShadow:
                                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                              }}
                              itemStyle={{
                                color: isDark ? "#ffffff" : "#111827",
                              }}
                              labelStyle={{
                                color: isDark ? "#ffffff" : "#111827",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        <div
                          className={`mt-4 px-2 grid grid-cols-2 gap-2 text-xs ${
                            isDark ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {expensesByCategory.map((entry, index) => {
                            const totalValue = expensesByCategory.reduce(
                              (sum, category) => sum + category.value,
                              0
                            );
                            const percent = (
                              (entry.value / totalValue) *
                              100
                            ).toFixed(0);
                            return (
                              <div
                                key={`legend-${index}`}
                                className="flex items-center mb-2"
                              >
                                <span
                                  className="inline-block w-3 h-3 mr-2 rounded-full"
                                  style={{
                                    backgroundColor:
                                      CATEGORY_COLORS[entry.name as Category] ||
                                      "#CCCCCC",
                                  }}
                                />
                                <span className="truncate">
                                  {entry.name} ({percent}%)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 opacity-70">
                    <AlertTriangle size={40} className="mb-2" />
                    <span>No category data available</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6">
              <div
                className={`p-4 rounded-xl shadow-lg flex flex-col md:flex-row justify-between gap-4 md:gap-4 md:items-center ${
                  isDark
                    ? "bg-gray-800 bg-opacity-70"
                    : "bg-white bg-opacity-80"
                } backdrop-blur-md`}
              >
                <div className="flex flex-1 max-w-md relative">
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full py-2 pl-10 pr-4 rounded-lg focus:outline-none ${
                      isDark
                        ? "bg-gray-700 focus:bg-gray-600 text-white"
                        : "bg-gray-100 focus:bg-white text-gray-900"
                    } transition-colors duration-200`}
                  />
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50"
                  />
                </div>

                <div className="flex space-x-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as Category | "All")
                    }
                    className={`px-4 py-2 rounded-lg border-r-4 cursor-pointer ${
                      isDark
                        ? "bg-gray-700 border-gray-700 text-white"
                        : "bg-gray-100 border-gray-100 text-gray-900"
                    } transition-colors duration-200 focus:outline-none`}
                  >
                    <option value="All">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Housing">Housing</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Health">Health</option>
                    <option value="Other">Other</option>
                  </select>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${
                      isDark
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white transition-colors duration-200 focus:outline-none`}
                  >
                    <Plus size={18} />
                    <span className="hidden md:inline">Add Expense</span>
                  </button>
                </div>
              </div>

              <div
                className={` ${showAddForm ? "" : ""} grid grid-cols-1 gap-6`}
              >
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    showAddForm
                      ? "max-h-[500px] opacity-100 transform translate-y-0 mb-6"
                      : "max-h-0 opacity-0 transform -translate-y-4"
                  }`}
                >
                  <div
                    className={`p-6 rounded-xl shadow-lg ${
                      isDark
                        ? "bg-gray-800 bg-opacity-70"
                        : "bg-white bg-opacity-80"
                    } backdrop-blur-md`}
                  >
                    <h3 className="text-lg font-bold mb-4">Add New Expense</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const title = (
                          form.elements.namedItem("title") as HTMLInputElement
                        ).value;
                        const amount = parseFloat(
                          (
                            form.elements.namedItem(
                              "amount"
                            ) as HTMLInputElement
                          ).value
                        );
                        const category = (
                          form.elements.namedItem(
                            "category"
                          ) as HTMLSelectElement
                        ).value as Category;

                        let isValid = true;
                        const errors = { title: "", amount: "", category: "" };

                        if (!title.trim()) {
                          errors.title = "Title is required";
                          isValid = false;
                        } else if (title.length > 50) {
                          errors.title =
                            "Title must be less than 50 characters";
                          isValid = false;
                        }

                        if (isNaN(amount) || amount <= 0) {
                          errors.amount =
                            "Please enter a valid positive amount";
                          isValid = false;
                        }

                        if (!category) {
                          errors.category = "Please select a category";
                          isValid = false;
                        }

                        setValidationErrors(errors);

                        if (isValid) {
                          handleAddExpense({
                            title,
                            amount,
                            category,
                            date: new Date(),
                          });

                          form.reset();
                          setValidationErrors({
                            title: "",
                            amount: "",
                            category: "",
                          });
                        }
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 opacity-70">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            className={`w-full px-4 py-2 rounded-lg cursor-pointer ${
                              isDark
                                ? "bg-gray-700 focus:bg-gray-600 text-white"
                                : "bg-gray-100 focus:bg-white text-gray-900"
                            } transition-colors duration-200 focus:outline-none ${
                              validationErrors.title
                                ? "border border-red-500"
                                : ""
                            }`}
                          />
                          {validationErrors.title && (
                            <p className="mt-1 text-sm text-red-500">
                              {validationErrors.title}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 opacity-70">
                            Amount ($)
                          </label>
                          <input
                            type="number"
                            name="amount"
                            className={`w-full px-4 py-2 rounded-lg cursor-pointer
                          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                            isDark
                              ? "bg-gray-700 focus:bg-gray-600 text-white"
                              : "bg-gray-100 focus:bg-white text-gray-900"
                          } transition-colors duration-200 focus:outline-none ${
                              validationErrors.amount
                                ? "border border-red-500"
                                : ""
                            }`}
                          />
                          {validationErrors.amount && (
                            <p className="mt-1 text-sm text-red-500">
                              {validationErrors.amount}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 opacity-70">
                            Category
                          </label>
                          <select
                            name="category"
                            className={`w-full px-4 py-2 rounded-lg border-r-4 cursor-pointer ${
                              isDark
                                ? "bg-gray-700 border-gray-700 focus:bg-gray-600 text-white"
                                : "bg-gray-100 border-gray-100 focus:bg-white text-gray-900"
                            } transition-colors duration-200 focus:outline-none ${
                              validationErrors.category
                                ? "border border-red-500"
                                : ""
                            }`}
                          >
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Housing">Housing</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Health">Health</option>
                            <option value="Other">Other</option>
                          </select>
                          {validationErrors.category && (
                            <p className="mt-1 text-sm text-red-500">
                              {validationErrors.category}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className={`px-4 py-2 rounded-lg mr-2 cursor-pointer ${
                            isDark
                              ? "bg-gray-700 hover:bg-gray-600"
                              : "bg-gray-200 hover:bg-gray-300"
                          } transition-colors duration-200 focus:outline-none`}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className={`px-4 py-2 rounded-lg cursor-pointer ${
                            isDark
                              ? "bg-indigo-600 hover:bg-indigo-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white transition-colors duration-200 focus:outline-none`}
                        >
                          Save Expense
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-xl shadow-lg ${
                isDark ? "bg-gray-800 bg-opacity-70" : "bg-white bg-opacity-80"
              } backdrop-blur-md`}
            >
              <h3 className="text-lg font-bold mb-4">Recent Expenses</h3>

              {filteredExpenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`border-b ${
                          isDark ? "border-gray-700" : "border-gray-300"
                        }`}
                      >
                        <th className="px-4 py-3 text-left">Title</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className={`border-b ${
                            isDark
                              ? "border-gray-700 hover:bg-gray-700"
                              : "border-gray-200 hover:bg-gray-50"
                          } transition-colors duration-150`}
                        >
                          <td className="px-4 py-4">{expense.title}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    CATEGORY_COLORS[expense.category],
                                }}
                              ></div>
                              {expense.category}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {expense.date.toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 text-right">
                            ${expense.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className={`p-2 rounded-full cursor-pointer ${
                                isDark
                                  ? "hover:bg-gray-600"
                                  : "hover:bg-gray-200"
                              } transition-colors duration-150`}
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center py-12 ${
                    isDark
                      ? "bg-gray-700 bg-opacity-50"
                      : "bg-gray-100 bg-opacity-50"
                  } rounded-lg`}
                >
                  <ArrowDownCircle
                    size={48}
                    className={`${
                      isDark ? "text-gray-600" : "text-gray-400"
                    } mb-3`}
                  />
                  <p className="text-center">
                    {searchTerm || selectedCategory !== "All"
                      ? "No expenses match your filters."
                      : "No expenses recorded yet."}
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className={`mt-4 px-4 py-2 rounded-lg ${
                      isDark
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white transition-colors duration-200 focus:outline-none`}
                  >
                    Add Your First Expense
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <footer className="mt-16 mb-8 text-center opacity-70 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <Home_ size={14} />
            <span>
              BudgetPro &copy; {new Date().getFullYear()} | Your Financial
              Companion
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
