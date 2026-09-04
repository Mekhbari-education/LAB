import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDocFromServer, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { RefreshCcw, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Database, Globe } from 'lucide-react';
import { motion } from 'motion/react';

const Diagnostic: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<{ type: 'info' | 'success' | 'error' | 'warning', message: string, detail?: string }[]>([]);
  const [results, setResults] = useState<{
    auth?: boolean;
    connection?: boolean;
    write?: boolean;
    read?: boolean;
  }>({});

  const addLog = (type: 'info' | 'success' | 'error' | 'warning', message: string, detail?: string) => {
    setLogs(prev => [...prev, { type, message, detail }]);
  };

  const runDiagnostics = async () => {
    setStatus('running');
    setLogs([]);
    setResults({});
    addLog('info', 'بدء تشغيل أداة التشخيص الذكية...');

    // 1. Check Configuration
    addLog('info', 'التحقق من إعدادات Firebase...', `Database ID: ${(db as any)._databaseId?.database || 'Unknown'}`);
    
    // 2. Check Auth
    const user = auth.currentUser;
    if (user) {
      addLog('success', 'المستخدم مسجل دخوله', `UID: ${user.uid}`);
      setResults(prev => ({ ...prev, auth: true }));
    } else {
      addLog('warning', 'المستخدم غير مسجل دخوله. بعض التجارب قد تفشل بسبب القواعد الأمنية.');
      setResults(prev => ({ ...prev, auth: false }));
    }

    // 3. Test Connection (Read attempt on special path)
    try {
      addLog('info', 'محاولة الاتصال بقاعدة البيانات (Read Test)...');
      const testDocRef = doc(db, '_connection_test_', 'connectivity_check');
      await getDocFromServer(testDocRef);
      addLog('success', 'تم الاتصال بقاعدة البيانات بنجاح.');
      setResults(prev => ({ ...prev, connection: true }));
    } catch (err: any) {
      addLog('error', 'فشل الاتصال بقاعدة البيانات (أوفلاين أو خطأ في الإعدادات).', err.message);
      setResults(prev => ({ ...prev, connection: false }));
      if (err.message.includes('the client is offline')) {
        addLog('warning', 'الخطأ "offline" يشير عادة إلى أن Database ID غير موجود أو غير مفعل في هذا المشروع.');
      }
    }

    // 4. Test Write (Using the requested specific ID in the message/log context)
    try {
      addLog('info', 'جاري تجربة الكتابة في مجموعة test_sections...');
      const diagnosticsCol = collection(db, 'diagnostics_log');
      const docRef = await addDoc(diagnosticsCol, {
        timestamp: serverTimestamp(),
        testBy: user?.email || 'Anonymous',
        userAgent: navigator.userAgent,
        message: "Smart Diagnostic Web Test",
        databaseId: (db as any)._databaseId?.database || 'Unknown'
      });
      addLog('success', 'نجحت عملية الكتابة (Write Succeeded).', `ID المجلد: ${docRef.id}`);
      setResults(prev => ({ ...prev, write: true }));

      // 5. Test Read back
      try {
        addLog('info', 'محاولة قراءة المجلد المكتوب للتأكد من القواعد الأمنية...');
        const snap = await getDocFromServer(docRef);
        if (snap.exists()) {
          addLog('success', 'قراءة البيانات المكتوبة تمت بنجاح.');
          setResults(prev => ({ ...prev, read: true }));
        } else {
          addLog('error', 'المجلد غير موجود بعد الكتابة! (فشل المحاكاة).');
        }
      } catch (err: any) {
        addLog('error', 'فشل قراءة المجلد (قد تكون القواعد الأمنية تمنع القراءة).', err.message);
        setResults(prev => ({ ...prev, read: false }));
      }

    } catch (err: any) {
      addLog('error', 'فشل عملية الكتابة (Write Failed).', err.message);
      setResults(prev => ({ ...prev, write: false }));
      
      if (err.message.includes('permission-denied')) {
        addLog('warning', 'تنبيه: القواعد الأمنية (Firestore Rules) تمنع الكتابة. تأكد من نشر القواعد الصحيحة.');
      }
    }

    setStatus('success');
  };

  return (
    <div className="min-h-screen bg-surface p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-on-surface">أداة تشخيص الاتصال الذكية</h1>
            <p className="text-sm text-on-surface/60">تحليل مشاكل الاتصال وقواعد البيانات والوصول</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runDiagnostics}
            disabled={status === 'running'}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-2xl font-black shadow-lg disabled:opacity-50"
          >
            {status === 'running' ? <RefreshCcw className="animate-spin h-5 w-5" /> : <RefreshCcw className="h-5 w-5" />}
            تشغيل الفحص
          </motion.button>
        </header>

        {/* Results Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'التوثيق (Auth)', value: results.auth, icon: ShieldCheck },
            { label: 'الاتصال (Conn)', value: results.connection, icon: Globe },
            { label: 'الكتابة (Write)', value: results.write, icon: Database },
            { label: 'القراءة (Read)', value: results.read, icon: CheckCircle2 },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-3xl border border-outline/10 shadow-sm flex flex-col items-center gap-2">
              <item.icon className={`h-8 w-8 ${item.value === true ? 'text-success' : item.value === false ? 'text-error' : 'text-on-surface/20'}`} />
              <div className="text-[10px] font-black">{item.label}</div>
              {item.value === true && <span className="text-[9px] text-success font-bold">نشط</span>}
              {item.value === false && <span className="text-[9px] text-error font-bold">فشل</span>}
            </div>
          ))}
        </div>

        {/* Detailed Logs */}
        <div className="bg-white rounded-3xl border border-outline/10 shadow-xl overflow-hidden">
          <div className="bg-surface/50 p-4 border-b border-outline/10 flex items-center justify-between">
            <span className="font-black text-xs">سجل التشخيص الفني</span>
            {status === 'running' && <span className="text-[10px] text-primary animate-pulse">جاري التحليل...</span>}
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {logs.length === 0 && (
              <div className="py-12 flex flex-col items-center text-on-surface/30">
                <AlertTriangle className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-xs">اضغط على زر الفحص لبدء تحليل النظام</p>
              </div>
            )}
            {logs.map((log, i) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={i}
                className={`p-3 rounded-2xl border ${
                  log.type === 'success' ? 'bg-success/5 border-success/20 text-success' :
                  log.type === 'error' ? 'bg-error/5 border-error/20 text-error' :
                  log.type === 'warning' ? 'bg-warning/5 border-warning/20 text-warning' :
                  'bg-surface border-outline/10 text-on-surface'
                }`}
              >
                <div className="flex items-start gap-3">
                  {log.type === 'success' && <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
                  {log.type === 'error' && <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                  {log.type === 'warning' && <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />}
                  <div className="space-y-1">
                    <p className="text-xs font-black">{log.message}</p>
                    {log.detail && <p className="text-[10px] opacity-70 font-mono break-all">{log.detail}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actionable Advice */}
        {results.connection === false && (
          <div className="bg-error/10 p-6 rounded-3xl border border-error/20">
            <h3 className="font-black text-error mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              نصائح لحل مشكلة "Offline"
            </h3>
            <ul className="text-xs space-y-2 text-error/80 list-disc list-inside">
              <li>تأكد من أن <b>Database ID</b> المسمى <code className="bg-error/20 px-1 rounded">ai-studio-9137fe80-1a36-40c2-be63-979b26259c24</code> قد تم إنشاؤه بالفعل في Firestore Console.</li>
              <li>تحقق من أن قاعدة البيانات في وضع <b>Enterprise Edition</b> وليست Standard إذا كنت تستخدم معرّف مخصص.</li>
              <li>قد يستغرق تفعيل قاعدة البيانات الجديدة بضع دقائق بعد الإنشاء.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diagnostic;
