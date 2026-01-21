import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_SUPPLIERS, INITIAL_TRANSACTIONS } from '../constants';
import { Product, Customer, Order, CartItem, Shipment, Supplier, FinancialTransaction } from '../types';
import { supabase } from '../supabase';

interface StoreContextType {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  cart: CartItem[];
  shipments: Shipment[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (id: string, newStock: number) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  checkout: (paymentMethod: 'Pix' | 'Credit' | 'Debit' | 'Cash', customerId?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  addShipment: (shipment: Shipment) => void;
  updateShipment: (shipment: Shipment) => void;
  deleteShipment: (id: string) => void;
  suppliers: Supplier[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  transactions: FinancialTransaction[];
  addTransaction: (transaction: FinancialTransaction) => void;
  financialStats: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    operationalCosts: number;
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  // Helper to load from localStorage or use default
  const loadFromStorage = <T,>(key: string, initialValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading ${key} from localStorage`, error);
      return initialValue;
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const item = localStorage.getItem('cart');
    return item ? JSON.parse(item) : [];
  });
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);

  // Initial Fetch from Supabase
  useEffect(() => {
    const fetchData = async () => {
      // Products
      const { data: productsData } = await supabase.from('products').select('*');
      if (productsData) setProducts(productsData.map(p => ({
        ...p,
        price: Number(p.price),
        cost: Number(p.cost)
      })));

      // Customers
      const { data: customersData } = await supabase.from('customers').select('*');
      if (customersData) setCustomers(customersData.map(c => ({
        ...c,
        totalSpent: Number(c.total_spent)
      })));

      // Orders (with items)
      const { data: ordersData } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (ordersData) setOrders(ordersData.map(o => ({
        ...o,
        total: Number(o.total),
        items: o.order_items.map((oi: any) => ({
          product: products.find(p => p.id === oi.product_id) || { id: oi.product_id, name: 'Produto Removido' },
          quantity: oi.quantity
        }))
      })));

      // Suppliers
      const { data: suppliersData } = await supabase.from('suppliers').select('*');
      if (suppliersData) setSuppliers(suppliersData);

      // Shipments
      const { data: shipmentsData } = await supabase.from('shipments').select('*');
      if (shipmentsData) setShipments(shipmentsData);

      // Transactions
      const { data: transactionsData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (transactionsData) setTransactions(transactionsData.map(t => ({
        ...t,
        amount: Number(t.amount)
      })));
    };

    fetchData();
  }, []);

  // Cart Persistence (still local)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add a new product to inventory
  const addProduct = async (product: Product) => {
    const { error } = await supabase.from('products').insert([product]);
    if (!error) {
      setProducts((prev) => [...prev, product]);

      // Create Financial Transaction for Investment (Initial Stock Cost)
      const investmentCost = (product.cost || 0) * product.stock;
      if (investmentCost > 0) {
        const investmentTransaction: FinancialTransaction = {
          id: `TR-${Math.floor(Math.random() * 100000)}`,
          date: new Date().toLocaleDateString('pt-BR'),
          description: `Investimento Estoque - ${product.name} (${product.stock} un)`,
          category: 'Operacional',
          type: 'Expense',
          amount: investmentCost,
          status: 'Concluído'
        };
        addTransaction(investmentTransaction);
      }
    }
  };

  // Update existing product
  const updateProduct = async (updatedProduct: Product) => {
    const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
    if (!error) {
      setProducts((prev) => prev.map(p =>
        p.id === updatedProduct.id ? updatedProduct : p
      ));
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts((prev) => prev.filter(p => p.id !== id));
  };

  // Update Stock
  const updateProductStock = async (id: string, newStock: number) => {
    const status = newStock === 0 ? 'OUT_OF_STOCK' : newStock < 10 ? 'LOW_STOCK' : 'IN_STOCK';
    const { error } = await supabase.from('products').update({ stock: newStock, status }).eq('id', id);

    if (!error) {
      setProducts((prev) => prev.map(p =>
        p.id === id ? { ...p, stock: newStock, status } : p
      ));
    }
  };

  // Cart Logic
  const addToCart = (product: Product) => {
    if (product.stock === 0) return; // Prevent adding out of stock
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const checkout = async (paymentMethod: 'Pix' | 'Credit' | 'Debit' | 'Cash', customerId?: string) => {
    if (cart.length === 0) return;

    let customerName = 'Cliente Avulso';
    let customer: Customer | undefined;

    if (customerId) {
      customer = customers.find(c => c.id === customerId);
      if (customer) {
        customerName = customer.name;
        // Update customer total spent
        const newTotalSpent = customer.totalSpent + cartTotal;
        const { error: custError } = await supabase.from('customers').update({ total_spent: newTotalSpent }).eq('id', customerId);

        if (!custError) {
          updateCustomer({ ...customer, totalSpent: newTotalSpent });
        }
      }
    }

    // Create Order
    const newOrder: Order = {
      id: `#PED-${Math.floor(Math.random() * 10000)}`,
      customerId,
      customerName,
      date: new Date().toLocaleDateString('pt-BR'),
      total: cartTotal,
      status: 'Processing',
      paymentMethod,
      items: [...cart],
    };

    const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
      id: newOrder.id,
      customer_id: newOrder.customerId,
      customer_name: newOrder.customerName,
      date: newOrder.date,
      total: newOrder.total,
      status: newOrder.status,
      payment_method: newOrder.paymentMethod
    }]).select();

