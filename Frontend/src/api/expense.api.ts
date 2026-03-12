import api from "./axios";

export interface Expense {
  _id: string;
  title: string;
  category: "Electricity" | "Water" | "Food Supplies" | "Staff Salary" | "Maintenance" | "Internet" | "Cleaning" | "Other";
  amount: number;
  date: string;
  description?: string;
  billImage?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  total: number;
  byCategory: {
    category: string;
    amount: number;
  }[];
}

export const getExpenses = async (params?: { category?: string; startDate?: string; endDate?: string }) => {
  const { data } = await api.get("/expenses", { params });
  return data;
};

export const getExpenseSummary = async (params: { year?: string | number; month?: string | number } = {}) => {
  const { data } = await api.get("/expenses/summary", { params });
  return data;
};

export const createExpense = async (expenseData: Omit<Expense, "_id" | "createdBy" | "createdAt" | "updatedAt">) => {
  const { data } = await api.post("/expenses", expenseData);
  return data;
};

export const updateExpense = async (id: string, updateData: Partial<Expense>) => {
  const { data } = await api.put(`/expenses/${id}`, updateData);
  return data;
};

export const deleteExpense = async (id: string) => {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
};
