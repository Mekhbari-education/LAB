import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  FacebookAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, checkIsAdmin } from '../firebase';
import { Beaker, Lock as LockIcon, User, Eye, EyeOff, ArrowLeft, ShieldCheck, Globe, UserPlus, Facebook, Sun, Moon, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';
import logo from '/ministry-logo.png';
import { cn } from '../lib/utils';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<React.ReactNode>('');
  const [loading, setLoading] = useState(false);

  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [pendingCred, setPendingCred] = useState<any>(null);
  const [linkingMessage, setLinkingMessage] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Dynamic loading of reCAPTCHA Enterprise
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
          await handlePostLoginUserSync(result.user);
        }
      } catch (err: any) {
        console.error('Redirect result error:', err);
        handleAuthError(err, 'google');
      }
    };
    checkRedirect();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني أولاً.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setError('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.');
      setIsResetting(false);
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('هذا البريد الإلكتروني غير مسجل لدينا.');
      } else {
        setError('حدث خطأ أثناء محاولة إرسال رابط إعادة التعيين.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!isLogin && password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة.');
      setLoading(false);
      return;
    }

    try {

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: (await checkIsAdmin(user)) ? 'Admin' : 'user',
          displayName: user.email?.split('@')[0] || 'مستخدم جديد',
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(
          <div className="text-right p-4 bg-error/5 rounded-2xl border border-error/20">
            <p className="font-black text-error mb-2">النطاق غير مصرح به</p>
            <p className="text-[10px] mb-3">يجب إضافة هذا النطاق في إعدادات Firebase Console لتفعيل تسجيل الدخول.</p>
            <div className="bg-surface p-2 rounded-lg text-[9px] font-mono mb-4 text-center">{window.location.hostname}</div>
            <a href={`https://console.firebase.google.com/project/${auth.app.options.projectId}/authentication/settings`} target="_blank" rel="noopener noreferrer" className="block w-full bg-primary text-on-primary py-2 rounded-xl text-center text-xs font-black">إعدادات النطاقات</a>
          </div>
        );
      } else if (isLogin) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من صحة البيانات أو تفعيل خيار تسجيل الدخول بالبريد الإلكتروني في Firebase.');
        } else if (err.code === 'auth/operation-not-allowed') {
          setError('تسجيل الدخول بالبريد الإلكتروني غير مفعل في إعدادات Firebase.');
        } else {
          setError('خطأ في تسجيل الدخول. يرجى التحقق من البيانات أو التأكد من تفعيل خدمات Firebase.');
        }
      } else {
        if (err.code === 'auth/email-already-in-use') {
          setError('هذا البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.');
        } else if (err.code === 'auth/weak-password') {
          setError('كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 أحرف على الأقل.');
        } else if (err.code === 'auth/operation-not-allowed') {
          setError('إنشاء الحساب بالبريد الإلكتروني غير مفعل في إعدادات Firebase.');
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
          role: isAdmin ? 'Admin' : 'user',
          displayName: user.displayName || user.email?.split('@')[0] || 'مستخدم جديد',
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString()
        });
      } else {
        await setDoc(userRef, {
          photoURL: user.photoURL || null,
          displayName: user.displayName || userDoc.data()?.displayName
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
            لتسجيل الدخول بحساب جوجل من هذا الهاتف أو الجهاز، يجب إضافة اسم النطاق التالي إلى قائمة <b>Authorized Domains</b> في مشروع Firebase:
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
            <div className="text-[10px] text-on-surface/70 bg-surface/60 p-2.5 rounded-xl space-y-1">
              <p className="font-bold text-primary">طريقة الإضافة في دقيقة واحدة:</p>
              <p>1. افتح الرابط أعلاه في المتصفح</p>
              <p>2. اضغط على قسم <b>Authorized domains</b></p>
              <p>3. اضغط على <b>Add domain</b> وألصق النطاق المنسوخ أعلاه</p>
            </div>
            <div className="pt-1 border-t border-outline/10">
              <p className="text-[10px] text-on-surface/60 text-center mb-1.5">أو يمكنك استخدام الرابط المصرح به مسبقاً مباشرة:</p>
              <a
                href={`https://${projectId}.firebaseapp.com`}
                className="block text-center text-xs font-bold text-primary underline"
              >
                https://{projectId}.firebaseapp.com
              </a>
            </div>
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
    } else if (err.code === 'auth/missing-initial-state' || err.code === 'auth/internal-error') {
      setError(
        <div className="text-right p-4 bg-error/10 rounded-2xl border border-error/30 space-y-3">
          <p className="font-black text-error text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>قيود ملفات تعريف الارتباط في المتصفح</span>
          </p>
          <p className="text-[11px] text-on-surface/80 leading-relaxed">
            يمنع متصفح الهاتف حفظ حالة الجلسة عند إعادة التوجيه. يرجى الضغط على الزر أدناه لتسجيل الدخول عبر نافذة منبثقة أو استخدام متصفح Chrome/Safari الأساسي.
          </p>
          <button
            type="button"
            onClick={() => handleGoogleLogin(false)}
            className="w-full bg-primary text-on-primary py-2.5 rounded-xl text-xs font-black transition-colors"
          >
            إعادة المحاولة عبر نافذة منبثقة
          </button>
        </div>
      );
    } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      setError('تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية. يرجى الضغط مجدداً واختيار حسابك.');
    } else if (err.code === 'auth/account-exists-with-different-credential') {
      const email = err.customData?.email;
      const credential = providerType === 'google' 
        ? GoogleAuthProvider.credentialFromError(err) 
        : FacebookAuthProvider.credentialFromError(err);
        
      if (email && credential) {
        setPendingCred(credential);
        fetchSignInMethodsForEmail(auth, email).then(methods => {
          const method = methods[0];
          let providerTitle = 'طريقة أخرى';
          if (method === 'facebook.com') providerTitle = 'فيسبوك';
          if (method === 'google.com') providerTitle = 'جوجل';
          if (method === 'password') providerTitle = 'البريد الإلكتروني';
          setLinkingMessage(`لديك حساب مسجل مسبقاً عبر ${providerTitle}. يرجى تسجيل الدخول عبر ${providerTitle} لربط الحساب.`);
          setError(null);
        }).catch(() => {
          setError('هذا البريد مرتبط بحساب مسجل مسبقاً بطريقة أخرى.');
        });
      } else {
        setError('هذا البريد الإلكتروني مسجل بطريقة أخرى بالفعل.');
      }
    } else {
      setError(err?.message || `فشل تسجيل الدخول عبر ${providerType === 'google' ? 'جوجل' : 'فيسبوك'}. يرجى المحاولة مرة أخرى.`);
    }
  };

  const handleGoogleLogin = async (forceRedirect = false) => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      let user: any = null;

      if (forceRedirect) {
        await signInWithRedirect(auth, provider);
        return;
      }

      try {
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      } catch (popupErr: any) {
        if (popupErr.code === 'auth/popup-blocked') {
          console.warn('Popup blocked by browser, falling back to redirect...');
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }

      if (user) {
        await handlePostLoginUserSync(user);
      }
    } catch (err: any) {
      handleAuthError(err, 'google');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async (forceRedirect = false) => {
    setError('');
    setLoading(true);
    const provider = new FacebookAuthProvider();

    try {
      let user: any = null;

      if (forceRedirect) {
        await signInWithRedirect(auth, provider);
        return;
      }

      try {
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      } catch (popupErr: any) {
        if (popupErr.code === 'auth/popup-blocked') {
          console.warn('Popup blocked, falling back to redirect...');
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }

      if (user) {
        await handlePostLoginUserSync(user);
      }
    } catch (err: any) {
      handleAuthError(err, 'facebook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-low text-on-surface min-h-screen flex overflow-hidden rtl font-sans" dir="rtl">
      {/* Left Panel: Photo Mosaic (70%) */}
      <section className="hidden md:flex md:w-[70%] relative bg-primary-dim p-8 flex-col justify-between overflow-hidden">
        {/* Background Mosaic Overlay */}
        <div className="absolute inset-0 opacity-40 z-0 p-4">
          <div className="mosaic-container">
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant col-span-3">
              <img className="w-full h-full object-cover" data-alt="Wide shot of a sterile chemistry lab" src="https://lh3.googleusercontent.com/pw/AP1GczM0GuSeqOIu4HjXaxiFY1gk_DLyU6Aa7YA52_xQmRMYonbemhhUSB91x3mCAG9zvL8BimBdC2ydwiQ-weQzy3axW97QF96HYbWmlmepbSe4z7PNXw43k543nd3jVBJIwEmUNuLSipOGjJi1SHW4Qqk=w1000-h667-s-no-gm?authuser=0" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant col-span-2 row-span-1">
              <img className="w-full h-full object-cover" data-alt="Science laboratory with microscopes and glass tubes" src="https://lh3.googleusercontent.com/pw/AP1GczM9oE1KF28-A07sotiA8OeP-9g7Yqyh6RD2O8wliqyhfuIU7BLIhOxX28SNvRv2sssSz54P7bO_eXeqnbCiZxATEBsw6R4F6zzIM45gAH1gL-lZTij1ProIIgmAIvRyWVG0-d1BjaB0MfLsUW-TTrc=w1000-h667-s-no-gm?authuser=0" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant">
              <img className="w-full h-full object-cover" data-alt="Close up of chemical reaction in test tube" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3v04XZdR-wrr-yl9jm1TwqSzZh1tB2Q_b2seHi78Pot77MsMKUR_IfLse_SOAchzoJnl9_QyxHYtsxc5wu26u4ADOAzYFgqR8gRymImjjvvT-bDPHvCmLBkeobQG0AcqNGd6vHpntlBztJ221uKcrlHe0ThJ4WLglF7F8BkpxNeqIax36ScCmlka5P905m6gshhHSbmcp0nBeSVUvuNGqULHF4tyOFKqEbn_cMXOMT09UhVajKnS6za7T-T9mTkBJ2In2H4Gg4-4" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant">
              <img className="w-full h-full object-cover" data-alt="Modern high school laboratory environment" src="https://lh3.googleusercontent.com/pw/AP1GczPdQagS-b6DS31MBTO5A9U4U2LFfXQftpPnDU7RlZUnxdrC5diIftYLgPS55MXCU1P1v9SnBrdUt2ZYr5vUwjl6x-rSzkFvf9tvtH0dhZ2VLAEs3yJNfEFSzJ7hvv-Iq8qVB3GOXYb6c679HsRe2Hc=w1000-h667-s-no-gm?authuser=0" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant">
              <img className="w-full h-full object-cover" data-alt="Scientist working with laboratory equipment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPFGMsi61n29fUlKz-g9O3v3RDqIUPJA-Hd-3Eu1vZT6fsKe2dpWiZ7MV1j0aH8pGMUtKYujyGg7yo14gbULLD8FmKF7ag0U5RHVEmXsc0-SeQNOp9JnqjZbQQBPm2DpU7SYOV219H8rSwcmew0izuW-mE8sbqaY5a5URddDsyPQSPBpaQ6Jo9iOTwSDEdGfgCNZQHKxaiBQCz14goom5XhB_lg9h57mvcwYPBjAvGFjRkoFxUUx7K_wexj5aaQKzt7e0fzITXWS8" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-surface-variant">
              <img className="w-full h-full object-cover" data-alt="Algerian school science lab workspace" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuu21W2NVmM2_12ChkPiiiSFralvib0a8U_lpsxVaAOqbHci_xBeb_JzUYm5XLunM43cDfllelPvxX21ruhld2KlTUw8FSodp75yDnZJzIIlbv6blmsbjAaJu19MR8mfi4mkJ-073-m-tswkhO1H2z5du4QRJq_lTCwpirBx8j-3zaZds9KBDsILc4gumE1CcSVNFpmJ0c6dju6Es6rRVo4hqT49j8sgYAEeY1qdkH9a0CkPRigO2YkJrX33Zkvautpubi87g-m7Y" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
        {/* Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#415437]/90 via-[#415437]/70 to-transparent z-10"></div>
        {/* Branding Content */}
        <div className="relative z-20 h-full flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-surface/10 backdrop-blur-md rounded-2xl flex items-center justify-center p-2 shadow-lg">
              <img 
                src={logo}
                alt="Ministry Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-white text-3xl font-black tracking-tight leading-none">الأرضية الرقمية</h1>
              <p className="text-secondary-fixed opacity-90 text-sm mt-1">فضاء موظفوا المخابر</p>
            </div>
          </div>
          <div className="mt-auto">
            <h2 className="text-white text-6xl font-black mb-4 leading-tight">التميز العلمي في <br />قلب المنظومة التربوية</h2>
            <p className="text-surface-container-low text-xl max-w-lg leading-relaxed opacity-80">
              نظام رقمي متطور مصمم خصيصاً لتلبية احتياجات المخابر العلمية في المؤسسات التربوية الجزائرية، لضمان جرد دقيق ومتابعة بيداغوجية فعالة.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-on-primary/40 text-xs font-black uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <Globe size={14} aria-hidden="true" /> وزارة التربية الوطنية
            </span>
            <Link className="hover:text-on-primary transition-colors" to="/privacy-policy">سياسة الخصوصية</Link>
            <Link className="hover:text-on-primary transition-colors" to="/terms-of-service">شروط الخدمة</Link>
            <Link className="hover:text-on-primary transition-colors" to="/data-deletion">حذف البيانات</Link>
          </div>
        </div>
      </section>

      {/* Right Panel: Auth Form (30%) */}
      <main className="w-full lg:w-[30%] bg-surface-container-low relative flex flex-col items-center justify-center p-4 md:p-8 lg:p-10 overflow-y-auto">
        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-4 left-4 p-3 bg-surface border border-outline/10 hover:bg-secondary-container/50 rounded-full text-primary transition-all z-20 shadow-sm"
          title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-4 md:mb-6">
            {isInAppBrowser && (
              <div className="mb-3 p-2 bg-primary/10 rounded-2xl border border-primary/20 text-right">
                <p className="text-[9px] font-black text-primary mb-1 flex items-center gap-2">
                  <Globe size={10} /> تنبيه لمستخدمي فيسبوك/إنستغرام
                </p>
                <p className="text-[8px] text-on-surface/70 leading-relaxed mb-1.5">
                  لتجنب مشاكل تسجيل الدخول، يفضل فتح الموقع في متصفح خارجي أو استخدام الرابط المباشر.
                </p>
                <button 
                  onClick={() => window.location.href = "https://education-dz-lab.firebaseapp.com"}
                  className="w-full bg-primary text-on-primary py-1 rounded-lg text-[8px] font-black"
                >
                  فتح الرابط المباشر المستقر
                </button>
              </div>
            )}
            <img 
              src={logo}
              alt="Logo" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto mb-6"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-lg md:text-xl font-black text-primary mb-0.5 font-serif tracking-tight">الأرضية الرقمية — فضاء موظفوا المخابر</h3>
            <p className="text-on-surface/60 font-bold text-xs md:text-sm">نظام تسيير المخابر العلمية — فضاء الموظفين</p>
            {!isLogin && (
              <div className="mt-3 inline-flex items-center px-4 py-1.5 bg-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
                <UserPlus size={12} className="ml-1.5" />
                إنشاء حساب جديد
              </div>
            )}
          </div>

          {isResetting ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-xl font-black text-primary">إعادة تعيين كلمة المرور</h4>
                <p className="text-on-surface/60 text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين.</p>
                <p className="text-[10px] text-error font-bold mt-2 italic">ملاحظة: إذا لم تجد الرسالة، يرجى التحقق من مجلد الرسائل غير المرغوب فيها (Spam).</p>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-on-surface/40 uppercase tracking-widest mr-2" htmlFor="reset-email">البريد الإلكتروني</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-surface/30 group-focus-within:text-primary transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    className="w-full bg-surface border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-[20px] py-3.5 pr-12 pl-5 text-on-surface font-bold placeholder-on-surface/20 shadow-sm focus:shadow-xl transition-all outline-none text-sm"
                    id="reset-email" 
                    type="email" 
                    placeholder="name@institution.dz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {linkingMessage && (
                <div className="bg-primary/10 text-primary text-[10px] font-black p-3 rounded-2xl text-center border border-primary/20 mb-4 flex items-center gap-2 justify-center">
                  <Globe size={14} />
                  {linkingMessage}
                </div>
              )}

              {error && (
                <div className={cn(
                  "text-xs font-black p-4 rounded-2xl text-center border animate-shake",
                  typeof error === 'string' && error.includes('تم إرسال') ? "bg-primary/10 text-primary border-primary/20" : "bg-error/10 text-error border-error/20"
                )}>
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-container text-on-primary font-black py-4 rounded-full shadow-2xl shadow-primary/20 transform active:scale-95 transition-all flex items-center justify-center gap-3 group text-base disabled:opacity-50" 
                  type="submit"
                >
                  <span>{loading ? 'جاري الإرسال...' : 'إرسال رابط التعيين'}</span>
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsResetting(false); setError(''); }}
                  className="text-sm font-bold text-on-surface/60 hover:text-primary transition-colors"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-on-surface/40 uppercase tracking-widest mr-2" htmlFor="email">البريد الإلكتروني</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-surface/30 group-focus-within:text-primary transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    className="w-full bg-surface border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-[20px] py-3.5 pr-12 pl-5 text-on-surface font-bold placeholder-on-surface/20 shadow-sm focus:shadow-xl transition-all outline-none text-sm"
                    id="email" 
                    type="email" 
                    placeholder="name@institution.dz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mr-2">
                  <label className="block text-[10px] font-black text-on-surface/40 uppercase tracking-widest" htmlFor="password">كلمة المرور</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => setIsResetting(true)}
                      className="text-[10px] text-primary font-black hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-surface/30 group-focus-within:text-primary transition-colors">
                    <LockIcon size={20} />
                  </div>
                  <input 
                    className="w-full bg-surface border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-[20px] py-3.5 pr-12 pl-12 text-on-surface font-bold placeholder-on-surface/20 shadow-sm focus:shadow-xl transition-all outline-none text-sm"
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
                    className="absolute inset-y-0 left-0 flex items-center pl-4 cursor-pointer text-on-surface/30 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-on-surface/40 uppercase tracking-widest mr-2" htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-surface/30 group-focus-within:text-primary transition-colors">
                      <ShieldCheck size={20} />
                    </div>
                    <input 
                      className="w-full bg-surface border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-[20px] py-3.5 pr-12 pl-12 text-on-surface font-bold placeholder-on-surface/20 shadow-sm focus:shadow-xl transition-all outline-none text-sm"
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
                      className="absolute inset-y-0 left-0 flex items-center pl-4 cursor-pointer text-on-surface/30 hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              {linkingMessage && (
                <div className="bg-primary/10 text-primary text-[10px] font-black p-3 rounded-2xl text-center border border-primary/20 mb-4 flex items-center gap-2 justify-center">
                  <Globe size={14} />
                  {linkingMessage}
                </div>
              )}

              {error && (
                <div className="bg-error/10 text-error text-[10px] font-black p-3 rounded-2xl text-center border border-error/20 animate-shake">
                  {error}
                </div>
              )}

              <button 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-black py-4 rounded-full shadow-2xl shadow-primary/20 transform active:scale-95 transition-all flex items-center justify-center gap-3 group text-base disabled:opacity-50 disabled:active:scale-100" 
                type="submit"
              >
                <span>{loading ? 'جاري التحميل...' : (isLogin ? 'دخول إلى النظام' : 'إنشاء الحساب')}</span>
                <ArrowLeft className="group-hover:-translate-x-2 transition-transform" size={20} />
              </button>
            </form>
          )}

          <div className="text-center mt-2">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-on-surface/60 hover:text-primary transition-colors"
            >
              {isLogin ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
            </button>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline/10"></div></div>
            <span className="relative px-4 bg-surface-container-low text-[9px] font-black text-on-surface/30 uppercase tracking-[0.3em]">أو</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => handleGoogleLogin(false)}
              disabled={loading}
              className="w-full bg-surface border-2 border-outline/10 hover:border-primary/30 text-on-surface font-black py-3 rounded-full transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 ml-1" alt="Google" />
              <span>Google</span>
            </button>

            <button 
              type="button"
              onClick={() => handleFacebookLogin(false)}
              disabled={loading}
              className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-black py-3 rounded-full transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Facebook size={18} className="ml-1" />
              <span>Facebook</span>
            </button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-bold text-on-surface/60 border-t border-outline/10 pt-6 w-full max-w-md mx-auto">
            <Link className="hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4" to="/privacy-policy">سياسة الخصوصية</Link>
            <Link className="hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4" to="/terms-of-service">شروط الخدمة</Link>
            <Link className="hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4" to="/data-deletion">حذف البيانات</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

