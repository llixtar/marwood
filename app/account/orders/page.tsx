'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { getCustomerOrders } from '@/app/actions/customers';
import { getAllOrdersAdmin, updateOrderStatus, deleteOrderAdmin, recreateMonoInvoiceAction } from '@/app/actions/orders';
import { Package, Truck, Clock, CheckCircle2, ChevronRight, ShoppingBag, ExternalLink, Search, Mail, Phone, MapPin, CreditCard, User, XCircle, Info, ChevronDown } from 'lucide-react';
import { CopyButton } from '@/components/checkout/CopyButton';
import { PaymentDetails } from '@/components/checkout/PaymentDetails';
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
  paid_amount: number;
  ttn?: string;
};

export default function OrdersPage() {
  const { user, profile, isInitialized } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'processing' | 'shipped' | 'all'>('all');
  const [adminPaidAmount, setAdminPaidAmount] = useState<string>('');
  const [adminTTN, setAdminTTN] = useState<string>('');
  const [isPaying, setIsPaying] = useState<string | null>(null);

  const isAdmin = profile?.is_admin === true;

  const handleRecreatePayment = async (orderId: string) => {
    setIsPaying(orderId);
    const res = await recreateMonoInvoiceAction(orderId);
    if (res.success && res.paymentUrl) {
      window.location.href = res.paymentUrl;
    } else {
      alert('Помилка: ' + res.error);
      setIsPaying(null);
    }
  };

  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        let data;
        if (isAdmin) {
          data = await getAllOrdersAdmin();
          
          if (data) {
          data.sort((a: any, b: any) => {
            const priority = (method: string) => method.startsWith('details') ? 0 : 1;
            if (priority(a.payment_method) !== priority(b.payment_method)) {
              return priority(a.payment_method) - priority(b.payment_method);
            }
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

  // Автопідстановка даних при виборі замовлення адміном
  useEffect(() => {
    if (selectedOrder && isAdmin) {
      setAdminTTN(selectedOrder.ttn || '');
      
      // Якщо це нове замовлення, підставляємо суму для підтвердження
      if (selectedOrder.status === 'pending' || selectedOrder.status === 'awaiting_payment') {
        if (selectedOrder.paid_amount && selectedOrder.paid_amount > 0) {
          // Якщо вже є оплата (наприклад від MonoPay)
          setAdminPaidAmount((selectedOrder.paid_amount / 100).toString());
        } else if (selectedOrder.payment_method === 'details_cod') {
          // Для наложки за замовчуванням 200
          setAdminPaidAmount('200');
        } else {
          // Для повної оплати — вся сума
          setAdminPaidAmount((selectedOrder.total / 100).toString());
        }
      } else {
        setAdminPaidAmount(selectedOrder.paid_amount ? (selectedOrder.paid_amount / 100).toString() : '');
      }
    } else if (!selectedOrder) {
      setAdminPaidAmount('');
      setAdminTTN('');
    }
  }, [selectedOrder, isAdmin]);

  const handleUpdateOrder = async (orderId: string, status: string, adminData?: { paidAmount?: number; ttn?: string }) => {
    const res = await updateOrderStatus(orderId, status, adminData);
    if (res.success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        status,
        paid_amount: adminData?.paidAmount !== undefined ? Math.round(adminData.paidAmount * 100) : o.paid_amount,
        payment_status: (adminData?.paidAmount && adminData.paidAmount > 0) || status === 'confirmed' ? 'success' : o.payment_status,
        ttn: adminData?.ttn !== undefined ? adminData.ttn : o.ttn
      } : o));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { 
          ...prev, 
          status,
          paid_amount: adminData?.paidAmount !== undefined ? Math.round(adminData.paidAmount * 100) : prev.paid_amount,
          payment_status: (adminData?.paidAmount && adminData.paidAmount > 0) || status === 'confirmed' ? 'success' : prev.payment_status,
          ttn: adminData?.ttn !== undefined ? adminData.ttn : prev.ttn
        } : null);
      }
      
      window.dispatchEvent(new CustomEvent('refresh-orders-count'));
    } else {
      alert('Помилка при оновленні замовлення: ' + res.error);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (!confirm('Ви впевнені, що хочете скасувати це замовлення?')) return;
    handleUpdateOrder(orderId, 'cancelled');
  };

  const handleConfirmOrder = (orderId: string) => {
    const amount = parseFloat(adminPaidAmount);
    if (isNaN(amount)) {
      if (!confirm('Сума оплати не введена. Підтвердити без оплати?')) return;
      handleUpdateOrder(orderId, 'confirmed');
    } else {
      handleUpdateOrder(orderId, 'confirmed', { paidAmount: amount });
      setAdminPaidAmount('');
    }
  };
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('ВИ ВПЕВНЕНІ? Це замовлення буде назавжди видалено з бази даних!')) return;
    
    const res = await deleteOrderAdmin(orderId);
    if (res.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      window.dispatchEvent(new CustomEvent('refresh-orders-count'));
    } else {
      alert('Помилка при видаленні: ' + res.error);
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
      case 'packing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'handed_to_delivery': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'shipped': return 'bg-green-50 text-green-700 border-green-100';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-green-600 text-white border-green-600';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (order: Order) => {
    const isPaid = order.payment_status === 'success' || (order.paid_amount ?? 0) >= order.total;
    
    switch (order.status) {
      case 'pending': 
        return isPaid ? 'СПЛАЧЕНО (MonoPay)' : 'Очікує (MonoPay)';
      case 'awaiting_payment': return 'Очікує оплати (Реквізити)';
      case 'confirmed': return 'Підтверджено / Оплачено';
      case 'packing': return 'Пакування';
      case 'handed_to_delivery': return 'Передано на пошту';
      case 'shipped': return 'Надіслано';
      case 'delivered': return 'Отримано';
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
                <div className="flex gap-4 mb-8 border-b border-bottle/5 overflow-x-auto pb-1 scrollbar-hide">
                  <button 
                    onClick={() => setActiveTab('new')}
                    className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all relative whitespace-nowrap ${activeTab === 'new' ? 'text-bottle' : 'text-bottle/30 hover:text-bottle/60'}`}
                  >
                    Нові
                    <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-bottle transition-transform duration-300 ${activeTab === 'new' ? 'scale-x-100' : 'scale-x-0'}`} />
                    {orders.filter(o => o.status === 'pending' || o.status === 'awaiting_payment').length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">
                        {orders.filter(o => o.status === 'pending' || o.status === 'awaiting_payment').length}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('processing')}
                    className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all relative whitespace-nowrap ${activeTab === 'processing' ? 'text-bottle' : 'text-bottle/30 hover:text-bottle/60'}`}
                  >
                    В обробці
                    <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-bottle transition-transform duration-300 ${activeTab === 'processing' ? 'scale-x-100' : 'scale-x-0'}`} />
                    {orders.filter(o => o.status === 'confirmed' || o.status === 'packing' || o.status === 'handed_to_delivery').length > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">
                        {orders.filter(o => o.status === 'confirmed' || o.status === 'packing' || o.status === 'handed_to_delivery').length}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('shipped')}
                    className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all relative whitespace-nowrap ${activeTab === 'shipped' ? 'text-bottle' : 'text-bottle/30 hover:text-bottle/60'}`}
                  >
                    Відправлені
                    <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-bottle transition-transform duration-300 ${activeTab === 'shipped' ? 'scale-x-100' : 'scale-x-0'}`} />
                    {orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length > 0 && (
                      <span className="ml-2 bg-green-600 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">
                        {orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all relative whitespace-nowrap ${activeTab === 'all' ? 'text-bottle' : 'text-bottle/30 hover:text-bottle/60'}`}
                  >
                    Всі
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
                    .filter(order => {
                      if (!isAdmin) return true;
                      if (activeTab === 'new') return order.status === 'pending' || order.status === 'awaiting_payment';
                      if (activeTab === 'processing') return order.status === 'confirmed' || order.status === 'packing' || order.status === 'handed_to_delivery';
                      if (activeTab === 'shipped') return order.status === 'shipped' || order.status === 'delivered';
                      return true;
                    })
                    .map((order) => (
                    <div 
                      key={order.id} 
                      className={`border border-bottle/10 overflow-hidden transition-all duration-300 ${
                        selectedOrder?.id === order.id ? 'ring-1 ring-bottle' : 'hover:border-bottle/30'
                      } ${isAdmin && (order.status === 'pending' || order.status === 'awaiting_payment') ? 'bg-bottle/[0.02] border-bottle/20' : ''}`}
                    >
                      {/* Order Header (Clickable) */}
                      <button 
                        onClick={() => {
                          setSelectedOrder(selectedOrder?.id === order.id ? null : order);
                          
                          // Відмічаємо замовлення як "переглянуте"
                          if (!isAdmin) {
                            try {
                              const viewedStr = localStorage.getItem('viewed_order_updates');
                              const viewed = viewedStr ? JSON.parse(viewedStr) : {};
                              viewed[order.id] = order.updated_at;
                              localStorage.setItem('viewed_order_updates', JSON.stringify(viewed));
                              window.dispatchEvent(new Event('refresh-orders-count'));
                            } catch (e) {
                              console.error('Failed to update viewed status', e);
                            }
                          }
                        }}
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
                            {getStatusLabel(order)}
                          </div>
                          <div className="text-sm font-light text-bottle">
                            {isAdmin ? (
                              <div className="flex flex-col items-end leading-none gap-1">
                                <span className="text-[8px] text-bottle/40 uppercase font-bold tracking-widest">До сплати:</span>
                                <span className="font-medium text-xs">
                                  {((order.total - (order.paid_amount || 0)) / 100).toLocaleString('uk-UA')} ₴
                                </span>
                              </div>
                            ) : (
                              `${(order.total / 100).toLocaleString('uk-UA')} ₴`
                            )}
                          </div>
                          <ChevronRight className={`w-4 h-4 text-bottle/20 transition-transform ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {/* Order Details (Expandable) */}
                      {selectedOrder?.id === order.id && (
                        <div className="bg-[#fafaf5] border-t border-bottle/5 p-6 space-y-8 animate-in slide-in-from-top-4 duration-300">
                          
                          {/* Items */}
                          <div className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 mb-3 ml-1">Товари в замовленні</h3>
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
                                <h3 className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 ml-1">Клієнт</h3>
                                <div className="bg-white p-4 border border-bottle/5 rounded-sm space-y-3">
                                  <div className="flex gap-3">
                                    <User className="w-4 h-4 text-bottle/50 mt-0.5" />
                                    <div>
                                      <p className="text-[10px] uppercase tracking-tighter text-bottle/40 font-bold">Контактна особа</p>
                                      <p className="text-xs text-bottle mt-1">{order.customer_name}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <Phone className="w-4 h-4 text-bottle/50 mt-0.5" />
                                    <div>
                                      <p className="text-[10px] uppercase tracking-tighter text-bottle/40 font-bold">Телефон</p>
                                      <a href={`tel:${order.customer_phone}`} className="text-xs text-bottle hover:underline">{order.customer_phone}</a>
                                    </div>
                                  </div>
                                  {order.customer_email && (
                                    <div className="flex gap-3">
                                      <Mail className="w-4 h-4 text-bottle/50 mt-0.5" />
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
                              <h3 className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 ml-1">Доставка</h3>
                              <div className="bg-white p-4 border border-bottle/5 rounded-sm space-y-3">
                                <div className="flex gap-3">
                                  <MapPin className="w-4 h-4 text-bottle/50 mt-0.5" />
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
                                  <Truck className="w-4 h-4 text-bottle/50 mt-0.5" />
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
                              <h3 className="text-[10px] uppercase tracking-widest font-bold text-bottle/70 ml-1">Оплата</h3>
                              <div className="bg-white border border-bottle/5 rounded-sm overflow-hidden">
                                <div className="p-4 flex gap-3">
                                  <CreditCard className="w-4 h-4 text-bottle/50 mt-0.5" />
                                  <div className="flex-grow">
                                    <p className="text-[10px] uppercase tracking-tighter text-bottle/40 font-bold">Метод та статус</p>
                                    <p className="text-xs text-bottle mt-1">
                                      {order.payment_method === 'monopay' && 'Онлайн (MonoPay)'}
                                      {order.payment_method === 'details_full' && 'Реквізити (Повна)'}
                                      {order.payment_method === 'details_cod' && 'Реквізити (Наложений)'}
                                      <br />
                                      <span className={`text-[10px] font-bold uppercase ${
                                        (order.payment_status === 'success' || (order.paid_amount ?? 0) > 0 || order.status === 'confirmed') 
                                        ? 'text-green-600' 
                                        : 'text-yellow-600'
                                      }`}>
                                        {(order.payment_status === 'success' || (order.paid_amount ?? 0) > 0 || order.status === 'confirmed') 
                                        ? 'Сплачено' 
                                        : 'Очікує оплати'}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                {/* Реквізити для оплати (тільки для клієнта і якщо очікує оплати) */}
                                {!isAdmin && (order.status === 'awaiting_payment' || order.status === 'pending') && 
                                 (order.payment_status !== 'success' && (order.paid_amount ?? 0) < order.total) && (
                                   <div className="mt-4 bg-milky/30 border border-bottle/5 rounded-sm overflow-hidden">
                                     <div className="p-4 space-y-4">
                                       {order.payment_method === 'monopay' && (
                                         <div className="space-y-3">
                                           <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                                                <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-bottle">Оплата онлайн</h4>
                                              </div>
                                              <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">Не сплачено</span>
                                           </div>
                                           <button
                                             onClick={() => handleRecreatePayment(order.id)}
                                             disabled={isPaying === order.id}
                                             className="w-full bg-bottle text-milky py-3 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-[#0a0a0a] transition-all flex items-center justify-center gap-3 disabled:opacity-50 rounded-sm"
                                           >
                                             {isPaying === order.id ? (
                                               <div className="w-3 h-3 border-2 border-milky/30 border-t-milky rounded-full animate-spin" />
                                             ) : (
                                               <>
                                                 <CreditCard className="w-4 h-4" />
                                                 Оплатити MonoPay
                                               </>
                                             )}
                                           </button>
                                         </div>
                                       )}

                                       <details className="group">
                                         <summary className="flex cursor-pointer list-none items-center justify-center gap-2 text-[9px] font-bold text-bottle/40 uppercase tracking-widest hover:text-bottle transition-colors [&::-webkit-details-marker]:hidden py-1">
                                           <span>Реквізити для переказу</span>
                                           <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                                         </summary>
                                         <div className="mt-4 pt-4 border-t border-bottle/5">
                                           <PaymentDetails 
                                             orderNumber={order.order_number} 
                                             totalAmount={order.total} 
                                             paymentMethod={order.payment_method === 'monopay' ? 'details_full' : order.payment_method}
                                             className="rounded-none border-none shadow-none !p-0 !bg-transparent"
                                           />
                                         </div>
                                       </details>
                                     </div>
                                   </div>
                                )}

                                {/* Сплачено / Залишок / ТТН */}
                                {( (order.paid_amount ?? 0) > 0 || order.ttn) && (
                                  <div className="border-t border-bottle/5 p-4 space-y-3 bg-milky/30">
                                    {(order.paid_amount ?? 0) > 0 && (
                                      <div className="flex justify-between items-center text-[10px]">
                                        <div className="space-y-0.5">
                                          <p className="text-bottle/40 uppercase tracking-widest font-bold">Оплата</p>
                                          <p className="text-bottle font-medium">Сплачено: {(order.paid_amount / 100).toLocaleString('uk-UA')} ₴</p>
                                        </div>
                                        <div className="text-right space-y-0.5">
                                          <p className="text-bottle/40 uppercase tracking-widest font-bold">Залишок</p>
                                          <p className="text-bottle font-bold text-xs">{((order.total - order.paid_amount) / 100).toLocaleString('uk-UA')} ₴</p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {order.ttn && (
                                      <div className="pt-2 border-t border-bottle/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                                            <Truck className="w-3 h-3 text-blue-600" />
                                          </div>
                                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">ТТН: {order.ttn}</span>
                                        </div>
                                        <CopyButton value={order.ttn} />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {isAdmin && order.status !== 'cancelled' && order.status !== 'completed' && (
                            <div className="pt-6 border-t border-bottle/5 space-y-6">
                              {/* Admin Action Forms */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(order.status === 'awaiting_payment' || order.status === 'pending') && (
                                  <div className="space-y-2">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-bottle/40">Отримана оплата (₴)</label>
                                    <div className="flex gap-2">
                                      <input 
                                        type="number" 
                                        value={adminPaidAmount}
                                        onChange={(e) => setAdminPaidAmount(e.target.value)}
                                        placeholder="Напр: 200"
                                        className="flex-grow border border-bottle/10 px-3 py-2 text-xs focus:border-bottle focus:outline-none"
                                      />
                                      <button 
                                        onClick={() => handleConfirmOrder(order.id)}
                                        className="bg-green-600 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition-colors"
                                      >
                                        Підтвердити
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {(order.status === 'confirmed' || order.status === 'packing' || order.status === 'handed_to_delivery') && (
                                  <div className="space-y-2">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-bottle/40">Номер ТТН</label>
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        value={adminTTN}
                                        onChange={(e) => setAdminTTN(e.target.value)}
                                        placeholder="204000..."
                                        className="flex-grow border border-bottle/10 px-3 py-2 text-xs focus:border-bottle focus:outline-none"
                                      />
                                      <button 
                                        onClick={() => {
                                          if (!adminTTN) return alert('Введіть ТТН');
                                          handleUpdateOrder(order.id, order.status, { ttn: adminTTN });
                                          setAdminTTN('');
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors"
                                      >
                                        Зберегти
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Status Selection & Actions */}
                              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-bottle/5">
                                <div className="flex items-center gap-3">
                                  <label className="text-[9px] uppercase tracking-widest font-bold text-bottle/40">Статус:</label>
                                  <select 
                                    value={order.status}
                                    onChange={(e) => handleUpdateOrder(order.id, e.target.value as any)}
                                    className="bg-white border border-bottle/10 text-[10px] font-bold uppercase tracking-widest px-2 py-1 focus:outline-none focus:border-bottle cursor-pointer"
                                  >
                                    <option value="pending">Новий</option>
                                    <option value="awaiting_payment">Очікує оплати</option>
                                    <option value="confirmed">Підтверджено</option>
                                    <option value="packing">Пакування</option>
                                    <option value="handed_to_delivery">Передано пошті</option>
                                    <option value="shipped">Надіслано</option>
                                    <option value="delivered">Отримано</option>
                                    <option value="completed">Виконано</option>
                                    <option value="cancelled">Скасовано</option>
                                  </select>
                                </div>

                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="text-[9px] uppercase tracking-widest font-bold text-white px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors"
                                  >
                                    Видалити
                                  </button>
                                  <button 
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="text-[9px] uppercase tracking-widest font-bold text-red-500 px-4 py-2 border border-red-100 bg-red-50/30 hover:bg-red-50 transition-colors"
                                  >
                                    Скасувати
                                  </button>
                                </div>
                              </div>
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
