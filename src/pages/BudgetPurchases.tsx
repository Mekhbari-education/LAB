import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { db, getUserCollection } from '../firebase';
import { getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
  Wallet, Receipt, Users, Plus, Trash2, Edit, CheckCircle2, 
  Clock, XCircle, FileText, ShoppingCart, AlertCircle, 
  TrendingDown, TrendingUp, Save, X, Phone, Mail, MapPin,
  Printer, BookOpen, FlaskConical, Beaker, Cpu, Dna, ShieldAlert,
  PackageCheck, Search, Filter, Sparkles, Check, ArrowRight, Eye, ChevronDown, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PURCHASE_ORDER_TEMPLATES, 
  PurchaseOrderTemplate, 
  calculateTemplateTotal, 
  OrderTemplateItem 
} from '../data/purchaseOrderTemplates';
import { 
  PurchaseOrderPrintService, 
  PrintablePurchaseOrder 
} from '../services/purchaseOrderPrintService';
import { formatSchoolWithCommune } from '../lib/utils';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

interface OrderItem {
  id: string; // unique id for row
  name: string;
  referenceCode?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  description?: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  date: any;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  total: number;
  notes: string;
  templateCode?: string;
}

interface BudgetConfig {
  annualBudget: number;
  fiscalYear: string;
}

