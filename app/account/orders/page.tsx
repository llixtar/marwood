'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { getCustomerOrders } from '@/app/actions/customers';
import { getAllOrdersAdmin, updateOrderStatus } from '@/app/actions/orders';
import { Package, Truck, Clock, CheckCircle2, ChevronRight, ShoppingBag, ExternalLink, Search, Mail, Phone, MapPin, CreditCard, User, XCircle } from 'lucide-react';
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
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  sku?: string;
};

export default function OrdersPage() {
  const { user, profile, isInitialized } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'all'>('all');

  const isAdmin = profile?.is_admin === true;

  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        let data;
        if (isAdmin) {
          data = await getAllOrdersAdmin();
          
          if (data) {
            data.sort((a: any, b: any) => {
              if (a.payment_method === 'cod' && b.payment_method !== 'cod') return -1;
              if (a.payment_method !== 'cod' && b.payment_method === 'cod') return 1;
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
          }
        } else {
          data = await getCustomerOrders(user.id);
        }
        if (isAdmin && data) {
          const hasNew = data.some((o: any) => o.status === 'pending' || o.status === 'awaiting_payment');
          if (hasNew) setActiveTab('new');
        }
        setOrders(data as Order[]);
      }
      setIsLoading(false);
    }
    if (isInitialized) {
      fetchOrders();
    }
  }, [user, isInitialized, isAdmin]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Ви впевнені, що хочете скасувати це замовлення?')) return;
    
    const res = await updateOrderStatus(orderId, 'cancelled');
    if (res.success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
      }
    } else {
      alert('Помилка при скасуванні замовлення');
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    if (!confirm('Ви впевнені, що хочете підтвердити це замовлення?')) return;
    
    const res = await updateOrderStatus(orderId, 'confirmed');
    if (res.success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'confirmed' });
      }
    } else {
      alert('Помилка при підтвердженні замовлення');
    }
  };

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
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'awaiting_payment': return 'bg-red-50 text-red-600 border-red-100';
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
      case 'awaiting_payment': return 'Очікує передоплати';
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
            <h1 className="text-2xl font-light uppercase tracking-[0.2em] text-bottle mb-8">
              {isAdmin ? 'Адмін-панель' : 'Мій акаунт'}
            </h1>
            <nav className="space-y-1">
              {!isAdmin && (
                <Link 
                  href="/account" 
                  className="flex items-center justify-between p-4 bg-white text-bottle text-xs font-bold uppercase tracking-widest hover:bg-bottle/5 transition-colors border border-bottle/10"
                >
                  Особисті дані
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
              <Link 
                href="/account/orders" 
                className="flex items-center justify-between p-4 bg-bottle text-milky text-xs font-bold uppercase tracking-widest shadow-lg shadow-bottle/10"
              >
                {isAdmin ? 'Замовлення' : 'Мої замовлення'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <div className="bg-white p-6 lg:p-10 shadow-sm border border-bottle/5 min-h-[500px]">
              <div className="flex items-center justify-between mb-8 border-b border-bottle/10 pb-4">
                <h2 className="text-lg font-light uppercase tracking-widest text-bottle">
                  {isAdmin ? 'Всі замовлення' : 'Історія замовлень'}
                </h2>
                <span className="text-[10px] text-bottle/40 uppercase tracking-widest font-bold">
                  Всього: {orders.length}
                </span>
              </div>

              {isAdmin && (
                <div className="flex gap-4 mb-8 border-b border-bottle/5">
                  <button 
                    onClick={() => setActiveTab('new')}
                    className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all relative ${activeTab === 'new' ? 'text-bottle' : 'text-bottle/30 hover:text-bottle/60'}`}
                  >
                    Нові замовлення
                    <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-bottle transition-transform duration-300 ${activeTab === 'new' ? 'scale-x-100' : 'scale-x-0'}`} />
                    {orders.filter(o => o.status === 'pending' || o.status === 'awaiting_payment').length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">
                        {orders.filter(o => o.status === 'pending' || o.status === 'awaiting_payment').length}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all relative ${activeTab === 'all' ? 'text-bottle' : 'text-bottle/30 hover:text-bottle/60'}`}
                  >
                    Всі замовлення
                    <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-bottle transition-transform duration-300 ${activeTab === 'all' ? 'scale-x-100' : 'scale-x-0'}`} />
                  </button>
                </div>
              )}

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
                  {orders
                    .filter(order => isAdmin && activeTab === 'new' ? (order.status === 'pending' || order.status === 'awaiting_payment') : true)
                    .map((order) => (
                    <div 
                      key={order.id} 
                      className={`border border-bottle/10 overflow-hidden transition-all duration-300 ${
                        selectedOrder?.id === order.id ? 'ring-1 ring-bottle' : 'hover:border-bottle/30'
                      } ${isAdmin && (order.status === 'pending' || order.status === 'awaiting_payment') ? 'bg-bottle/[0.02] border-bottle/20' : ''}`}
                    >
                      {/* Order Header (Clickable) */}
                      <button 
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="w-full text-left p-5 flex flex-wrap items-center justify-between gap-4 relative"
                      >
                        {isAdmin && (order.status === 'pending' || order.status === 'awaiting_payment') && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" title="Нове замовлення" />
                        )}
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(order.status === 'pending' || order.status === 'awaiting_payment') ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-bottle/5 text-bottle'}`}>
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-bottle tracking-wider">{order.order_number}</p>
                              {isAdmin && (order.status === 'pending' || order.status === 'awaiting_payment') && (
                                <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">New</span>
                              )}
                            </div>
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
                                  <p className="text-xs font-medium text-bottle mb-1">{item.title}</p>
                                  <div className="space-y-1">
                                    {item.sku && (
                                      <p className="text-[10px] text-bottle font-bold uppercase tracking-wider">
                                        Арт: {item.sku}
                                      </p>
                                    )}
                                    <p className="text-[10px] text-bottle font-bold lowercase">
                                      Розмір: {item.selectedSize || 'не вказано'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-bottle/60">{item.quantity} шт.</p>
                                  <p className="text-xs font-bold text-bottle">{item.price.toLocaleString('uk-UA')} ₴</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {isAdmin && (
                              <div className="space-y-4">
                                <h3 className="text-[10px] uppercase tracking-widest font-bold text-bottle/40 ml-1">Клієнт</h3>
                                <div className="bg-white p-4 border border-bottle/5 rounded-sm space-y-3">
                                  <div className="flex gap-3">
                                    <User className="w-4 h-4 text-bottle/20 mt-0.5" />
                                    <div>
                                      <p className="text-[10px] uppercase tracking-tighter text-bottle/40 font-bold">Контактна особа</p>
                                      <p className="text-xs text-bottle mt-1">{order.customer_name}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <Phone className="w-4 h-4 text-bottle/20 mt-0.5" />
                                    <div>
                                      <p className="text-[10px] uppercase tracking-tighter text-bottle/40 font-bold">Телефон</p>
                                      <a href={`tel:${order.customer_phone}`} className="text-xs text-bottle hover:underline">{order.customer_phone}</a>
                                    </div>
                                  </div>
                                  {order.customer_email && (
                                    <div className="flex gap-3">
                                      <Mail className="w-4 h-4 text-bottle/20 mt-0.5" />
                                      <div>
                                        <p className="text-[10px] uppercase tracking-tighter text-bottle/40 font-bold">Email</p>
                                        <a href={`mailto:${order.customer_email}`} className="text-xs text-bottle hover:underline">{order.customer_email}</a>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="space-y-4">
                              <h3 className="text-[10px] uppercase tracking-widest font-bold text-bottle/40 ml-1">Доставка</h3>
                              <div className="bg-white p-4 border border-bottle/5 rounded-sm space-y-3">
                                <div className="flex gap-3">
                                  <MapPin className="w-4 h-4 text-bottle/20 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] uppercase tracking-tighter text-bottle/40 font-bold">Місто та адреса</p>
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

                          {isAdmin && order.status !== 'cancelled' && order.status !== 'completed' && (
                            <div className="pt-6 border-t border-bottle/5 flex justify-end gap-3">
                              {order.status !== 'confirmed' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleConfirmOrder(order.id); }}
                                  className="text-[10px] uppercase tracking-widest font-bold text-green-600 hover:text-green-700 transition-colors flex items-center gap-2 border border-green-100 px-4 py-2 rounded-sm bg-green-50/30"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Підтвердити замовлення
                                </button>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                                className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 border border-red-100 px-4 py-2 rounded-sm bg-red-50/30"
                              >
                                <XCircle className="w-4 h-4" />
                                Скасувати замовлення
                              </button>
                            </div>
                          )}
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
