import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, checkIsAdmin } from '../firebase';
import { 
  Lock as LockIcon, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShieldCheck, 
  Globe, 
  UserPlus, 
  Facebook, 
  Sun, 
  Moon, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  GraduationCap,
  KeyRound,
  ChevronRight,
  Search,
  CheckCircle2,
  Mail,
  Shield,
  Sparkles
} from 'lucide-react';
import logo from '/ministry-logo.png';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useUserRole, ROLE_CONFIGS } from '../context/UserRoleContext';
import { ROUTES } from '../config/routes';
import { Teacher } from '../types/teachers';
import { getTeachers } from '../lib/api/teachers';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface LoginProps {
  onRoleLogin?: () => void;
}

export default function Login({ onRoleLogin }: LoginProps) {
  const navigate = useNavigate();
  const { setRole, setTeacherLogin, syncUserRoleFromAuth } = useUserRole();
  const [loginTab, setLoginTab] = useState<'email' | 'teacher'>('email');
  const [functionalCode, setFunctionalCode] = useState('');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<React.ReactNode>('');
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [pendingCred, setPendingCred] = useState<any>(null);
  const [linkingMessage, setLinkingMessage] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    // Dynamic loading of reCAPTCHA Enterprise if key is provided
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (siteKey && !document.getElementById('recaptcha-script')) {
      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isFB = ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;
    const isIG = ua.indexOf("Instagram") > -1;
    if (isFB || isIG) {
      setIsInAppBrowser(true);
    }

    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setLoading(true);
          await handlePostLoginUserSync(result.user);
          const resolvedRole = await syncUserRoleFromAuth(result.user.uid, result.user.email);
          onRoleLogin?.();
          const targetPath = ROLE_CONFIGS[resolvedRole]?.defaultPath || ROUTES.HOME;
          navigate(targetPath, { replace: true });
        }
      } catch (err: any) {
        console.error('Redirect result error:', err);
        handleAuthError(err, 'google');
      } finally {
        setLoading(false);
      }
    };
    checkRedirect();
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setTeachersLoading(true);
        const list = await getTeachers();
        if (Array.isArray(list) && list.length > 0) {
          setTeachersList(list);
        } else {
          // Preloaded secondary teachers sample
          const defaults: Teacher[] = [
            {
              id: 'sample-1',
              functionalCode: '2024-PHYS-01',
              name: 'أ. محمد بن العربي',
              firstName: 'محمد',
              lastName: 'بن العربي',
              subject: 'العلوم الفيزيائية والتكنولوجيا',
              rank: 'أستاذ التعليم الثانوي',
              birthDate: '1985-05-12',
              grade: '11',
              effectiveDate: '2012-09-02',
              email: 'phys.larbi@education.dz',
              levels: ['1 ج م ع ت', '2 ع ت', '3 ع ت']
            },
            {
              id: 'sample-2',
              functionalCode: '2024-SNV-02',
              name: 'أ. فاطمة الزهراء قاسمي',
              firstName: 'فاطمة الزهراء',
              lastName: 'قاسمي',
              subject: 'علوم الطبيعة والحياة',
              rank: 'أستاذ رئيسي',
              birthDate: '1988-11-20',
              grade: '09',
              effectiveDate: '2015-09-01',
              email: 'snv.kacemi@education.dz',
              levels: ['1 ج م ع ت', '2 ر', '3 ع ت']
            },
            {
              id: 'sample-3',
              functionalCode: '2024-PHYS-03',
              name: 'أ. كمال عمراوي',
              firstName: 'كمال',
              lastName: 'عمراوي',
              subject: 'العلوم الفيزيائية والتكنولوجيا',
              rank: 'أستاذ مكون',
              birthDate: '1980-03-15',
              grade: '12',
              effectiveDate: '2008-09-01',
              email: 'phys.amraoui@education.dz',
              levels: ['2 ت ر', '3 ت ر']
            }
          ];
          setTeachersList(defaults);
        }
      } catch (e) {
        console.warn('Failed to load teachers for login', e);
      } finally {
        setTeachersLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleTeacherCodeLogin = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = (customCode || functionalCode).trim();
    if (!codeToVerify) {
      setError('يرجى إدخال رقم التعريف الوظيفي للأستاذ.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessInfo(null);

    try {
      let matched = teachersList.find(t => 
        (t.functionalCode && t.functionalCode.trim().toLowerCase() === codeToVerify.toLowerCase()) ||
        (t.id && t.id.toLowerCase() === codeToVerify.toLowerCase()) ||
        (t.name && t.name.trim().toLowerCase() === codeToVerify.toLowerCase())
      );

      if (!matched) {
        try {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          let tQuery = query(collection(db, 'teachers'), where('functionalCode', '==', codeToVerify));
          let tSnap = await getDocs(tQuery);
          if (tSnap.empty) {
            tQuery = query(collection(db, 'teachers'), where('id', '==', codeToVerify));
            tSnap = await getDocs(tQuery);
          }
          if (!tSnap.empty) {
            const docData = tSnap.docs[0].data();
            matched = { id: tSnap.docs[0].id, ...docData } as Teacher;
          }
        } catch (dbErr) {
          console.warn('Teacher lookup fallback:', dbErr);
        }
      }

      if (!matched) {
        setError('الرمز الوظيفي غير مسجل في قاعدة الأساتذة. يرجى التأكد من كتابة الرمز بشكل صحيح كما هو مدون في بطاقتك المهنية، أو التواصل مع إدارة المؤسسة لإدراج بياناتك.');
        setLoading(false);
        return;
      }

      setTeacherLogin(matched);

      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (anonErr) {
        // Session handled locally via role state
      }

      setSuccessInfo(`مرحباً بك ${matched.name}. جاري نقلك إلى فضاء الأستاذ...`);
      onRoleLogin?.();
      setTimeout(() => {
        navigate(ROUTES.TEACHER_PORTAL, { replace: true });
      }, 350);
    } catch (err: any) {
      console.error('Error logging in teacher:', err);
      setError('تعذر تسجيل الدخول بالرمز الوظيفي. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني أولاً.');
      return;
    }
    setError('');
    setSuccessInfo(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessInfo('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح. يرجى مراجعة صندوق الوارد (أو مجلد الرسائل غير المرغوب فيها Spam).');
      setIsResetting(false);
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('هذا البريد الإلكتروني غير مسجل لدينا في النظام.');
      } else if (err.code === 'auth/invalid-email') {
        setError('صيغة عنوان البريد الإلكتروني غير صالحة.');
      } else {
        setError('حدث خطأ أثناء محاولة إرسال رابط إعادة التعيين. يرجى المحاولة لاحقاً.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessInfo(null);
    setLoading(true);
    
    if (!isLogin && password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const loggedUser = userCredential.user;
        await handlePostLoginUserSync(loggedUser);
        const resolvedRole = await syncUserRoleFromAuth(loggedUser.uid, loggedUser.email);
        onRoleLogin?.();
        const roleLabel = ROLE_CONFIGS[resolvedRole]?.label || 'النظام';
        setSuccessInfo(`تم تسجيل الدخول بنجاح بصفتك (${roleLabel}). جاري التوجيه...`);
        const targetPath = ROLE_CONFIGS[resolvedRole]?.defaultPath || ROUTES.HOME;
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 350);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const newUser = userCredential.user;
        const isAdmin = await checkIsAdmin(newUser);
        const defaultRole = isAdmin ? 'director' : 'lab_manager';
        
        await setDoc(doc(db, 'users', newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          role: defaultRole,
          displayName: newUser.displayName || newUser.email?.split('@')[0] || 'موظف',
          photoURL: newUser.photoURL || null,
          createdAt: new Date().toISOString()
        }, { merge: true });

        const resolvedRole = await syncUserRoleFromAuth(newUser.uid, newUser.email);
        onRoleLogin?.();
        const targetPath = ROLE_CONFIGS[resolvedRole]?.defaultPath || ROUTES.HOME;
        navigate(targetPath, { replace: true });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(
          <div className="text-right p-4 bg-error/5 rounded-2xl border border-error/20">
            <p className="font-black text-error mb-2">النطاق غير مصرح به في إعدادات Firebase</p>
            <p className="text-[10px] mb-3">يجب إضافة هذا النطاق في إعدادات Firebase Console لتفعيل تسجيل الدخول.</p>
            <div className="bg-surface p-2 rounded-lg text-[9px] font-mono mb-4 text-center">{window.location.hostname}</div>
            <a href={`https://console.firebase.google.com/project/${auth.app.options.projectId}/authentication/settings`} target="_blank" rel="noopener noreferrer" className="block w-full bg-primary text-on-primary py-2 rounded-xl text-center text-xs font-black">إعدادات النطاقات</a>
          </div>
        );
      } else if (isLogin) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق من صحة البيانات أو استخدام استعادة كلمة المرور.');
        } else if (err.code === 'auth/invalid-email') {
          setError('صيغة عنوان البريد الإلكتروني غير صالحة.');
        } else if (err.code === 'auth/too-many-requests') {
          setError('تم تقييد محاولات الدخول مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى الانتظار دقيقة والمحاولة مجدداً.');
        } else if (err.code === 'auth/network-request-failed') {
          setError('تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
        } else if (err.code === 'auth/user-disabled') {
          setError('تم تعطيل هذا الحساب من قبل إدارة النظام.');
        } else {
          setError('خطأ في تسجيل الدخول. يرجى التحقق من صحة البريد الإلكتروني وكلمة المرور.');
        }
      } else {
        if (err.code === 'auth/email-already-in-use') {
          setError('هذا البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.');
        } else if (err.code === 'auth/weak-password') {
          setError('كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 أحرف أو أرقام على الأقل.');
        } else {
          setError('فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostLoginUserSync = async (user: any) => {
    if (pendingCred) {
      try {
        await linkWithCredential(user, pendingCred);
        setPendingCred(null);
        setLinkingMessage(null);
      } catch (linkErr) {
        console.error('Error linking account:', linkErr);
      }
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const isAdmin = await checkIsAdmin(user);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          role: isAdmin ? 'director' : 'lab_manager',
          displayName: user.displayName || user.email?.split('@')[0] || 'مستخدم جديد',
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString()
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          photoURL: user.photoURL || null,
          displayName: user.displayName || userDoc.data()?.displayName || user.email?.split('@')[0]
        }, { merge: true });
      }
    } catch (profileErr) {
      console.warn('User profile sync non-fatal warning:', profileErr);
    }
  };

  const handleAuthError = (err: any, providerType: 'google' | 'facebook') => {
    console.error(`${providerType} login error:`, err);
    setLoading(false);

    if (err.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      const projectId = auth.app.options.projectId || 'education-dz-lab';
      
      setError(
        <div className="text-right p-4 bg-error/10 rounded-2xl border border-error/30 space-y-3">
          <div className="flex items-center gap-2 text-error font-black text-xs">
            <AlertCircle size={18} className="shrink-0" />
            <span>النطاق غير مصرح به في إعدادات Firebase</span>
          </div>
          <p className="text-[11px] text-on-surface/80 leading-relaxed">
            لتسجيل الدخول بحساب جوجل من هذا الجهاز، يجب إضافة اسم النطاق التالي إلى قائمة <b>Authorized Domains</b> في مشروع Firebase:
          </p>
          <div className="bg-surface p-2.5 rounded-xl border border-outline/20 font-mono text-[11px] select-all flex items-center justify-between text-left dir-ltr gap-2">
            <span className="font-bold text-primary truncate">{currentHost}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(currentHost);
                setCopiedDomain(true);
                setTimeout(() => setCopiedDomain(false), 3000);
              }}
              className="text-[10px] bg-primary hover:bg-primary-container text-on-primary px-3 py-1 rounded-lg font-sans font-bold transition-all shrink-0 flex items-center gap-1"
            >
              {copiedDomain ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedDomain ? 'تم النسخ!' : 'نسخ النطاق'}</span>
            </button>
          </div>
          <div className="space-y-2 pt-1">
            <a
              href={`https://console.firebase.google.com/project/${projectId}/authentication/settings`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary text-on-primary py-2.5 rounded-xl text-center text-xs font-black hover:bg-primary-container transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>فتح صفحة إعدادات Firebase</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      );
    } else if (err.code === 'auth/popup-blocked') {
      setError(
        <div className="text-right p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-3">
          <p className="font-black text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>قام المتصفح بحظر نافذة تسجيل الدخول المنبثقة</span>
          </p>
          <p className="text-[11px] text-on-surface/80 leading-relaxed">
            يرجى السماح بالنوافذ المنبثقة في متصفحك، أو الضغط على الزر أدناه للمتابعة عبر صفحة الدخول المباشرة:
          </p>
          <button
            type="button"
            onClick={() => handleGoogleLogin(true)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-black transition-colors"
          >
            المتابعة عبر إعادة التوجيه
          </button>
        </div>
      );
    } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      setError('تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية. يرجى الضغط مجدداً واختيار حسابك.');
    } else {
      setError(err?.message || `فشل تسجيل الدخول عبر ${providerType === 'google' ? 'جوجل' : 'فيسبوك'}. يرجى المحاولة مرة أخرى.`);
    }
  };

  const handleGoogleLogin = async (forceRedirect = false) => {
    setError('');
    setSuccessInfo(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      let loggedUser: any = null;

      if (forceRedirect) {
        await signInWithRedirect(auth, provider);
        return;
      }

      try {
        const result = await signInWithPopup(auth, provider);
        loggedUser = result.user;
      } catch (popupErr: any) {
        if (popupErr.code === 'auth/popup-blocked') {
          console.warn('Popup blocked by browser, falling back to redirect...');
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }

      if (loggedUser) {
        await handlePostLoginUserSync(loggedUser);
        const resolvedRole = await syncUserRoleFromAuth(loggedUser.uid, loggedUser.email);
        onRoleLogin?.();
        const roleLabel = ROLE_CONFIGS[resolvedRole]?.label || 'النظام';
        setSuccessInfo(`تم تسجيل الدخول بنجاح بصفتك (${roleLabel}). جاري التوجيه...`);
        const targetPath = ROLE_CONFIGS[resolvedRole]?.defaultPath || ROUTES.HOME;
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 350);
      }
    } catch (err: any) {
      handleAuthError(err, 'google');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async (forceRedirect = false) => {
    setError('');
    setSuccessInfo(null);
    setLoading(true);
    const provider = new FacebookAuthProvider();

    try {
      let loggedUser: any = null;

      if (forceRedirect) {
        await signInWithRedirect(auth, provider);
        return;
      }

      try {
        const result = await signInWithPopup(auth, provider);
        loggedUser = result.user;
      } catch (popupErr: any) {
        if (popupErr.code === 'auth/popup-blocked') {
          console.warn('Popup blocked, falling back to redirect...');
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }

      if (loggedUser) {
        await handlePostLoginUserSync(loggedUser);
        const resolvedRole = await syncUserRoleFromAuth(loggedUser.uid, loggedUser.email);
        onRoleLogin?.();
        const roleLabel = ROLE_CONFIGS[resolvedRole]?.label || 'النظام';
        setSuccessInfo(`تم تسجيل الدخول بنجاح بصفتك (${roleLabel}). جاري التوجيه...`);
        const targetPath = ROLE_CONFIGS[resolvedRole]?.defaultPath || ROUTES.HOME;
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 350);
      }
    } catch (err: any) {
      handleAuthError(err, 'facebook');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachersList.filter(t => {
    if (!teacherSearchQuery.trim()) return true;
    const q = teacherSearchQuery.trim().toLowerCase();
    return (
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.functionalCode && t.functionalCode.toLowerCase().includes(q)) ||
      (t.subject && t.subject.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-surface-container-low text-on-surface min-h-screen flex overflow-hidden rtl font-sans" dir="rtl">
      {/* Left Panel: Photo Mosaic & Institutional Identity (70% on large screens) */}
      <section className="hidden md:flex md:w-[65%] lg:w-[70%] relative bg-primary-dim p-8 flex-col justify-between overflow-hidden">
        {/* Background Mosaic Overlay */}
        <div className="absolute inset-0 opacity-40 z-0 p-4">
          <div className="mosaic-container">
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant col-span-3">
              <img className="w-full h-full object-cover" data-alt="Laboratory workspace" src="https://lh3.googleusercontent.com/pw/AP1GczM0GuSeqOIu4HjXaxiFY1gk_DLyU6Aa7YA52_xQmRMYonbemhhUSB91x3mCAG9zvL8BimBdC2ydwiQ-weQzy3axW97QF96HYbWmlmepbSe4z7PNXw43k543nd3jVBJIwEmUNuLSipOGjJi1SHW4Qqk=w1000-h667-s-no-gm?authuser=0" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant col-span-2 row-span-1">
              <img className="w-full h-full object-cover" data-alt="Science laboratory equipment" src="https://lh3.googleusercontent.com/pw/AP1GczM9oE1KF28-A07sotiA8OeP-9g7Yqyh6RD2O8wliqyhfuIU7BLIhOxX28SNvRv2sssSz54P7bO_eXeqnbCiZxATEBsw6R4F6zzIM45gAH1gL-lZTij1ProIIgmAIvRyWVG0-d1BjaB0MfLsUW-TTrc=w1000-h667-s-no-gm?authuser=0" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant">
              <img className="w-full h-full object-cover" data-alt="Reaction tubes" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3v04XZdR-wrr-yl9jm1TwqSzZh1tB2Q_b2seHi78Pot77MsMKUR_IfLse_SOAchzoJnl9_QyxHYtsxc5wu26u4ADOAzYFgqR8gRymImjjvvT-bDPHvCmLBkeobQG0AcqNGd6vHpntlBztJ221uKcrlHe0ThJ4WLglF7F8BkpxNeqIax36ScCmlka5P905m6gshhHSbmcp0nBeSVUvuNGqULHF4tyOFKqEbn_cMXOMT09UhVajKnS6za7T-T9mTkBJ2In2H4Gg4-4" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant">
              <img className="w-full h-full object-cover" data-alt="Modern high school lab" src="https://lh3.googleusercontent.com/pw/AP1GczPdQagS-b6DS31MBTO5A9U4U2LFfXQftpPnDU7RlZUnxdrC5diIftYLgPS55MXCU1P1v9SnBrdUt2ZYr5vUwjl6x-rSzkFvf9tvtH0dhZ2VLAEs3yJNfEFSzJ7hvv-Iq8qVB3GOXYb6c679HsRe2Hc=w1000-h667-s-no-gm?authuser=0" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant">
              <img className="w-full h-full object-cover" data-alt="Science workspace" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPFGMsi61n29fUlKz-g9O3v3RDqIUPJA-Hd-3Eu1vZT6fsKe2dpWiZ7MV1j0aH8pGMUtKYujyGg7yo14gbULLD8FmKF7ag0U5RHVEmXsc0-SeQNOp9JnqjZbQQBPm2DpU7SYOV219H8rSwcmew0izuW-mE8sbqaY5a5URddDsyPQSPBpaQ6Jo9iOTwSDEdGfgCNZQHKxaiBQCz14goom5XhB_lg9h57mvcwYPBjAvGFjRkoFxUUx7K_wexj5aaQKzt7e0fzITXWS8" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant">
              <img className="w-full h-full object-cover" data-alt="Algerian school science lab" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuu21W2NVmM2_12ChkPiiiSFralvib0a8U_lpsxVaAOqbHci_xBeb_JzUYm5XLunM43cDfllelPvxX21ruhld2KlTUw8FSodp75yDnZJzIIlbv6blmsbjAaJu19MR8mfi4mkJ-073-m-tswkhO1H2z5du4QRJq_lTCwpirBx8j-3zaZds9KBDsILc4gumE1CcSVNFpmJ0c6dju6Es6rRVo4hqT49j8sgYAEeY1qdkH9a0CkPRigO2YkJrX33Zkvautpubi87g-m7Y" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
        {/* Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b3d2f]/95 via-[#234e3c]/85 to-[#0f241c]/90 z-10"></div>
        
        {/* Branding Content */}
        <div className="relative z-20 h-full flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-surface/10 backdrop-blur-md rounded-2xl flex items-center justify-center p-2 shadow-lg border border-white/10">
              <img 
                src={logo}
                alt="Ministry Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-white text-3xl font-black tracking-tight leading-none">الأرضية الرقمية</h1>
              <p className="text-emerald-300 text-sm mt-1 font-bold">فضاء تسيير المخابر والتجهيزات العلمية</p>
            </div>
          </div>
          <div className="mt-auto py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4 border border-emerald-400/20">
              <Sparkles size={14} />
              <span>نظام موحد لجميع الرتب التربوية والإدارية</span>
            </div>
            <h2 className="text-white text-5xl lg:text-6xl font-black mb-4 leading-tight">التميز العلمي في <br />قلب المنظومة التربوية</h2>
            <p className="text-emerald-100/90 text-lg max-w-lg leading-relaxed">
              منصة مؤسساتية متكاملة تضمن الكشف التلقائي عن رتبة الموظف (مدير، ناظر، أستاذ، مقتصد، ملحق مخبر) وتوجيهه فوراً إلى بوابته المعتمدة.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-white/50 text-xs font-black uppercase tracking-wider border-t border-white/10 pt-4">
            <span className="flex items-center gap-2 text-white/70">
              <Globe size={14} aria-hidden="true" /> وزارة التربية الوطنية — الجمهورية الجزائرية
            </span>
            <Link className="hover:text-white transition-colors" to="/privacy-policy">سياسة الخصوصية</Link>
            <Link className="hover:text-white transition-colors" to="/terms-of-service">شروط الخدمة</Link>
            <Link className="hover:text-white transition-colors" to="/data-deletion">حذف البيانات</Link>
          </div>
        </div>
      </section>

      {/* Right Panel: Unified Auth Form (30-35%) */}
      <main className="w-full md:w-[35%] lg:w-[30%] bg-surface-container-low relative flex flex-col items-center justify-center p-4 md:p-8 lg:p-8 overflow-y-auto">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="absolute top-4 left-4 p-2.5 bg-surface border border-outline/10 hover:bg-secondary-container/50 rounded-full text-primary transition-all z-20 shadow-xs"
          title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-md relative z-10 my-auto">
          {/* Top Header */}
          <div className="text-center mb-5">
            {isInAppBrowser && (
              <div className="mb-3 p-2.5 bg-primary/10 rounded-2xl border border-primary/20 text-right">
                <p className="text-[10px] font-black text-primary mb-1 flex items-center gap-1.5">
                  <Globe size={12} /> تنبيه لمستخدمي فيسبوك/إنستغرام
                </p>
                <p className="text-[9px] text-on-surface/70 leading-relaxed mb-2">
                  لتجنب مشاكل تسجيل الدخول، يفضل فتح الموقع في متصفح Chrome الأساسي أو عبر الرابط المباشر.
                </p>
                <button 
                  onClick={() => window.location.href = "https://education-dz-lab.firebaseapp.com"}
                  className="w-full bg-primary text-on-primary py-1.5 rounded-lg text-[9px] font-black"
                >
                  فتح الرابط المباشر المستقر
                </button>
              </div>
            )}
            <img 
              src={logo}
              alt="Logo" 
              className="w-24 h-24 md:w-28 md:h-28 object-contain mx-auto mb-3"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-lg md:text-xl font-black text-primary font-serif tracking-tight">الأرضية الرقمية للمخابر</h3>
            <p className="text-on-surface/60 font-bold text-xs mt-0.5">تسجيل الدخول الموحد مع التوجيه الآلي للرتب</p>
          </div>

          {/* Institutional Signup Callout */}
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-indigo-500/10 border border-primary/20 flex items-center justify-between gap-3 text-right">
            <div>
              <span className="text-xs font-black text-primary block">موظف جديد بالمؤسسة؟</span>
              <span className="text-[10px] text-on-surface/70 block">سجّل حسابك المؤسساتي باختيار رتبتك (مدير، ناظر، أستاذ، ملحق مخبر، مقتصد)</span>
            </div>
            <Link
              to={ROUTES.SIGNUP}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-black transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus size={14} />
              <span>إنشاء حساب</span>
            </Link>
          </div>

          {/* Unified Two-Tab Switcher: 1. Official Email (Unified Auto-Detection) / 2. Teacher Code */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface rounded-2xl border border-outline/15 mb-5 shadow-xs">
            <button
              type="button"
              onClick={() => { setLoginTab('email'); setError(''); setSuccessInfo(null); }}
              className={cn(
                "py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                loginTab === 'email'
                  ? "bg-primary text-on-primary shadow-xs font-black"
                  : "text-on-surface/70 hover:bg-surface-container-high"
              )}
            >
              <User size={16} />
              <span>تسجيل الدخول الرسمي</span>
            </button>

            <button
              type="button"
              onClick={() => { setLoginTab('teacher'); setError(''); setSuccessInfo(null); }}
              className={cn(
                "py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                loginTab === 'teacher'
                  ? "bg-sky-600 text-white shadow-xs font-black"
                  : "text-on-surface/70 hover:bg-surface-container-high"
              )}
            >
              <GraduationCap size={16} />
              <span>فضاء الأساتذة بالرمز</span>
            </button>
          </div>

          {/* Success Banner */}
          {successInfo && (
            <div className="text-xs font-bold p-3.5 rounded-2xl text-center border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 mb-4 flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="text-xs font-black p-3.5 rounded-2xl text-center border bg-error/10 text-error border-error/20 mb-4 animate-shake">
              {error}
            </div>
          )}

          {/* TAB 1: UNIFIED INSTITUTIONAL LOGIN (EMAIL + PASSWORD + GOOGLE) */}
          {loginTab === 'email' && (
            <div className="animate-in fade-in duration-200">
              {isResetting ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center mb-3">
                    <h4 className="text-base font-black text-primary">استعادة كلمة المرور</h4>
                    <p className="text-on-surface/60 text-xs mt-1">أدخل بريدك الإلكتروني المؤسساتي وسنرسل لك رابطاً لإعادة التعيين فوراً.</p>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <label className="block text-[10px] font-black text-on-surface/50 uppercase tracking-wider mr-1" htmlFor="reset-email">البريد الإلكتروني</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-on-surface/30 group-focus-within:text-primary transition-colors">
                        <Mail size={18} />
                      </div>
                      <input 
                        className="w-full bg-surface border border-outline/20 focus:border-primary focus:bg-surface rounded-xl py-3 pr-11 pl-4 text-on-surface font-bold placeholder-on-surface/20 shadow-xs focus:shadow-md transition-all outline-none text-sm"
                        id="reset-email" 
                        type="email" 
                        placeholder="name@education.dz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-2">
                    <button 
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary-container text-on-primary font-black py-3 rounded-xl shadow-md transform active:scale-95 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50" 
                      type="submit"
                    >
                      <span>{loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setIsResetting(false); setError(''); setSuccessInfo(null); }}
                      className="text-xs font-bold text-on-surface/60 hover:text-primary transition-colors text-center py-1"
                    >
                      العودة لتسجيل الدخول
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAuth} className="space-y-3.5">
                  <div className="space-y-1 text-right">
                    <label className="block text-[10px] font-black text-on-surface/50 uppercase tracking-wider mr-1" htmlFor="email">
                      البريد الإلكتروني المؤسساتي
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-on-surface/30 group-focus-within:text-primary transition-colors">
                        <User size={18} />
                      </div>
                      <input 
                        className="w-full bg-surface border border-outline/20 focus:border-primary focus:bg-surface rounded-xl py-3 pr-11 pl-4 text-on-surface font-bold placeholder-on-surface/20 shadow-xs focus:shadow-md transition-all outline-none text-sm"
                        id="email" 
                        type="email" 
                        placeholder="name@education.dz أو بريدك الشخصي"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <div className="flex justify-between items-center mr-1">
                      <label className="block text-[10px] font-black text-on-surface/50 uppercase tracking-wider" htmlFor="password">
                        كلمة المرور
                      </label>
                      {isLogin && (
                        <button 
                          type="button"
                          onClick={() => { setIsResetting(true); setError(''); setSuccessInfo(null); }}
                          className="text-[10px] text-primary font-bold hover:underline"
                        >
                          نسيت كلمة المرور؟
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-on-surface/30 group-focus-within:text-primary transition-colors">
                        <LockIcon size={18} />
                      </div>
                      <input 
                        className="w-full bg-surface border border-outline/20 focus:border-primary focus:bg-surface rounded-xl py-3 pr-11 pl-11 text-on-surface font-bold placeholder-on-surface/20 shadow-xs focus:shadow-md transition-all outline-none text-sm"
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 left-0 flex items-center pl-3.5 cursor-pointer text-on-surface/30 hover:text-primary transition-colors"
                        title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-1 text-right animate-in fade-in">
                      <label className="block text-[10px] font-black text-on-surface/50 uppercase tracking-wider mr-1" htmlFor="confirmPassword">
                        تأكيد كلمة المرور
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-on-surface/30 group-focus-within:text-primary transition-colors">
                          <ShieldCheck size={18} />
                        </div>
                        <input 
                          className="w-full bg-surface border border-outline/20 focus:border-primary focus:bg-surface rounded-xl py-3 pr-11 pl-11 text-on-surface font-bold placeholder-on-surface/20 shadow-xs focus:shadow-md transition-all outline-none text-sm"
                          id="confirmPassword" 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 left-0 flex items-center pl-3.5 cursor-pointer text-on-surface/30 hover:text-primary transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {linkingMessage && (
                    <div className="bg-primary/10 text-primary text-[10px] font-black p-2.5 rounded-xl text-center border border-primary/20 flex items-center gap-2 justify-center">
                      <Globe size={14} />
                      <span>{linkingMessage}</span>
                    </div>
                  )}

                  <button 
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-container text-on-primary font-black py-3.5 rounded-xl shadow-md transform active:scale-95 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:active:scale-100 mt-2" 
                    type="submit"
                  >
                    <span>{loading ? 'جاري التحقق والتوجيه...' : (isLogin ? 'تسجيل الدخول والتوجيه الآلي' : 'إنشاء الحساب')}</span>
                    <ArrowLeft size={16} />
                  </button>

                  <div className="text-center pt-1 flex flex-col gap-1 items-center">
                    <button 
                      type="button"
                      onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessInfo(null); }}
                      className="text-xs font-bold text-on-surface/70 hover:text-primary transition-colors"
                    >
                      {isLogin ? 'ليس لديك حساب؟ إنشاء حساب سريع' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center py-1">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline/10"></div></div>
                    <span className="relative px-3 bg-surface-container-low text-[9px] font-black text-on-surface/40 uppercase tracking-widest">أو عبر الحساب المعتمد</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button 
                      type="button"
                      onClick={() => handleGoogleLogin(false)}
                      disabled={loading}
                      className="w-full bg-surface border border-outline/15 hover:border-primary/40 text-on-surface font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-sm active:scale-95 text-xs disabled:opacity-50"
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 ml-0.5" alt="Google" />
                      <span>Google</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleFacebookLogin(false)}
                      disabled={loading}
                      className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-sm active:scale-95 text-xs disabled:opacity-50"
                    >
                      <Facebook size={16} className="ml-0.5" />
                      <span>Facebook</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: TEACHER CODE LOGIN (STRICT FUNCTIONAL CODE VERIFICATION) */}
          {loginTab === 'teacher' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 p-3.5 rounded-2xl text-right">
                <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-black text-xs mb-1">
                  <GraduationCap size={18} />
                  <span>دخول الأساتذة برقم التعريف الوظيفي المعتمد</span>
                </div>
                <p className="text-[11px] text-sky-900/80 dark:text-sky-200/80 leading-relaxed">
                  أدخل رقم تعريفك الوظيفي (المسجل لدى إدارة المؤسسة) لحجز الحصص المخبرية والتجارب وتجهيز العتاد مباشرة في بوابتك.
                </p>
              </div>

              <form onSubmit={(e) => handleTeacherCodeLogin(e)} className="space-y-3">
                <div className="space-y-1 text-right">
                  <label className="block text-[10px] font-black text-on-surface/50 uppercase tracking-wider mr-1" htmlFor="functional-code">
                    رقم التعريف الوظيفي للأستاذ (Code Fonctionnel)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-on-surface/30 group-focus-within:text-sky-600 transition-colors">
                      <KeyRound size={18} />
                    </div>
                    <input 
                      className="w-full bg-surface border border-outline/20 focus:border-sky-500 focus:bg-surface rounded-xl py-3 pr-11 pl-4 text-on-surface font-bold placeholder-on-surface/20 shadow-xs focus:shadow-md transition-all outline-none text-sm dir-rtl"
                      id="functional-code" 
                      type="text" 
                      placeholder="مثال: 2024-PHYS-01"
                      value={functionalCode}
                      onChange={(e) => setFunctionalCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black py-3.5 rounded-xl shadow-md transform active:scale-95 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50" 
                  type="submit"
                >
                  <GraduationCap size={18} />
                  <span>{loading ? 'جاري التحقق من الرمز...' : 'دخول إلى فضاء الأستاذ'}</span>
                  <ArrowLeft size={16} />
                </button>
              </form>

              {/* Quick Select & Verification from Registered Teachers List */}
              <div className="space-y-2 pt-1 text-right">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-on-surface/70">قائمة الأساتذة المسجلين بالمؤسسة:</span>
                  <span className="text-[10px] text-sky-600 font-bold font-mono">({filteredTeachers.length} أستاذ)</span>
                </div>

                {teachersList.length > 3 && (
                  <div className="relative">
                    <Search size={14} className="absolute right-3 top-2.5 text-on-surface/30" />
                    <input 
                      type="text"
                      placeholder="بحث باسم الأستاذ أو المادة..."
                      value={teacherSearchQuery}
                      onChange={(e) => setTeacherSearchQuery(e.target.value)}
                      className="w-full bg-surface border border-outline/10 rounded-xl py-1.5 pr-8 pl-3 text-xs outline-none focus:border-sky-500"
                    />
                  </div>
                )}

                <div className="max-h-48 overflow-y-auto space-y-1.5 p-0.5 no-scrollbar">
                  {teachersLoading ? (
                    <p className="text-center text-xs text-on-surface/50 py-3">جاري جلب قائمة الأساتذة...</p>
                  ) : filteredTeachers.length === 0 ? (
                    <p className="text-center text-xs text-on-surface/50 py-3">لا يوجد أستاذ يطابق البحث</p>
                  ) : (
                    filteredTeachers.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setFunctionalCode(t.functionalCode || t.id);
                          handleTeacherCodeLogin(undefined, t.functionalCode || t.id);
                        }}
                        className="w-full text-start p-2.5 bg-surface hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl border border-outline/10 hover:border-sky-300 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 flex items-center justify-center font-black text-xs shrink-0">
                            {t.name.slice(0, 1) || 'أ'}
                          </div>
                          <div>
                            <p className="text-xs font-bold group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors leading-tight">{t.name}</p>
                            <p className="text-[10px] text-on-surface/60">{t.subject} • الرمز: <span className="font-mono text-sky-600 font-bold">{t.functionalCode}</span></p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="rotate-180 text-on-surface/30 group-hover:text-sky-600 group-hover:-translate-x-1 transition-all" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Footer Links */}
          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] font-bold text-on-surface/50 border-t border-outline/10 pt-4 w-full">
            <Link className="hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4" to="/privacy-policy">سياسة الخصوصية</Link>
            <Link className="hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4" to="/terms-of-service">شروط الخدمة</Link>
            <Link className="hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4" to="/data-deletion">حذف البيانات</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
