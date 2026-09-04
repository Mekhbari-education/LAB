import { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  HelpCircle, 
  Sparkles, 
  ShoppingCart, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { cn } from '../lib/utils';

export default function Support() {
  const [type, setType] = useState<'suggestion' | 'help' | 'purchase'>('suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsSending(true);
    try {
      const collectionName = type === 'purchase' ? 'purchase_requests' : 'support_tickets';
      const data = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName,
        subject,
        message,
        type,
        status: type === 'purchase' ? 'pending' : 'open',
        createdAt: serverTimestamp()
      };

      if (type === 'purchase') {
        (data as any).featureName = subject;
      }

      await addDoc(collection(db, collectionName), data);
      setSuccess(true);
      setSubject('');
      setMessage('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, type === 'purchase' ? 'purchase_requests' : 'support_tickets');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto px-6 pb-24 rtl font-sans" dir="rtl">
      <Helmet>
        <title>الدعم والاقتراحات | الأرضية الرقمية للمخابر</title>
      </Helmet>

      {/* Header */}
      <header className="text-right space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-widest shadow-sm">
          <HelpCircle size={14} />
          مركز المساعدة والتواصل
        </div>
        <h1 className="text-4xl font-black text-primary tracking-tight">كيف يمكننا مساعدتك؟</h1>
        <p className="text-on-surface/60 text-lg font-bold max-w-2xl leading-relaxed">
          نحن هنا للاستماع إلى اقتراحاتك، حل مشاكلك التقنية، أو تلبية طلباتك لتفعيل مميزات إضافية في المنصة.
        </p>
      </header>

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 border-2 border-emerald-100 p-12 rounded-[40px] text-center space-y-6 shadow-xl"
        >
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
            <CheckCircle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-emerald-900">تم إرسال طلبك بنجاح!</h2>
            <p className="text-emerald-700/70 font-bold text-lg">سوف يقوم فريق الإدارة (فيصل عسول) بمراجعة طلبك والرد عليك في أقرب وقت.</p>
          </div>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-emerald-600 text-white px-12 py-4 rounded-full font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
          >
            إرسال طلب آخر
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface p-10 rounded-[40px] border border-outline/10 shadow-2xl space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mt-32 blur-3xl pointer-events-none" />
          
          <div className="space-y-6">
            <label className="text-sm font-black text-primary block pr-2">نوع الطلب</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                type="button"
                onClick={() => setType('suggestion')}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center group",
                  type === 'suggestion' ? "border-primary bg-primary/5 text-primary shadow-xl" : "border-outline/10 hover:border-primary/40 text-on-surface/60"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  type === 'suggestion' ? "bg-primary text-on-primary" : "bg-surface-container-low group-hover:bg-primary/20"
                )}>
                  <Sparkles size={24} />
                </div>
                <span className="font-black text-sm tracking-tight">اقتراح ميزة جديدة</span>
              </button>

              <button 
                type="button"
                onClick={() => setType('help')}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center group",
                  type === 'help' ? "border-primary bg-primary/5 text-primary shadow-xl" : "border-outline/10 hover:border-primary/40 text-on-surface/60"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  type === 'help' ? "bg-primary text-on-primary" : "bg-surface-container-low group-hover:bg-primary/20"
                )}>
                  <MessageSquare size={24} />
                </div>
                <span className="font-black text-sm tracking-tight">طلب مساعدة تقنية</span>
              </button>

              <button 
                type="button"
                onClick={() => setType('purchase')}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center group",
                  type === 'purchase' ? "border-primary bg-primary/5 text-primary shadow-xl" : "border-outline/10 hover:border-primary/40 text-on-surface/60"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  type === 'purchase' ? "bg-primary text-on-primary" : "bg-surface-container-low group-hover:bg-primary/20"
                )}>
                  <ShoppingCart size={24} />
                </div>
                <span className="font-black text-sm tracking-tight">شراء وتفعيل خصائص</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-black text-primary block pr-2">
                {type === 'purchase' ? 'الميزة المطلوب شراؤها' : 'الموضوع'}
              </label>
              <input 
                required
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={type === 'purchase' ? 'مثال: باقة الجرد السنوية، سعة تخزين إضافية...' : 'أدخل عنواناً واضحاً لطلبك'}
                className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/30 py-4 px-6 rounded-2xl font-bold text-lg outline-none transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-primary block pr-2">تفاصيل الطلب</label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={type === 'suggestion' ? 'اشرح لنا كيف يمكننا تحسين المنصة من أجلك...' : 'يرجى كتابة كافة التفاصيل لمساعدتك بشكل أفضل'}
                rows={6}
                className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/30 py-4 px-6 rounded-2xl font-medium text-lg outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
            <button 
              type="submit"
              disabled={isSending}
              className="w-full md:w-auto bg-primary text-on-primary px-12 py-5 rounded-full font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSending ? (
                <div className="w-6 h-6 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              ) : (
                <Send size={24} />
              )}
              إرسال الطلب للمراجعة
            </button>
            <div className="flex items-center gap-3 text-on-surface/40 px-4">
               <AlertCircle size={18} />
               <p className="text-xs font-bold leading-tight">سيتم معالجة الطلب في أقل من 24 ساعة عمل.</p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