    if (!orderError) {
      // Insert Order Items
      const orderItems = cart.map(item => ({
        order_id: newOrder.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      await supabase.from('order_items').insert(orderItems);

      setOrders((prev) => [newOrder, ...prev]);

      // Create Financial Transaction for this sale (Income)
      const newTransaction: FinancialTransaction = {
        id: `TR-${Math.floor(Math.random() * 100000)}`,
        date: new Date().toLocaleDateString('pt-BR'),
        description: `Venda ${newOrder.id} - ${cart.length} itens`,
        category: 'Vendas',
        type: 'Income',
        amount: cartTotal,
        status: 'Concluído'
      };

      addTransaction(newTransaction);



      // Reduce Stock
      for (const item of cart) {
        const currentProduct = products.find(p => p.id === item.product.id);
        if (currentProduct) {
          await updateProductStock(item.product.id, Math.max(0, currentProduct.stock - item.quantity));
        }
      }

      clearCart();
      alert("Venda realizada com sucesso!");
    } else {
      alert("Erro ao realizar venda: " + orderError.message);
    }
  };

  // Financial functions
  const addTransaction = async (transaction: FinancialTransaction) => {
    const { error } = await supabase.from('transactions').insert([{
      ...transaction,
      amount: Number(transaction.amount) // Ensure numeric
    }]);
    if (!error) setTransactions((prev) => [transaction, ...prev]);
  };

  const financialStats = transactions.reduce((acc, t) => {
    if (t.type === 'Income') {
      acc.totalIncome += t.amount;
    } else {
      acc.totalExpenses += t.amount;
      if (t.category === 'Operacional') {
        acc.operationalCosts += t.amount;
      }
    }
    acc.netProfit = acc.totalIncome - acc.totalExpenses;
    return acc;
  }, { totalIncome: 0, totalExpenses: 0, netProfit: 0, operationalCosts: 0 });

  // Shipment functions
  const addShipment = async (shipment: Shipment) => {
    const { error } = await supabase.from('shipments').insert([{
      id: shipment.id,
      order_id: shipment.orderId,
      customer_name: shipment.customerName,
      customer_phone: shipment.customerPhone,
      product_description: shipment.productDescription,
      purchase_date: shipment.purchaseDate,
      carrier: shipment.carrier,
      tracking_code: shipment.trackingCode,
      estimated_delivery: shipment.estimatedDelivery,
      last_status: shipment.lastStatus,
      status: shipment.status
    }]);
    if (!error) setShipments((prev) => [shipment, ...prev]);
  };

  const updateShipment = async (updatedShipment: Shipment) => {
    const { error } = await supabase.from('shipments').update({
      order_id: updatedShipment.orderId,
      customer_name: updatedShipment.customerName,
      customer_phone: updatedShipment.customerPhone,
      product_description: updatedShipment.productDescription,
      purchase_date: updatedShipment.purchaseDate,
      carrier: updatedShipment.carrier,
      tracking_code: updatedShipment.trackingCode,
      estimated_delivery: updatedShipment.estimatedDelivery,
      last_status: updatedShipment.lastStatus,
      status: updatedShipment.status
    }).eq('id', updatedShipment.id);

    if (!error) {
      setShipments((prev) => prev.map(s =>
        s.id === updatedShipment.id ? updatedShipment : s
      ));
    }
  };

  const deleteShipment = async (id: string) => {
    const { error } = await supabase.from('shipments').delete().eq('id', id);
    if (!error) setShipments((prev) => prev.filter(s => s.id !== id));
  };

  // Customer functions
  const addCustomer = async (customer: Customer) => {
    const { error } = await supabase.from('customers').insert([{
      ...customer,
      total_spent: customer.totalSpent, // Map camelCase to snake_case
      member_since: customer.memberSince
    }]);
    if (!error) setCustomers((prev) => [customer, ...prev]);
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    const { error } = await supabase.from('customers').update({
      ...updatedCustomer,
      total_spent: updatedCustomer.totalSpent,
      member_since: updatedCustomer.memberSince
    }).eq('id', updatedCustomer.id);

    if (!error) {
      setCustomers((prev) => prev.map(c =>
        c.id === updatedCustomer.id ? updatedCustomer : c
      ));
    }
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (!error) setCustomers((prev) => prev.filter(c => c.id !== id));
  };

  // Supplier functions
  const addSupplier = async (supplier: Supplier) => {
    const { error } = await supabase.from('suppliers').insert([supplier]);
    if (!error) setSuppliers((prev) => [supplier, ...prev]);
  };

  const updateSupplier = async (updatedSupplier: Supplier) => {
    const { error } = await supabase.from('suppliers').update(updatedSupplier).eq('id', updatedSupplier.id);
    if (!error) {
      setSuppliers((prev) => prev.map(s =>
        s.id === updatedSupplier.id ? updatedSupplier : s
      ));
    }
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (!error) setSuppliers((prev) => prev.filter(s => s.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        customers,
        orders,
        cart,
        shipments,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        checkout,
        clearCart,
        cartTotal,
        addShipment,
        updateShipment,
        deleteShipment,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        transactions,
        addTransaction,
        financialStats
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