export default function BudgetPurchases() {
  const { schoolId, schoolName, directorate, commune, schoolLogo } = useSchool();
  const [activeTab, setActiveTab] = useState<'orders' | 'templates' | 'suppliers' | 'budget'>('orders');
  const [loading, setLoading] = useState(true);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>({ 
    annualBudget: 0, 
    fiscalYear: new Date().getFullYear().toString() 
  });
  const [lowStockSuggestions, setLowStockSuggestions] = useState<any[]>([]);

  // Templates Filter & Search
  const [templateCategory, setTemplateCategory] = useState<string>('all');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [viewingTemplate, setViewingTemplate] = useState<PurchaseOrderTemplate | null>(null);

  // Orders Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Modals
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier>>({});
  
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<PurchaseOrder>>({
    status: 'draft',
    items: [],
    subtotal: 0,
    total: 0
  });

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showTemplateSelectorModal, setShowTemplateSelectorModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [schoolId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch budget
      const budgetDoc = await getDoc(doc(getUserCollection(schoolId, 'budget_config'), 'budget'));
      if (budgetDoc.exists()) {
        setBudgetConfig(budgetDoc.data() as BudgetConfig);
      }

      // Fetch suppliers
      const supSnap = await getDocs(query(getUserCollection(schoolId, 'suppliers')));
      const supData = supSnap.docs.map(d => ({ id: d.id, ...d.data() } as Supplier));
      setSuppliers(supData);

      // Fetch orders
      const ordSnap = await getDocs(query(getUserCollection(schoolId, 'purchase_orders'), orderBy('date', 'desc')));
      const ordData = ordSnap.docs.map(d => ({ id: d.id, ...d.data() } as PurchaseOrder));
      setOrders(ordData);

      // Fetch low stock chemicals to suggest
      const chemSnap = await getDocs(query(getUserCollection(schoolId, 'chemicals')));
      const lowStock = chemSnap.docs
        .map(d => d.data())
        .filter(c => Number(c.quantity) <= 5)
        .map(c => ({ name: c.nameAr || c.nameEn, currentStock: c.quantity }));
      setLowStockSuggestions(lowStock);

    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const spentBudget = orders
    .filter(o => o.status === 'sent' || o.status === 'received')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  
  const remainingBudget = budgetConfig.annualBudget - spentBudget;
  const spentPercentage = budgetConfig.annualBudget > 0 ? (spentBudget / budgetConfig.annualBudget) * 100 : 0;

  // Handlers for Suppliers
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentSupplier.id) {
        await updateDoc(doc(getUserCollection(schoolId, 'suppliers'), currentSupplier.id), currentSupplier);
      } else {
        await addDoc(getUserCollection(schoolId, 'suppliers'), currentSupplier);
      }
      setShowSupplierModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to save supplier:", err);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المورد؟')) return;
    try {
      await deleteDoc(doc(getUserCollection(schoolId, 'suppliers'), id));
      fetchData();
    } catch (err) {
      console.error("Failed to delete supplier:", err);
    }
  };

  // Handlers for Orders
  const calculateOrderTotals = (items: OrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
    return { subtotal, total: subtotal };
  };

  const handleItemChange = (itemId: string, field: keyof OrderItem, value: any) => {
    const newItems = (currentOrder.items || []).map(item => {
      if (item.id === itemId) return { ...item, [field]: value };
      return item;
    });
    const totals = calculateOrderTotals(newItems);
    setCurrentOrder(prev => ({ ...prev, items: newItems, ...totals }));
  };

  const handleAddItem = () => {
    const newItem: OrderItem = { 
      id: Date.now().toString(), 
      name: '', 
      unit: 'وحدة',
      quantity: 1, 
      unitPrice: 0 
    };
    const newItems = [...(currentOrder.items || []), newItem];
    const totals = calculateOrderTotals(newItems);
    setCurrentOrder(prev => ({ ...prev, items: newItems, ...totals }));
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = (currentOrder.items || []).filter(item => item.id !== itemId);
    const totals = calculateOrderTotals(newItems);
    setCurrentOrder(prev => ({ ...prev, items: newItems, ...totals }));
  };

  const handleSaveOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const orderData = {
        ...currentOrder,
        items: currentOrder.items || [],
        subtotal: currentOrder.subtotal || 0,
        total: currentOrder.total || 0,
        date: currentOrder.id ? currentOrder.date : serverTimestamp()
      };

      if (currentOrder.id) {
        await updateDoc(doc(getUserCollection(schoolId, 'purchase_orders'), currentOrder.id), orderData);
      } else {
        const newOrderNum = 'PO-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900).toString();
        await addDoc(getUserCollection(schoolId, 'purchase_orders'), { 
          ...orderData, 
          orderNumber: currentOrder.orderNumber || newOrderNum 
        });
      }
      setShowOrderModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to save order:", err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الطلبية نهائياً؟')) return;
    try {
      await deleteDoc(doc(getUserCollection(schoolId, 'purchase_orders'), orderId));
      fetchData();
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(getUserCollection(schoolId, 'purchase_orders'), orderId), { status });
      fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Handler for Budget
  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(getUserCollection(schoolId, 'budget_config'), 'budget'), budgetConfig);
      setShowBudgetModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to save budget:", err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', { style: 'currency', currency: 'DZD' }).format(amount || 0);
  };

  // Apply template to create a new order directly
  const handleApplyTemplate = (template: PurchaseOrderTemplate) => {
    const generatedOrderNum = 'PO-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900).toString();
    const items: OrderItem[] = template.items.map((item, idx) => ({
      id: `${Date.now()}_${idx}`,
      name: item.name,
      referenceCode: item.referenceCode,
      unit: item.unit,
      quantity: item.defaultQuantity,
      unitPrice: item.estimatedPrice,
      description: item.description
    }));

    const totals = calculateOrderTotals(items);

    setCurrentOrder({
      orderNumber: generatedOrderNum,
      supplierId: '',
      supplierName: '',
      status: 'draft',
      items,
      notes: `تم إنشاء الطلبية بناءً على النموذج المعتمد: ${template.title} (${template.code})`,
      templateCode: template.code,
      ...totals
    });

    setShowOrderModal(true);
    setViewingTemplate(null);
  };

  // Import template items inside an existing order modal
  const handleImportTemplateIntoCurrentOrder = (template: PurchaseOrderTemplate, replace = false) => {
    const importedItems: OrderItem[] = template.items.map((item, idx) => ({
      id: `${Date.now()}_${idx}`,
      name: item.name,
      referenceCode: item.referenceCode,
      unit: item.unit,
      quantity: item.defaultQuantity,
      unitPrice: item.estimatedPrice,
      description: item.description
    }));

    const finalItems = replace 
      ? importedItems 
      : [...(currentOrder.items || []), ...importedItems];

    const totals = calculateOrderTotals(finalItems);

    setCurrentOrder(prev => ({
      ...prev,
      items: finalItems,
      notes: prev.notes ? `${prev.notes}\n[تم إدراج بنود من: ${template.title}]` : `تم إدراج بنود من: ${template.title}`,
      ...totals
    }));

    setShowTemplateSelectorModal(false);
  };

  // Print official Purchase Order
  const handlePrintOrder = async (order: Partial<PurchaseOrder>) => {
    try {
      setIsPrinting(true);
      const printable: PrintablePurchaseOrder = {
        orderNumber: order.orderNumber || 'PO-' + new Date().getFullYear() + '-001',
        date: order.date?.toDate ? order.date.toDate() : (order.date || new Date()),
        supplierName: order.supplierName,
        status: order.status || 'draft',
        items: (order.items || []).map(i => ({
          name: i.name,
          referenceCode: i.referenceCode,
          unit: i.unit || 'وحدة',
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          description: i.description
        })),
        subtotal: order.subtotal || 0,
        total: order.total || 0,
        notes: order.notes,
        templateCode: order.templateCode
      };

      await PurchaseOrderPrintService.printOrder(printable, {
        directorate,
        schoolName,
        commune,
        customLogoUrl: schoolLogo,
        academicYear: budgetConfig.fiscalYear ? `${budgetConfig.fiscalYear} / ${Number(budgetConfig.fiscalYear) + 1}` : '2025 / 2026',
        laboratoryName: 'مخبر العلوم الفيزيائية والطبيعية'
      });
    } catch (err) {
      console.error("Print error:", err);
      alert('حدث خطأ أثناء إعداد وثيقة الطباعة');
    } finally {
      setIsPrinting(false);
    }
  };

  // Print direct from template preview
  const handlePrintTemplateDirectly = async (template: PurchaseOrderTemplate) => {
    try {
      setIsPrinting(true);
      const items: OrderItem[] = template.items.map((item, idx) => ({
        id: `${Date.now()}_${idx}`,
        name: item.name,
        referenceCode: item.referenceCode,
        unit: item.unit,
        quantity: item.defaultQuantity,
        unitPrice: item.estimatedPrice,
        description: item.description
      }));
      const totals = calculateOrderTotals(items);

      const printable: PrintablePurchaseOrder = {
        orderNumber: `MOD-${template.code}`,
        date: new Date(),
        supplierName: template.suggestedSupplierType,
        status: 'draft',
        items: items.map(i => ({
          name: i.name,
          referenceCode: i.referenceCode,
          unit: i.unit || 'وحدة',
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          description: i.description
        })),
        subtotal: totals.subtotal,
        total: totals.total,
        notes: `نموذج رسمي مقترح: ${template.title}. ${template.description}`,
        templateCode: template.code
      };

      await PurchaseOrderPrintService.printOrder(printable, {
        directorate,
        schoolName,
        commune,
        customLogoUrl: schoolLogo,
        academicYear: '2025 / 2026',
        laboratoryName: 'مخبر العلوم الفيزيائية والطبيعية'
      });
    } catch (err) {
      console.error("Print error:", err);
    } finally {
      setIsPrinting(false);
    }
  };

  // Filtered Templates
  const filteredTemplates = PURCHASE_ORDER_TEMPLATES.filter(tpl => {
    const matchesCategory = templateCategory === 'all' || tpl.category === templateCategory;
    const matchesSearch = !templateSearch || 
      tpl.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tpl.code.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tpl.description.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tpl.items.some(it => it.name.toLowerCase().includes(templateSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter(ord => {
    const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
    const matchesSearch = !orderSearch || 
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (ord.supplierName && ord.supplierName.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (ord.items && ord.items.some(i => i.name.toLowerCase().includes(orderSearch.toLowerCase())));
    return matchesStatus && matchesSearch;
  });

  // Template icon helper
  const renderTemplateIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className={className} />;
      case 'FlaskConical': return <FlaskConical className={className} />;
      case 'Beaker': return <Beaker className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Dna': return <Dna className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'PackageCheck': return <PackageCheck className={className} />;
      default: return <FileText className={className} />;
    }
  };

  return (
    <div className="p-4 md:p-8 pb-32 max-w-7xl mx-auto font-sans" dir="rtl">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 bg-surface p-6 rounded-3xl border border-outline-variant/40 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Wallet size={32} />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold text-primary">
                تسيير الميزانية وطلبيات المخبر
              </h1>
              <p className="text-sm font-semibold text-secondary">
                {formatSchoolWithCommune(schoolName, commune)} — {directorate}
              </p>
            </div>
          </div>
          <p className="text-secondary max-w-2xl text-sm leading-relaxed">
            نماذج طلبيات الشراء المعتمدة (السجلات الرسمية 34.3 و 36.3، بطاقات الجرد 2.6.2، الكواشف الكيميائية، الزجاجيات والتجهيزات)، تتبع أوامر الشراء، والميزانية السنوية.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => setActiveTab('templates')}
            className="px-4 py-2.5 bg-tertiary/10 text-tertiary hover:bg-tertiary/20 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors border border-tertiary/20"
          >
            <Sparkles size={18} />
            <span>نماذج الطلبيات الجاهزة</span>
          </button>
          
          <button 
            onClick={() => {
              setCurrentOrder({ 
                orderNumber: 'PO-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
                status: 'draft', 
                items: [], 
                subtotal: 0, 
                total: 0 
              });
              setShowOrderModal(true);
            }}
            className="px-5 py-2.5 bg-primary text-on-primary hover:bg-primary/90 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md shadow-primary/20 transition-all"
          >
            <Plus size={18} />
            <span>طلب شراء جديد</span>
          </button>
        </div>
      </header>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-3xl p-6 border border-outline-variant/40 shadow-sm relative overflow-hidden group">
          <div className="absolute -left-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Wallet size={120} />
          </div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-secondary font-bold text-sm">الميزانية السنوية ({budgetConfig.fiscalYear})</h3>
            <button 
              onClick={() => setShowBudgetModal(true)} 
              className="text-xs font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <Edit size={13} /> تعديل
            </button>
          </div>
          <p className="text-3xl font-black text-primary font-mono">{formatCurrency(budgetConfig.annualBudget)}</p>
          <div className="mt-3 text-xs text-secondary font-semibold">
            المبلغ المخصص للمخبر من ميزانية التسيير
          </div>
        </div>

        <div className="bg-surface rounded-3xl p-6 border border-outline-variant/40 shadow-sm relative overflow-hidden group">
          <div className="absolute -left-6 -bottom-6 opacity-5 text-error group-hover:opacity-10 transition-opacity pointer-events-none">
            <TrendingDown size={120} />
          </div>
          <h3 className="text-secondary font-bold text-sm mb-2">الطلبيات المؤكدة والنفقات</h3>
          <p className="text-3xl font-black text-error font-mono">{formatCurrency(spentBudget)}</p>
          <div className="w-full bg-surface-container-high rounded-full h-2 mt-4 overflow-hidden">
            <div 
              className="bg-error h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-secondary font-bold">
            <span>نسبة الاستهلاك:</span>
            <span className="font-mono">{spentPercentage.toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-surface rounded-3xl p-6 border border-outline-variant/40 shadow-sm relative overflow-hidden group">
          <div className="absolute -left-6 -bottom-6 opacity-5 text-success group-hover:opacity-10 transition-opacity pointer-events-none">
            <TrendingUp size={120} />
          </div>
          <h3 className="text-secondary font-bold text-sm mb-2">الميزانية المتبقية</h3>
          <p className="text-3xl font-black text-success font-mono">{formatCurrency(remainingBudget)}</p>
          <p className="text-xs text-secondary mt-4 font-bold">
            {Math.max(100 - spentPercentage, 0).toFixed(1)}% من الميزانية متوفرة للطلبيات القادمة
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-outline-variant/30 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 rounded-2xl font-bold flex items-center gap-2.5 text-sm transition-all ${
            activeTab === 'orders' 
              ? 'bg-primary text-on-primary shadow-md' 
              : 'bg-surface hover:bg-surface-container text-secondary border border-outline-variant/40'
          }`}
        >
          <ShoppingCart size={18} />
          <span>الطلبيات وسندات الشراء ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-5 py-3 rounded-2xl font-bold flex items-center gap-2.5 text-sm transition-all ${
            activeTab === 'templates' 
              ? 'bg-primary text-on-primary shadow-md' 
              : 'bg-surface hover:bg-surface-container text-secondary border border-outline-variant/40'
          }`}
        >
          <Sparkles size={18} className="text-tertiary" />
          <span>نماذج طلبيات الشراء الجاهزة ({PURCHASE_ORDER_TEMPLATES.length})</span>
          <span className="bg-tertiary/20 text-tertiary text-xs px-2 py-0.5 rounded-full font-mono">جديد</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-5 py-3 rounded-2xl font-bold flex items-center gap-2.5 text-sm transition-all ${
            activeTab === 'suppliers' 
              ? 'bg-primary text-on-primary shadow-md' 
              : 'bg-surface hover:bg-surface-container text-secondary border border-outline-variant/40'
          }`}
        >
          <Users size={18} />
          <span>دليل الموردين والممونين ({suppliers.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: ORDER TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          
          {/* Banner & Explanation */}
          <div className="bg-gradient-to-l from-primary/10 via-surface to-tertiary/10 p-6 rounded-3xl border border-outline-variant/40">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Sparkles className="text-tertiary" size={24} />
                  نماذج طلبيات الشراء المقننة للمخبر المدرسي
                </h2>
                <p className="text-sm text-secondary mt-1 max-w-3xl">
                  قوالب جاهزة ومفصلة مطابقة للمناهج والتنظيمات الجزائرية، تشمل السجلات الرسمية (34.3 و 36.3 و 2.6.2)، الكواشف الكيميائية، الزجاجيات، الأجهزة، والوقاية. يمكنك إنشاء طلبية بنقرة واحدة أو طباعة سند الطلبية المعتمد.
                </p>
              </div>
            </div>

            {/* Sub-Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-outline-variant/30">
              {[
                { id: 'all', label: 'جميع النماذج' },
                { id: 'registers', label: 'سجلات إدارية (34.3 - 36.3 - 2.6.2)' },
                { id: 'chemicals', label: 'المواد الكيميائية والكواشف' },
                { id: 'glassware', label: 'الزجاجيات والأواني' },
                { id: 'equipment', label: 'الأجهزة والتجهيزات' },
                { id: 'biology', label: 'البيولوجيا والتشريح SVT' },
                { id: 'safety', label: 'الأمن والسلامة والوقاية' },
                { id: 'annual', label: 'الطلبية السنوية الشاملة' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setTemplateCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    templateCategory === cat.id 
                      ? 'bg-primary text-on-primary shadow-sm' 
                      : 'bg-surface hover:bg-surface-container text-secondary border border-outline-variant/30'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative mt-4">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary" size={18} />
              <input 
                type="text"
                placeholder="ابحث في النماذج (مثال: 34.3، فهلنك، بيشر، ميزان، pH، كسر...)"
                value={templateSearch}
                onChange={e => setTemplateSearch(e.target.value)}
                className="w-full bg-surface pr-10 pl-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-sm"
              />
              {templateSearch && (
                <button 
                  onClick={() => setTemplateSearch('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(tpl => {
              const estimatedTotal = calculateTemplateTotal(tpl);
              return (
                <div 
                  key={tpl.id}
                  className="bg-surface rounded-3xl border border-outline-variant/50 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary/40 transition-all group"
                >
                  <div>
                    {/* Top Row: Icon + Code + Subject */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        {renderTemplateIcon(tpl.iconName)}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono text-xs font-black bg-surface-container-high px-2.5 py-1 rounded-lg text-primary border border-outline-variant/30">
                          {tpl.code}
                        </span>
                        {tpl.targetSubject && (
                          <span className="text-[11px] font-bold text-secondary">
                            {tpl.targetSubject}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-primary mb-2 line-clamp-1 group-hover:text-primary/90">
                      {tpl.title}
                    </h3>

                    <p className="text-xs text-secondary mb-4 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>

                    {/* Quick Stats Pill */}
                    <div className="bg-surface-container-low rounded-2xl p-3 mb-4 flex justify-between items-center text-xs border border-outline-variant/20">
                      <div>
                        <span className="text-secondary font-bold">عدد البنود:</span>{' '}
                        <span className="font-black text-primary font-mono">{tpl.items.length} مواد</span>
                      </div>
                      <div>
                        <span className="text-secondary font-bold">التكلفة التقديرية:</span>{' '}
                        <span className="font-black text-primary font-mono">{formatCurrency(estimatedTotal)}</span>
                      </div>
                    </div>

                    {/* Preview of first 3 items */}
                    <div className="space-y-1.5 mb-5">
                      <div className="text-[11px] font-bold text-secondary flex items-center gap-1">
                        <Layers size={13} /> عينة من البنود المتضمنة:
                      </div>
                      {tpl.items.slice(0, 3).map((it, idx) => (
                        <div key={idx} className="text-xs bg-surface-container/50 px-2.5 py-1.5 rounded-lg flex justify-between items-center text-secondary border border-outline-variant/20">
                          <span className="truncate max-w-[200px] font-semibold text-primary/80">{it.name}</span>
                          <span className="font-mono font-bold text-[11px] shrink-0">× {it.defaultQuantity} {it.unit}</span>
                        </div>
                      ))}
                      {tpl.items.length > 3 && (
                        <div className="text-[11px] text-tertiary font-bold text-left px-1">
                          + {tpl.items.length - 3} بنود أخرى...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-3 border-t border-outline-variant/30">
                    <button
                      onClick={() => handleApplyTemplate(tpl)}
                      className="w-full py-2.5 bg-primary text-on-primary hover:bg-primary/90 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <ShoppingCart size={15} />
                      <span>إنشاء طلبية بهذا النموذج</span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingTemplate(tpl)}
                        className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30"
                      >
                        <Eye size={14} />
                        <span>تفاصيل البنود</span>
                      </button>

                      <button
                        onClick={() => handlePrintTemplateDirectly(tpl)}
                        disabled={isPrinting}
                        className="px-3 py-2 bg-surface hover:bg-tertiary/10 text-secondary hover:text-tertiary rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-outline-variant/30"
                        title="طباعة سند الطلبية المعتمد لهذا النموذج"
                      >
                        <Printer size={15} />
                        <span>طباعة</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="col-span-full p-12 bg-surface rounded-3xl text-center text-secondary border border-dashed border-outline-variant">
                لا توجد نماذج مطابقة لبحثك الحالي.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Action & Filter Header */}
          <div className="bg-surface p-6 rounded-3xl border border-outline-variant/40 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <ShoppingCart className="text-primary" size={24} />
                سجل طلبيات الشراء (Bons de Commande)
              </h2>
              <p className="text-xs text-secondary mt-1">
                متابعة أوامر الشراء ومطابقة المستلمات وطباعة السندات الرسمية.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                <input 
                  type="text" 
                  placeholder="ابحث برقم الطلب، المورد..." 
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  className="w-full bg-surface-container pr-9 pl-3 py-2 rounded-xl text-xs border border-outline-variant/40 focus:border-primary outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="bg-surface-container px-3 py-2 rounded-xl text-xs font-bold border border-outline-variant/40 text-secondary outline-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="draft">مسودات</option>
                <option value="sent">أرسلت للمورد</option>
                <option value="received">مستلمة (مؤكدة)</option>
                <option value="cancelled">ملغاة</option>
              </select>

              <button 
                onClick={() => {
                  setCurrentOrder({ 
                    orderNumber: 'PO-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
                    status: 'draft', 
                    items: [], 
                    subtotal: 0, 
                    total: 0 
                  });
                  setShowOrderModal(true);
                }}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus size={16} /> طلبية جديدة
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-surface rounded-3xl border border-outline-variant/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-surface-container-low text-secondary text-xs">
                  <tr>
                    <th className="p-4 font-bold">رقم الطلب</th>
                    <th className="p-4 font-bold">التاريخ</th>
                    <th className="p-4 font-bold">الممون / الشريك</th>
                    <th className="p-4 font-bold">عدد البنود</th>
                    <th className="p-4 font-bold">المبلغ الإجمالي</th>
                    <th className="p-4 font-bold text-center">الحالة</th>
                    <th className="p-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-sm">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">
                        <div className="flex items-center gap-2">
                          <span>{order.orderNumber}</span>
                          {order.templateCode && (
                            <span className="text-[10px] bg-tertiary/10 text-tertiary px-1.5 py-0.5 rounded font-mono">
                              {order.templateCode}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-secondary">
                        {order.date?.toDate 
                          ? order.date.toDate().toLocaleDateString('ar-DZ') 
                          : (typeof order.date === 'string' ? order.date : 'N/A')}
                      </td>
                      <td className="p-4 font-semibold text-primary">
                        {order.supplierName || 'لم يحدد بعد'}
                      </td>
                      <td className="p-4 font-mono text-xs text-secondary">
                        {order.items?.length || 0} بنود
                      </td>
                      <td className="p-4 font-mono font-black text-primary">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="p-4 text-center">
                        {order.status === 'draft' && (
                          <span className="inline-flex items-center gap-1 bg-surface-container-high text-secondary text-xs font-bold px-3 py-1 rounded-full">
                            <FileText size={13}/> مسودة
                          </span>
                        )}
                        {order.status === 'sent' && (
                          <span className="inline-flex items-center gap-1 bg-tertiary/15 text-tertiary text-xs font-bold px-3 py-1 rounded-full">
                            <Clock size={13}/> أرسلت
                          </span>
                        )}
                        {order.status === 'received' && (
                          <span className="inline-flex items-center gap-1 bg-success/15 text-success text-xs font-bold px-3 py-1 rounded-full">
                            <CheckCircle2 size={13}/> مستلمة
                          </span>
                        )}
                        {order.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 bg-error/15 text-error text-xs font-bold px-3 py-1 rounded-full">
                            <XCircle size={13}/> ملغاة
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => handlePrintOrder(order)}
                            disabled={isPrinting}
                            title="طباعة سند الطلبية المعتمد (Bon de Commande)"
                            className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                          >
                            <Printer size={17} />
                          </button>
                          <button 
                            onClick={() => { setCurrentOrder(order); setShowOrderModal(true); }}
                            title="معاينة وتعديل"
                            className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                          >
                            <Edit size={17} />
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            title="حذف الطلبية"
                            className="p-2 text-secondary hover:text-error hover:bg-error/10 rounded-xl transition-colors"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-secondary border-dashed border-outline-variant">
                        {orders.length === 0 
                          ? 'لا توجد طلبيات مسجلة حالياً. يمكنك البدء باختيار نموذج جاهز أو إنشاء طلبية جديدة.'
                          : 'لا توجد طلبيات مطابقة للفلتر المحدد.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-surface p-6 rounded-3xl border border-outline-variant/40 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-primary">الممونون والشركاء المعتمدون</h2>
              <p className="text-xs text-secondary mt-1">دليل الشركات والموردين المعتمدين لتجهيز المخبر بالمواد والوسائل.</p>
            </div>
            <button 
              onClick={() => { setCurrentSupplier({}); setShowSupplierModal(true); }}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus size={16} /> إضافة ممون جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map(sup => (
              <div 
                key={sup.id} 
                className="bg-surface rounded-3xl p-6 border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow relative group"
              >
                <div className="absolute top-4 left-4 flex gap-1">
                  <button 
                    onClick={() => { setCurrentSupplier(sup); setShowSupplierModal(true); }}
                    className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteSupplier(sup.id)}
                    className="p-2 text-secondary hover:text-error hover:bg-error/10 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-primary mb-1 pl-16">{sup.name}</h3>
                <p className="text-xs text-secondary font-bold mb-4">{sup.contactPerson || 'مسؤول المبيعات'}</p>
                
                <div className="space-y-2 text-xs text-secondary pt-3 border-t border-outline-variant/30">
                  {sup.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={15} className="text-outline"/> 
                      <span dir="ltr" className="font-mono">{sup.phone}</span>
                    </p>
                  )}
                  {sup.email && (
                    <p className="flex items-center gap-2">
                      <Mail size={15} className="text-outline"/> 
                      <span dir="ltr">{sup.email}</span>
                    </p>
                  )}
                  {sup.address && (
                    <p className="flex items-center gap-2">
                      <MapPin size={15} className="text-outline"/> 
                      <span>{sup.address}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}

            {suppliers.length === 0 && (
              <div className="col-span-full p-12 bg-surface rounded-3xl text-center text-secondary border border-dashed border-outline-variant">
                لم يتم تسجيل أي مورد بعد. أضف بيانات الموردين لتسهيل ربطهم بالطلبيات.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        
        {/* VIEW TEMPLATE DETAILS MODAL */}
        {viewingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-surface w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-outline-variant"
            >
              <div className="p-6 bg-surface-container-low border-b border-outline-variant/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    {renderTemplateIcon(viewingTemplate.iconName)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">{viewingTemplate.title}</h3>
                    <p className="text-xs text-secondary font-mono">{viewingTemplate.code} — {viewingTemplate.categoryLabel}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingTemplate(null)} 
                  className="p-2 hover:bg-outline-variant/30 rounded-full text-secondary"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <p className="text-xs text-secondary leading-relaxed bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                  {viewingTemplate.description}
                </p>

                <div className="flex justify-between items-center text-xs font-bold text-secondary">
                  <span>قائمة البنود والمواصفات ({viewingTemplate.items.length} بنود):</span>
                  <span>المجموع التقديري: {formatCurrency(calculateTemplateTotal(viewingTemplate))}</span>
                </div>

                <div className="border border-outline-variant/40 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-surface-container-low text-secondary font-bold">
                      <tr>
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">تعيين المادة / السجل / العتاد</th>
                        <th className="p-3 text-center">الكمية</th>
                        <th className="p-3 text-center">السعر التقريبي</th>
                        <th className="p-3 text-center">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {viewingTemplate.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-surface-container/30">
                          <td className="p-3 text-center font-mono font-bold text-secondary">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-bold text-primary">{it.name}</div>
                            {it.description && <div className="text-[11px] text-secondary mt-0.5">{it.description}</div>}
                            {it.referenceCode && <div className="text-[10px] text-tertiary font-mono">{it.referenceCode}</div>}
                          </td>
                          <td className="p-3 text-center font-mono font-bold">{it.defaultQuantity} {it.unit}</td>
                          <td className="p-3 text-center font-mono">{formatCurrency(it.estimatedPrice)}</td>
                          <td className="p-3 text-center font-mono font-bold">{formatCurrency(it.defaultQuantity * it.estimatedPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low border-t border-outline-variant/50 flex gap-3 shrink-0">
                <button
                  onClick={() => handleApplyTemplate(viewingTemplate)}
                  className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingCart size={16} />
                  <span>استخدام هذا النموذج لإنشاء طلبية</span>
                </button>
                <button
                  onClick={() => handlePrintTemplateDirectly(viewingTemplate)}
                  className="px-5 py-2.5 bg-surface text-secondary hover:text-primary rounded-xl font-bold text-xs border border-outline-variant/50 flex items-center gap-2"
                >
                  <Printer size={16} />
                  <span>طباعة السند</span>
                </button>
                <button
                  onClick={() => setViewingTemplate(null)}
                  className="px-5 py-2.5 bg-surface-container text-secondary rounded-xl font-bold text-xs"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ORDER MODAL (CREATE / EDIT) */}
        {showOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-8 bg-scrim/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-surface w-full max-w-4xl h-full max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-outline-variant"
            >
              <div className="p-6 bg-surface-container-low border-b border-outline-variant/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <ShoppingCart size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">
                      {currentOrder.id ? 'معاينة وتعديل طلبية الشراء' : 'إنشاء طلبية شراء جديدة'}
                    </h3>
                    <p className="text-xs text-secondary font-mono">
                      {currentOrder.orderNumber || 'طلب جديد'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {currentOrder.id && (
                    <select 
                      value={currentOrder.status} 
                      onChange={e => handleUpdateOrderStatus(currentOrder.id!, e.target.value)}
                      className={"px-3 py-1.5 rounded-xl text-xs font-bold outline-none border-none " + 
                        (currentOrder.status === 'draft' ? 'bg-surface-container-high text-secondary' :
                         currentOrder.status === 'sent' ? 'bg-tertiary/20 text-tertiary' :
                         currentOrder.status === 'received' ? 'bg-success/20 text-success' : 'bg-error/20 text-error')
                      }
                    >
                      <option value="draft">مسودة</option>
                      <option value="sent">أرسلت للمورد</option>
                      <option value="received">مستلمة ومطابقة</option>
                      <option value="cancelled">ملغاة</option>
                    </select>
                  )}

                  <button 
                    onClick={() => setShowOrderModal(false)} 
                    className="p-2 hover:bg-outline-variant/30 rounded-full text-secondary"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Order Details Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container p-5 rounded-2xl border border-outline-variant/40">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5">رقم الطلبية (Bon de Commande N°)</label>
                    <input 
                      type="text" 
                      placeholder="PO-2026-..." 
                      value={currentOrder.orderNumber || ''} 
                      onChange={e => setCurrentOrder({...currentOrder, orderNumber: e.target.value})} 
                      className="w-full bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:border-primary outline-none font-mono text-left text-xs" 
                      dir="ltr" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5">اختيار المورد / الممون</label>
                    <select 
                      value={currentOrder.supplierId || ''} 
                      onChange={e => {
                        const sup = suppliers.find(s => s.id === e.target.value);
                        setCurrentOrder({
                          ...currentOrder, 
                          supplierId: e.target.value, 
                          supplierName: sup?.name || ''
                        });
                      }} 
                      className="w-full bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:border-primary outline-none text-xs"
                    >
                      <option value="">-- اختر ممون مسجل (أو اتركه فارغاً للاستشارة) --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.contactPerson})</option>)}
                    </select>
                  </div>
                </div>

                {/* Import from Template Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-tertiary" size={18} />
                    <span className="text-xs font-bold text-primary">
                      يمكنك استيراد بنود كاملة من النماذج الرسمية (سجلات 34.3، 36.3، كواشف، زجاجيات...)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTemplateSelectorModal(true)}
                    className="px-3.5 py-1.5 bg-tertiary text-on-tertiary rounded-xl text-xs font-bold hover:bg-tertiary/90 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <BookOpen size={14} />
                    <span>اختيار من النماذج الجاهزة</span>
                  </button>
                </div>

                {/* Low Stock Alerts */}
                {lowStockSuggestions.length > 0 && !currentOrder.id && (
                  <div className="bg-error/5 border border-error/20 rounded-2xl p-4 flex flex-col gap-2">
                    <p className="text-xs font-bold text-error flex items-center gap-2">
                      <AlertCircle size={15}/> مواد ذات رصيد منخفض في المخزن:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {lowStockSuggestions.map((ls, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => {
                            const newItem: OrderItem = {
                              id: Date.now().toString(),
                              name: ls.name,
                              unit: 'قارورة',
                              quantity: 2,
                              unitPrice: 1500
                            };
                            const newItems = [...(currentOrder.items || []), newItem];
                            const totals = calculateOrderTotals(newItems);
                            setCurrentOrder(prev => ({ ...prev, items: newItems, ...totals }));
                          }}
                          className="text-xs bg-surface border border-error/30 text-secondary hover:border-error px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <span>{ls.name} ({ls.currentStock} متبقي)</span>
                          <span className="text-primary font-bold">+ إضافة</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-primary text-sm">
                      قائمة المواد والعتاد المطلوب ({currentOrder.items?.length || 0})
                    </h4>
                    <button 
                      type="button" 
                      onClick={handleAddItem} 
                      className="text-xs px-3 py-1.5 bg-secondary-container text-primary font-bold rounded-xl hover:bg-secondary-container/80 flex items-center gap-1 transition-colors"
                    >
                      <Plus size={15}/> إضافة سطر جديد
                    </button>
                  </div>

                  <div className="border border-outline-variant/40 rounded-2xl overflow-hidden bg-surface">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-surface-container-low text-secondary">
                        <tr>
                          <th className="p-3 w-5/12">تعيين المادة / السجل / العتاد</th>
                          <th className="p-3 w-2/12">الوحدة</th>
                          <th className="p-3 w-1/12 text-center">الكمية</th>
                          <th className="p-3 w-2/12 text-center">السعر (دج)</th>
                          <th className="p-3 w-2/12 text-center">المجموع</th>
                          <th className="p-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {(currentOrder.items || []).map((item) => (
                          <tr key={item.id} className="hover:bg-surface-container/20">
                            <td className="p-2">
                              <input 
                                type="text" 
                                placeholder="اسم المادة أو السجل" 
                                value={item.name} 
                                onChange={e => handleItemChange(item.id, 'name', e.target.value)} 
                                className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary outline-none px-2 py-1 font-semibold" 
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                type="text" 
                                placeholder="الوحدة (سجل، قارورة..)" 
                                value={item.unit || ''} 
                                onChange={e => handleItemChange(item.id, 'unit', e.target.value)} 
                                className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary outline-none px-2 py-1 text-center" 
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                type="number" 
                                min="1" 
                                value={item.quantity} 
                                onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)} 
                                className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary outline-none px-2 py-1 text-center font-mono font-bold" 
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                type="number" 
                                min="0" 
                                step="10" 
                                value={item.unitPrice} 
                                onChange={e => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} 
                                className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary outline-none px-2 py-1 text-center font-mono" 
                              />
                            </td>
                            <td className="p-2 font-mono text-center font-bold text-primary">
                              {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                            </td>
                            <td className="p-2 text-center">
                              <button 
                                type="button"
                                onClick={() => handleRemoveItem(item.id)} 
                                className="text-error/60 hover:text-error p-1 rounded-lg hover:bg-error/10 transition-colors"
                              >
                                <Trash2 size={15}/>
                              </button>
                            </td>
                          </tr>
                        ))}

                        {(!currentOrder.items || currentOrder.items.length === 0) && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-secondary border-dashed border-outline-variant">
                              الطلبية فارغة حالياً. اضغط "إضافة سطر جديد" أو "اختيار من النماذج الجاهزة" لإدراج المواد.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes and Total */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">ملاحظات وتوجيهات الطلبية</label>
                    <textarea 
                      value={currentOrder.notes || ''} 
                      onChange={e => setCurrentOrder({...currentOrder, notes: e.target.value})} 
                      placeholder="أي مواصفات فنية إضافية أو شروط تسليم..."
                      rows={3}
                      className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs resize-none"
                    />
                  </div>

                  <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/40 space-y-2">
                    <div className="flex justify-between text-xs text-secondary font-bold">
                      <span>المجموع الفرعي:</span>
                      <span className="font-mono">{formatCurrency(currentOrder.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-primary font-black text-base pt-2 border-t border-outline-variant/40">
                      <span>المبلغ الإجمالي التقديري:</span>
                      <span className="font-mono">{formatCurrency(currentOrder.total || 0)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-surface-container-low border-t border-outline-variant/50 flex flex-wrap gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={handleSaveOrder} 
                  className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all"
                >
                  <Save size={16} /> 
                  <span>حفظ الطلبية {currentOrder.status === 'draft' ? '(كمسودة)' : ''}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handlePrintOrder(currentOrder)}
                  disabled={isPrinting}
                  className="px-5 py-3 bg-tertiary/15 text-tertiary hover:bg-tertiary/25 rounded-xl font-bold text-xs flex items-center gap-2 border border-tertiary/30 transition-colors"
                >
                  <Printer size={16} />
                  <span>طباعة السند الرسمي</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setShowOrderModal(false)} 
                  className="px-5 py-3 bg-surface text-secondary rounded-xl font-bold text-xs hover:bg-surface-container border border-outline-variant/40 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* TEMPLATE SELECTOR MODAL (Inside Order Creation) */}
        {showTemplateSelectorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-surface w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-outline-variant"
            >
              <div className="p-5 bg-surface-container-low border-b border-outline-variant/50 flex justify-between items-center shrink-0">
                <h3 className="text-base font-bold text-primary flex items-center gap-2">
                  <Sparkles size={18} className="text-tertiary" />
                  اختيار نموذج لاستيراد بنوده إلى الطلبية
                </h3>
                <button 
                  onClick={() => setShowTemplateSelectorModal(false)} 
                  className="p-1.5 hover:bg-outline-variant/30 rounded-full text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {PURCHASE_ORDER_TEMPLATES.map(tpl => (
                  <div 
                    key={tpl.id}
                    className="p-4 rounded-2xl border border-outline-variant/40 hover:border-primary/50 bg-surface-container-low/50 hover:bg-surface-container-low flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded">
                          {tpl.code}
                        </span>
                        <h4 className="font-bold text-primary text-sm">{tpl.title}</h4>
                      </div>
                      <p className="text-xs text-secondary">{tpl.items.length} بنود — تقدير: {formatCurrency(calculateTemplateTotal(tpl))}</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleImportTemplateIntoCurrentOrder(tpl, false)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary rounded-xl text-xs font-bold transition-all"
                      >
                        + إلحاق بالطلبية
                      </button>
                      <button
                        type="button"
                        onClick={() => handleImportTemplateIntoCurrentOrder(tpl, true)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-surface border border-outline-variant text-secondary hover:text-primary rounded-xl text-xs font-bold transition-all"
                      >
                        استبدال الكل
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-surface-container-low border-t border-outline-variant/50 text-left shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTemplateSelectorModal(false)}
                  className="px-4 py-2 bg-surface text-secondary rounded-xl text-xs font-bold hover:bg-surface-container"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* SUPPLIER MODAL */}
        {showSupplierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-surface w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-outline-variant"
            >
              <div className="p-6 bg-surface-container-low border-b border-outline-variant/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary">
                  {currentSupplier.id ? 'تعديل بيانات المورد' : 'إضافة مورد / ممون جديد'}
                </h3>
                <button onClick={() => setShowSupplierModal(false)} className="p-2 hover:bg-outline-variant/30 rounded-full text-secondary">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveSupplier} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">اسم المؤسسة أو المورد *</label>
                  <input 
                    required 
                    type="text" 
                    value={currentSupplier.name || ''} 
                    onChange={e => setCurrentSupplier({...currentSupplier, name: e.target.value})} 
                    className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none text-xs" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">الشخص المسؤول / جهة الاتصال</label>
                  <input 
                    type="text" 
                    value={currentSupplier.contactPerson || ''} 
                    onChange={e => setCurrentSupplier({...currentSupplier, contactPerson: e.target.value})} 
                    className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none text-xs" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">رقم الهاتف</label>
                  <input 
                    type="text" 
                    dir="ltr" 
                    value={currentSupplier.phone || ''} 
                    onChange={e => setCurrentSupplier({...currentSupplier, phone: e.target.value})} 
                    className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none text-left text-xs font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    dir="ltr" 
                    value={currentSupplier.email || ''} 
                    onChange={e => setCurrentSupplier({...currentSupplier, email: e.target.value})} 
                    className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none text-left text-xs font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">العنوان</label>
                  <textarea 
                    value={currentSupplier.address || ''} 
                    onChange={e => setCurrentSupplier({...currentSupplier, address: e.target.value})} 
                    className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none text-xs resize-none" 
                    rows={2} 
                  />
                </div>
                
                <div className="pt-3 flex gap-3">
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> حفظ البيانات
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowSupplierModal(false)} 
                    className="px-5 py-2.5 bg-surface-container text-secondary rounded-xl font-bold text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* BUDGET MODAL */}
        {showBudgetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-surface w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-outline-variant"
            >
              <div className="p-6 bg-surface-container-low border-b border-outline-variant/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary">تعديل الميزانية السنوية</h3>
                <button onClick={() => setShowBudgetModal(false)} className="p-2 hover:bg-outline-variant/30 rounded-full text-secondary">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveBudget} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">الميزانية السنوية المخصصة (دج)</label>
                  <input 
                    required 
                    min="0" 
                    step="1000" 
                    type="number" 
                    value={budgetConfig.annualBudget || 0} 
                    onChange={e => setBudgetConfig({...budgetConfig, annualBudget: parseFloat(e.target.value) || 0})} 
                    className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none font-mono text-left text-xs" 
                    dir="ltr" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">السنة المالية / الدراسية</label>
                  <input 
                    required 
                    type="text" 
                    value={budgetConfig.fiscalYear || ''} 
                    onChange={e => setBudgetConfig({...budgetConfig, fiscalYear: e.target.value})} 
                    className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none text-xs" 
                  />
                </div>
                
                <div className="pt-3 flex gap-3">
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> حفظ التعديل
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
