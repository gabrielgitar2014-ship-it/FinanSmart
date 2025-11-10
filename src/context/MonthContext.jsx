import { createContext, useContext, useState } from "react";

const MonthContext = createContext();

export const MonthProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const changeMonth = (delta) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(selectedMonth.getMonth() + delta);
    setSelectedMonth(newDate);
  };

  const monthName = selectedMonth.toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <MonthContext.Provider
      value={{ selectedMonth, setSelectedMonth, changeMonth, monthName }}
    >
      {children}
    </MonthContext.Provider>
  );
};

export const useMonth = () => useContext(MonthContext);
