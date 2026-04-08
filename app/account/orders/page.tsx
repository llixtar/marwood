'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { getCustomerOrders } from '@/app/actions/customers';
import { Package, Truck, Clock, CheckCircle2, ChevronRight, ShoppingBag, ExternalLink, Search, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import Link from 'next/link';

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  items: any[];
  delivery_method: string;
  city: string;
  warehouse?: string;
  address?: string;
  payment_method: string;
};

export default function OrdersPage() {
  const { user, isInitialized } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        const data = await getCustomerOrders(user.id);
        setOrders(data as Order[]);
      }
      setIsLoading(false);
    }
    if (isInitialized) {
      fetchOrders();
    }
  }, [user, isInitialized]);

  if (!isInitialized || isLoading) {
    return (
      <div className="bg-milky min-h-screen py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bottle"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-light uppercase tracking-widest text-bottle mb-4">Мої замовлення</h1>
        <p className="text-bottle/60 mb-8 text-center max-w-md">Увійдіть в акаунт, щоб побачити історію ваших замовлень.</p>
        <button 
          onClick={() => (window as any).dispatchOpenAuth?.()}
          className="bg-bottle text-milky px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-bottle/90 transition-colors"
        >
          Увійти
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Очікує підтвердження';
      case 'confirmed': return 'Підтверджено';
      case 'shipped': return 'Відправлено';
      case 'completed': return 'Виконано';
      case 'cancelled': return 'Скасовано';
      default: return status;
    }
  };

  return (
    <div className="bg-milky min-h-screen py-12 lg:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <h1 className="text-2xl font-light uppercase tracking-[0.2em] text-bottle mb-8">Мій акаунт</h1>
            <nav className="space-y-1">
              <Link 
                href="/account" 
                className="flex items-center justify-between p-4 bg-white text-bottle text-xs font-bold uppercase tracking-widest hover:bg-bottle/5 transition-colors border border-bottle/10"
              >
                Особисті дані
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/account/orders" 
                className="flex items-center justify-between p-4 bg-bottle text-milky text-xs font-bold uppercase tracking-widest shadow-lg shadow-bottle/10"
              >
                Мої замовлення
                <ChevronRight className="w-4 h-4" />
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <div className="bg-white p-6 lg:p-10 shadow-sm border border-bottle/5 min-h-[500px]">
              <div className="flex items-center justify-between mb-8 border-b border-bottle/10 pb-4">
                <h2 className="text-lg font-light uppercase tracking-widest text-bottle">
                  Історія замовлень
                </h2>
                <span className="text-[10px] text-bottle/40 uppercase tracking-widest font-bold">
                  Всього: {orders.length}
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-12 h-12 text-bottle/10 mx-auto mb-4" />
                  <p className="text-bottle/40 italic text-sm mb-8">У вас поки що немає замовлень.</p>
                  <Link 
                    href="/category/all" 
                    className="inline-block border border-bottle text-bottle px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-bottle hover:text-milky transition-all"
                  >
                    До покупок
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className={`border border-bottle/10 overflow-hidden transition-all duration-300 ${selectedOrder?.id === order.id ? 'ring-1 ring-bottle' : 'hover:border-bottle/30'}`}
                    >
                      {/* Order Header (Clickable) */}
                      <button 
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="w-full text-left p-5 flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-bottle/5 rounded-full flex items-center justify-center text-bottle">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-bottle tracking-wider">{order.order_number}</p>
                            <p className="text-[10px] text-bottle/40 uppercase tracking-tighter">
                              {new Date(order.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 ml-auto">
                          <div className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 border rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </div>
                          <div className="text-sm font-light text-bottle">
                            {(order.total / 100).toLocaleString('uk-UA')} ₴
                          </div>
                          <ChevronRight className={`w-4 h-4 text-bottle/20 transition-transform ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {/* Order Details (Expandable) */}
                      {selectedOrder?.id === order.id && (
                        <div className="bg-[#fafaf5] border-t border-bottle/5 p-6 space-y-8 animate-in slide-in-from-top-4 duration-300">
                          
                          {/* Items */}
                          <div className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-widest font-bold text-bottle/40 mb-3 ml-1">Товари в замовленні</h3>
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-4 bg-white p-3 border border-bottle/5 rounded-sm">
                                <div className="w-16 h-16 bg-milky relative overflow-hidden flex-shrink-0">
                                  {item.image && (
                                    <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <p className="text-xs font-medium text-bottle">{item.title}</p>
                                  <p className="text-[10px] text-bottle/40 lowercase">Розмір: {item.selectedSize || 'не вказано'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-bottle/60">{item.quantity} шт.</p>
                                  <p className="text-xs font-bold text-bottle">{item.price.toLocaleString('uk-UA')} ₴</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h3 className="text-[10px] uppercase tracking-widest font-bold text-bottle/40 ml-1">Доставка</h3>
                              <div className="bg-white p-4 border border-bottle/5 rounded-sm space-y-3">
                                <div className="flex gap-3">
                                  <MapPin className="w-4 h-4 text-bottle/20 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] uppercase tracking-tighter text-bottle/40 font-bold">Отримувач та адреса</p>
                                    <p className="text-xs text-bottle mt-1">
                                      {order.city}<br />
                                      <span className="text-bottle/60 italic">
                                        {order.delivery_method === 'nova_poshta_warehouse' ? order.warehouse : order.address}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <Truck className="w-4 h-4 text-bottle/20 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] uppercase tracking-tighter text-bottle/40 font-bold">Тип доставки</p>
                                    <p className="text-xs text-bottle">
                                      {order.delivery_method === 'nova_poshta_warehouse' ? 'Нова Пошта (Відділення)' : 'Нова Пошта (Кур\'єр)'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-[10px] uppercase tracking-widest font-bold text-bottle/40 ml-1">Оплата</h3>
                              <div className="bg-white p-4 border border-bottle/5 rounded-sm space-y-3">
                                <div className="flex gap-3">
                                  <CreditCard className="w-4 h-4 text-bottle/20 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] uppercase tracking-tighter text-bottle/40 font-bold">Метод та статус</p>
                                    <p className="text-xs text-bottle mt-1">
                                      {order.payment_method === 'monopay' ? 'MonoPay' : 'Наложений платіж'}<br />
                                      <span className={`text-[10px] font-bold uppercase ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {order.payment_status === 'paid' ? 'Сплачено' : 'Очікує оплати'}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
