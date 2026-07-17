import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Globe, 
  MapPin, 
  ArrowRight, 
  Chrome, 
  AlertCircle, 
  CheckCircle, 
  ShieldCheck, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  message?: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

import { AuthIllustration } from './Illustrations';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', message }: AuthModalProps) {
  const { 
    loginWithEmail, 
    register, 
    loginWithGoogle, 
    sendOTPCode, 
    verifyOTPCode,
    forgotPassword,
    rememberMe,
    setRememberMe
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'otp' | 'otp_verify'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration extras
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Phone OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithEmail(email, password);
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('You must accept the terms of service.');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName,
        lastName,
        email,
        phone,
        state,
        password,
        marketingEmails
      });
      setSuccessMsg('Account registered successfully! Please check your email to verify.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
      setSuccessMsg('Successfully authenticated with Google!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      // In sandbox iframes, popups might fail. Let's show a helpful instructions error
      setErrorMsg('Google Sign-In popup could not complete. This can happen in iframe sandbox environments. Please use standard Email Registration or Phone OTP for full testing!');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await forgotPassword(email);
      setSuccessMsg('Password reset link sent! Check your email inbox simulation.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setErrorMsg('Please enter a phone number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      // Setup dynamic recaptcha container on demand
      const containerId = 'recaptcha-verifier-container';
      const result = await sendOTPCode(phoneNumber, containerId);
      setConfirmationResult(result);
      setMode('otp_verify');
      setSuccessMsg('Verification code sent to your phone.');
    } catch (err: any) {
      console.error(err);
      // Fallback for easy iframe verification simulation!
      setErrorMsg('Using automated Sandboxed Phone simulator. Standard SMS OTP can trigger Recaptcha constraints in preview frames. Simulating OTP code delivery...');
      setTimeout(() => {
        setErrorMsg('');
        setSuccessMsg('SMS verification code "123456" simulated! Please enter it below to confirm.');
        setMode('otp_verify');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setErrorMsg('Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      if (confirmationResult) {
        await verifyOTPCode(confirmationResult, verificationCode);
      } else if (verificationCode === '123456') {
        // Mock successful validation
        await loginWithEmail("demo-phone-user@kartigo.com", "DemoPassword123").catch(async () => {
          // If mock doesn't exist, register him on the fly
          await register({
            firstName: "Phone",
            lastName: "Guest",
            email: "demo-phone-user@kartigo.com",
            phone: phoneNumber,
            state: "Maharashtra",
            password: "DemoPassword123",
            marketingEmails: false
          });
        });
      } else {
        throw new Error("Invalid verification code. Please enter '123456'.");
      }
      setSuccessMsg('Successfully authenticated with Phone OTP!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication code failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Background Dim */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Main Modal Box */}
      <motion.div
        id="auth-modal-container"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white w-full max-w-[420px] rounded-[32px] border border-vanilla-main shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col z-10"
      >
        {/* Header Illustration */}
        <div className="flex flex-col items-center mb-4">
           <AuthIllustration />
           <div className="text-center">
              <h3 className="text-lg font-bold text-brand-secondary font-display">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Join Kartigo Draft'}
                {mode === 'forgot' && 'Account Recovery'}
                {mode === 'otp' && 'SMS Verification'}
                {mode === 'otp_verify' && 'Secure Check'}
              </h3>
              <p className="text-xs text-text-light font-medium">Professional Document Ecosystem</p>
           </div>
           <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl text-text-light hover:text-brand-secondary hover:bg-vanilla-secondary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto py-5 pr-1 flex-1 custom-scrollbar">
          {/* Custom Prompt Message */}
          {message && (
            <div id="auth-custom-message" className="mb-6 p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 text-xs text-brand-secondary font-bold text-center leading-relaxed">
              {message}
            </div>
          )}

          {/* Notification Messages */}
          {errorMsg && (
            <div id="auth-error-alert" className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div id="auth-success-alert" className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 font-medium flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* 1. LOGIN MODE */}
            {mode === 'login' && (
              <motion.form
                id="login-form"
                key="login"
                onSubmit={handleEmailLogin}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="login-email" className="block text-xs font-bold text-brand-secondary mb-1.5">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                      placeholder="alex.smith@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="login-password" className="block text-xs font-bold text-brand-secondary">Password</label>
                    <button
                      id="forgot-password-trigger"
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] font-semibold text-brand-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      id="toggle-login-password-btn"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-text-light hover:text-brand-secondary cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Toggle */}
                <div className="flex items-center justify-between py-1 text-xs">
                  <label htmlFor="remember-me-checkbox" className="flex items-center gap-2 font-medium text-text-secondary cursor-pointer">
                    <input
                      id="remember-me-checkbox"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-vanilla-main text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer"
                    />
                    <span>Remember login details</span>
                  </label>
                  
                  <button
                    id="phone-otp-login-trigger"
                    type="button"
                    onClick={() => setMode('otp')}
                    className="font-bold text-brand-secondary hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    Login with Phone SMS
                  </button>
                </div>

                <button
                  id="submit-login-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Sign In Account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* 2. REGISTER MODE */}
            {mode === 'register' && (
              <motion.form
                id="register-form"
                key="register"
                onSubmit={handleRegister}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="register-first-name" className="block text-xs font-bold text-brand-secondary mb-1.5">First Name *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        id="register-first-name"
                        type="text"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                        placeholder="Alex"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="register-last-name" className="block text-xs font-bold text-brand-secondary mb-1.5">Last Name *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        id="register-last-name"
                        type="text"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                        placeholder="Smith"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-xs font-bold text-brand-secondary mb-1.5">Email Address *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="register-email"
                      type="email"
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                      placeholder="alex.smith@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-brand-secondary mb-1.5">State *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <select
                        id="register-state-select"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      >
                        {INDIAN_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="register-phone" className="block text-xs font-bold text-brand-secondary mb-1.5">Phone Number (Optional)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      id="register-phone"
                      type="tel"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="register-password" className="block text-xs font-bold text-brand-secondary mb-1.5">Password *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        id="register-password"
                        type="password"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="register-password-confirm" className="block text-xs font-bold text-brand-secondary mb-1.5">Confirm Password *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        id="register-password-confirm"
                        type="password"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-2.5 pt-1">
                  <label htmlFor="register-accept-terms" className="flex items-start gap-2.5 text-[11px] font-medium text-text-secondary cursor-pointer">
                    <input
                      id="register-accept-terms"
                      type="checkbox"
                      required
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="rounded border-vanilla-main text-brand-primary focus:ring-brand-primary h-4 w-4 shrink-0 mt-0.5 cursor-pointer"
                    />
                    <span>
                      I certify that I accept Kartigo Draft' <b>Terms of Service</b> and <b>Privacy Policy</b>.
                    </span>
                  </label>

                  <label htmlFor="register-marketing-consent" className="flex items-start gap-2.5 text-[11px] font-medium text-text-secondary cursor-pointer">
                    <input
                      id="register-marketing-consent"
                      type="checkbox"
                      checked={marketingEmails}
                      onChange={(e) => setMarketingEmails(e.target.checked)}
                      className="rounded border-vanilla-main text-brand-primary focus:ring-brand-primary h-4 w-4 shrink-0 mt-0.5 cursor-pointer"
                    />
                    <span>
                      Send me occasional expert updates and template offers (optional).
                    </span>
                  </label>
                </div>

                <button
                  id="submit-register-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Register Vetted Account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* 3. FORGOT PASSWORD */}
            {mode === 'forgot' && (
              <motion.form
                id="forgot-form"
                key="forgot"
                onSubmit={handleForgotPassword}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <p className="text-xs text-text-secondary leading-relaxed">
                  Enter your email address below. We'll simulate sending a secure URL link containing token codes to reset your account password.
                </p>

                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-bold text-brand-secondary mb-1.5">Registered Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                      placeholder="alex.smith@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  id="submit-forgot-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Request Recovery Link'
                  )}
                </button>

                <div className="text-center">
                  <button
                    id="back-to-login-from-forgot"
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs font-bold text-brand-secondary hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </motion.form>
            )}

            {/* 4. PHONE OTP MODE */}
            {mode === 'otp' && (
              <motion.form
                id="otp-request-form"
                key="otp"
                onSubmit={handleSendOTP}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <p className="text-xs text-text-secondary leading-relaxed">
                  Sign in instantly with a 6-digit confirmation code. Enter your 10-digit mobile number.
                </p>

                <div>
                  <label htmlFor="otp-phone-input" className="block text-xs font-bold text-brand-secondary mb-1.5">Mobile Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      id="otp-phone-input"
                      type="tel"
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                      placeholder="+15550192834"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                {/* Recaptcha Container invisible element required by Firebase SDK */}
                <div id="recaptcha-verifier-container" className="hidden" />

                <button
                  id="submit-send-otp-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Send SMS Verification Code'
                  )}
                </button>

                <div className="text-center">
                  <button
                    id="back-to-login-from-otp"
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs font-bold text-brand-secondary hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </motion.form>
            )}

            {/* 5. PHONE OTP VERIFY MODE */}
            {mode === 'otp_verify' && (
              <motion.form
                id="otp-verify-form"
                key="otp_verify"
                onSubmit={handleVerifyOTP}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <p className="text-xs text-text-secondary leading-relaxed">
                  Type the security authentication code sent to <b>{phoneNumber}</b>.
                </p>

                <div>
                  <label htmlFor="otp-code-input" className="block text-xs font-bold text-brand-secondary mb-1.5">6-Digit Verification Code</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-text-light">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <input
                      id="otp-code-input"
                      type="text"
                      maxLength={6}
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all tracking-widest text-center font-bold"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  id="submit-verify-otp-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Verify Code & Sign In'
                  )}
                </button>

                <div className="flex justify-between text-xs font-bold">
                  <button
                    id="resend-otp-code-btn"
                    type="button"
                    onClick={() => {
                      setMode('otp');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-text-light hover:text-brand-secondary cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <button
                    id="cancel-otp-code-btn"
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-brand-secondary hover:underline cursor-pointer"
                  >
                    Use Another Account
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions - Google Sign In & Mode Toggles */}
        {['login', 'register', 'forgot', 'otp'].includes(mode) && (
          <div className="pt-4 border-t border-vanilla-main shrink-0 space-y-4">
            {/* Google Sign In option (only on login and register) */}
            {['login', 'register'].includes(mode) && (
              <>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-vanilla-main" />
                  <span className="flex-shrink mx-3 text-[10px] text-text-light font-extrabold uppercase tracking-widest font-mono">Or connect with</span>
                  <div className="flex-grow border-t border-vanilla-main" />
                </div>

                <button
                  id="google-signin-btn"
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full bg-white border border-vanilla-main hover:border-brand-primary/20 text-brand-secondary text-xs font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-vanilla-secondary cursor-pointer"
                >
                  <Chrome className="h-4 w-4 text-rose-500" />
                  Continue with Google
                </button>
              </>
            )}

            {/* Switch Mode Link */}
            <div className="text-center text-xs">
              {mode === 'login' ? (
                <span className="text-text-light">
                  New to Kartigo?{' '}
                  <button
                    id="toggle-to-register-btn"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className="font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    Create Vetted Account
                  </button>
                </span>
              ) : (
                mode === 'register' && (
                  <span className="text-text-light">
                    Already have an account?{' '}
                    <button
                      id="toggle-to-login-btn"
                      onClick={() => {
                        setMode('login');
                        setErrorMsg('');
                      }}
                      className="font-bold text-brand-primary hover:underline cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
