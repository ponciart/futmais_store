export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  image: string;
  team: string;
  league: string;
  size: string;
  sku: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  type: 'Jersey' | 'Accessory' | 'Ball';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  totalSpent: number;
  status: 'Active' | 'Inactive';
  memberSince: string;
  address: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  date: string;
  total: number;
  status: 'Delivered' | 'Processing' | 'Cancelled';
  paymentMethod: 'Pix' | 'Credit' | 'Debit' | 'Cash';
  items: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  productDescription: string;
  purchaseDate: string;
  carrier: string;
  trackingCode: string;
  estimatedDelivery: string;
  lastStatus?: string;
  status: 'Preparação' | 'Despachado' | 'Em Trânsito' | 'Entregue';
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  category: string[];
  rating: number;
  status: 'Active' | 'Inactive';
  image: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  category: 'Vendas' | 'Fornecedores' | 'Marketing' | 'Operacional' | 'Outros';
  type: 'Income' | 'Expense';
  amount: number;
  status: 'Concluído' | 'Pendente' | 'Pago' | 'Cancelado';
  image?: string; // Para exibir o produto ou logo do fornecedor
}
