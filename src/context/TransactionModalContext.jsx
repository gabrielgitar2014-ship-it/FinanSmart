import { createContext, useContext, useState } from "react";

const TransactionModalContext = createContext();

export const TransactionModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <TransactionModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </TransactionModalContext.Provider>
  );
};

export const useTransactionModal = () => useContext(TransactionModalContext);
