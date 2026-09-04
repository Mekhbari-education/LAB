import { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, getUserCollection } from '../firebase';
import { 
  Archive, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  User,
  Eye
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Report {
  id: string;
  title: string;
  generatedAt: any;
  stats: any;
  month: number;
  year: number;
}

export default function ArchivePage() {
  const { schoolId } = useSchool();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const q = query(getUserCollection(schoolId, 'reports'), orderBy('generatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        dateStr: doc.data().generatedAt?.toDate()?.toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' }) || 'غير محدد'
      } as any));
      setReports(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    });
    return () => unsubscribe();
  }, []);

  const filteredReports = reports.filter(r => 
    (r.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     r.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    r.year === selectedYear
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-4">
        <div className="text-right space-y-1">
          <h1 className="text-5xl font-black text-primary tracking-tighter">أرشيف التقارير</h1>
          <p className="text-secondary/80 text-lg font-medium max-w-2xl">سجلات التقارير الشهرية، الإمداد، وعمليات الجرد والإتلاف المؤرشفة للسنوات الدراسية السابقة.</p>
        </div>
        <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-full border border-outline/10 shadow-inner">
          {[2026, 2025, 2024].map(year => (
            <button 
              key={year}
              onClick={() => setSelectedYear(year)}
              className={cn(
                "px-8 py-2.5 rounded-full transition-all font-black text-sm tracking-widest",
                selectedYear === year 
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                  : "text-secondary/60 hover:text-primary hover:bg-surface-container-high"
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </header>

      {/* Search & Filter */}
      <section className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-outline/60" size={22} />
          <input 
            className="w-full bg-surface-container-low border border-outline/10 rounded-full pr-14 pl-6 py-4 text-primary font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
            placeholder="ابحث عن تقرير برقم التسلسل أو العنوان..." 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-surface-container-low text-primary border border-outline/20 px-8 py-4 rounded-full font-black flex items-center gap-3 hover:bg-surface-container-high hover:border-outline/40 transition-all active:scale-95 shadow-sm">
          <Filter size={20} />
          تصفية متقدمة
        </button>
      </section>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          <div className="col-span-full py-32 text-center text-outline/60 font-black text-xl animate-pulse">جاري تحميل الأرشيف...</div>
        ) : filteredReports.length === 0 ? (
          <div className="col-span-full py-32 text-center text-outline/60 font-black text-xl border-2 border-dashed border-outline/10 rounded-[40px]">
            لا توجد تقارير مؤرشفة لهذا العام الدراسي
          </div>
        ) : (
          filteredReports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-surface-container-lowest rounded-[32px] p-8 border border-outline/10 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[60px] -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <span className="px-4 py-1.5 bg-primary-fixed/40 text-primary text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">تقرير شهري</span>
                  <span className="text-secondary/40 text-[10px] font-black uppercase tracking-widest">{(report as any).dateStr}</span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-primary leading-tight group-hover:text-primary-container transition-colors line-clamp-2">{report.title}</h3>
                  <p className="text-[10px] font-mono text-secondary/40 uppercase tracking-widest">REF: {report.id.substring(0, 8)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline/5 group-hover:border-outline/20 transition-all">
                    <p className="text-[10px] text-secondary/60 font-black uppercase tracking-widest mb-1">مواد</p>
                    <p className="text-xl font-black text-primary">{report.stats?.chemicals || 0}</p>
                  </div>
                  <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline/5 group-hover:border-outline/20 transition-all">
                    <p className="text-[10px] text-secondary/60 font-black uppercase tracking-widest mb-1">تجهيزات</p>
                    <p className="text-xl font-black text-primary">{report.stats?.equipment || 0}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-outline/5 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed/60 flex items-center justify-center text-primary shadow-inner">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">المسؤول</p>
                      <p className="text-xs font-black text-primary">النظام</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all active:scale-90 shadow-sm">
                    <ChevronLeft size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      <footer className="mt-16 flex justify-center items-center gap-8 pb-12">
        <button className="w-14 h-14 rounded-full flex items-center justify-center bg-surface-container-low text-primary border border-outline/10 hover:bg-primary hover:text-on-primary hover:border-primary transition-all active:scale-90 shadow-sm">
          <ChevronRight size={24} />
        </button>
        <div className="flex gap-3">
          <span className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-black text-lg shadow-xl shadow-primary/20">1</span>
          <button className="w-12 h-12 rounded-2xl bg-surface-container-low text-secondary/60 flex items-center justify-center font-black text-lg hover:bg-surface-container-high transition-all">2</button>
          <button className="w-12 h-12 rounded-2xl bg-surface-container-low text-secondary/60 flex items-center justify-center font-black text-lg hover:bg-surface-container-high transition-all">3</button>
        </div>
        <button className="w-14 h-14 rounded-full flex items-center justify-center bg-surface-container-low text-primary border border-outline/10 hover:bg-primary hover:text-on-primary hover:border-primary transition-all active:scale-90 shadow-sm">
          <ChevronLeft size={24} />
        </button>
      </footer>
    </div>
  );
}
