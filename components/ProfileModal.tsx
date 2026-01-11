
import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Cloud, LogOut, User as UserIcon, AlertCircle, X, Mail, Lock, Loader2, Zap, Crown, LayoutGrid } from 'lucide-react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExit: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onExit }) => {
  const { isCloudSynced, syncStatus, syncError } = useTasks();
  const { t } = useTheme();
  const { user, subscriptionTier, signInWithGoogle, signInWithEmail, signUpWithEmail, logout, upgradeSubscription, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);
    if (isSignUp) {
        await signUpWithEmail(email, password);
    } else {
        await signInWithEmail(email, password);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div 
            className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-200 dark:ring-slate-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('profile.title')}</h2>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/50 space-y-6">
                
                {/* Status Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Cloud size={24} className={isCloudSynced ? (syncStatus === 'ERROR' ? "text-rose-500" : "text-emerald-500") : "text-slate-400"} />
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{t('profile.cloud_sync')}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{isCloudSynced ? t('profile.synced') : t('profile.local')}</p>
                            </div>
                        </div>
                        {subscriptionTier === 'PRO' && <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">PRO</span>}
                    </div>
                    
                    {/* Explicit Sync Error */}
                    {syncStatus === 'ERROR' && syncError && (
                        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-3 rounded-xl flex items-start gap-2 text-xs">
                            <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-rose-700 dark:text-rose-300 font-mono break-all">{syncError}</p>
                        </div>
                    )}
                </div>

                {/* Auth Error Alert */}
                {error && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl p-4 flex items-start gap-3">
                        <AlertCircle className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">{t('profile.auth_error')}</h3>
                            <p className="text-sm text-rose-700 dark:text-rose-400 mt-1">{error}</p>
                        </div>
                        <button onClick={clearError} className="text-rose-400 hover:text-rose-600">
                            <X size={20} />
                        </button>
                    </div>
                )}

                {user ? (
                    // Logged In View
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex flex-col items-center text-center gap-4 mb-6">
                            <div className="w-24 h-24 rounded-full bg-brand-100 dark:bg-slate-800 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-lg">
                                {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile"/> : <UserIcon size={48} />}
                            </div>
                            <div>
                                <p className="font-bold text-xl text-slate-800 dark:text-white">{user.displayName || "User"}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-brand-50/50 dark:bg-brand-900/10 rounded-xl border border-brand-100 dark:border-brand-900/30 mb-6">
                            <div className="flex items-center gap-3">
                                {subscriptionTier === 'PRO' ? <Crown className="text-amber-500" /> : <Zap className="text-slate-400" />}
                                <div>
                                    <p className="font-bold text-brand-900 dark:text-brand-200">{subscriptionTier === 'PRO' ? t('profile.plan_pro') : t('profile.plan_free')}</p>
                                    <p className="text-xs text-brand-700 dark:text-brand-400">{subscriptionTier === 'PRO' ? t('profile.plan_active') : t('profile.plan_upgrade_hint')}</p>
                                </div>
                            </div>
                            {subscriptionTier === 'FREE' && (
                                <button onClick={upgradeSubscription} className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-brand-700">
                                    {t('profile.upgrade')}
                                </button>
                            )}
                        </div>

                        <button onClick={logout} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                            <LogOut size={18} /> {t('profile.sign_out')}
                        </button>
                    </div>
                ) : (
                    // Auth Forms
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                            {isSignUp ? t('profile.create_account') : t('profile.sign_in')}
                        </h3>
                        
                        <div className="space-y-3 mb-6">
                            <button onClick={signInWithGoogle} className="flex items-center justify-center gap-3 w-full py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-bold transition-all">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                {t('profile.google')}
                            </button>
                        </div>

                        <div className="flex items-center gap-4 text-slate-300 mb-6">
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                            <span className="text-xs font-bold text-slate-400">{t('profile.or_email')}</span>
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                        </div>

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    required
                                    placeholder={t('profile.email_placeholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                                <input 
                                    type="password" 
                                    required
                                    placeholder={t('profile.password_placeholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? t('profile.sign_up') : t('profile.sign_in'))}
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-brand-600 dark:text-brand-400 font-bold hover:underline">
                                {isSignUp ? t('profile.have_account') : t('profile.no_account')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Exit to Home */}
                <div className="flex justify-center pt-2">
                    <button 
                        onClick={onExit}
                        className="text-slate-400 dark:text-slate-500 text-sm font-medium hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <LayoutGrid size={16} /> {t('profile.exit_hub')}
                    </button>
                </div>

            </div>
        </div>
        
        {/* Backdrop Close Trigger */}
        <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};
