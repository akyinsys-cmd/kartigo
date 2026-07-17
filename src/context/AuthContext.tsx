import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  deleteDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserSession, UserNotification, AppRole, UserLocation, BusinessProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  sessions: UserSession[];
  notifications: UserNotification[];
  loading: boolean;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  register: (form: any) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendOTPCode: (phone: string, containerId: string) => Promise<ConfirmationResult>;
  verifyOTPCode: (confirmation: ConfirmationResult, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  sendEmailVerify: () => Promise<void>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  setDefaultLocation: (location: UserLocation) => Promise<void>;
  updateBusinessProfile: (profile: BusinessProfile) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
  addMockNotification: (title: string, content: string, type: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  simulateEmail: {
    type: 'welcome' | 'verify' | 'reset' | 'password_changed' | null;
    to: string;
    body: string;
  } | null;
  clearSimulatedEmail: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Device / Browser parsing utils for Session Tracker
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = "Unknown Browser";
  let device = "Desktop Device";
  
  if (ua.includes("Firefox")) browser = "Mozilla Firefox";
  else if (ua.includes("Chrome")) browser = "Google Chrome";
  else if (ua.includes("Safari")) browser = "Apple Safari";
  else if (ua.includes("Edge")) browser = "Microsoft Edge";

  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) {
    device = ua.includes("iPhone") ? "Apple iPhone" : ua.includes("Android") ? "Android Device" : "Mobile Device";
  }

  return { browser, device };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('kartigo_remember_me') === 'true';
  });

  // Simulated Email preview notification overlay state for Sandbox demo
  const [simulateEmail, setSimulateEmail] = useState<AuthContextType['simulateEmail']>(null);

  const clearSimulatedEmail = () => setSimulateEmail(null);

  // Auto-logout session timeout listener (Simulated timeout if not Remembered)
  useEffect(() => {
    if (!user || rememberMe) return;

    let timeoutId: NodeJS.Timeout;
    const handleActivity = () => {
      clearTimeout(timeoutId);
      // Timeout session after 15 minutes of inactivity when rememberMe is false
      timeoutId = setTimeout(() => {
        handleActivityTimeout();
      }, 15 * 60 * 1000); 
    };

    const handleActivityTimeout = () => {
      addMockNotification(
        "Session Expired",
        "You were logged out automatically due to 15 minutes of inactivity.",
        "warning"
      );
      signOut(auth);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    handleActivity();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [user, rememberMe]);

  // Track localStorage for Remember Me
  useEffect(() => {
    localStorage.setItem('kartigo_remember_me', rememberMe ? 'true' : 'false');
  }, [rememberMe]);

  // Listens to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 1. Load or setup Firestore profile
        const userRef = doc(db, 'users', currentUser.uid);
        const profileRef = doc(db, 'users', currentUser.uid, 'profiles', 'main');
        const profileSnap = await getDoc(profileRef);
        
        let userProfile: UserProfile;

        if (profileSnap.exists()) {
          userProfile = profileSnap.data() as UserProfile;
          setProfile(userProfile);
          
          // Persist default location to localStorage for quick guest detection
          if (userProfile.defaultLocation) {
            localStorage.setItem('kartigo_default_location', JSON.stringify(userProfile.defaultLocation));
          } else if (userProfile.city) {
            // Fallback for flat structure
            const loc = {
              state: userProfile.state,
              district: userProfile.district || '',
              city: userProfile.city || ''
            };
            localStorage.setItem('kartigo_default_location', JSON.stringify(loc));
          }
        } else {
          // First time provider login / fallback
          const nameParts = (currentUser.displayName || "Valued User").split(' ');
          const firstName = nameParts[0] || "Valued";
          const lastName = nameParts.slice(1).join(' ') || "User";
          
          userProfile = {
            uid: currentUser.uid,
            firstName,
            lastName,
            email: currentUser.email || '',
            phone: currentUser.phoneNumber || '',
            state: 'Maharashtra',
            profilePicture: currentUser.photoURL || '',
            language: 'English',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            role: 'User',
            createdAt: new Date(),
            emailVerified: currentUser.emailVerified,
            twoFactorEnabled: false
          };
          
          // Initialize user document and profile
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: 'User',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
          await setDoc(profileRef, userProfile);
          setProfile(userProfile);

          // Add simulated welcome notification
          await addMockNotification(
            "Welcome to Kartigo Draft!",
            "Draft your first legal agreement in seconds. Access premium templates or consult our guide resources.",
            "success"
          );

          // Trigger Welcome Email Simulation
          setSimulateEmail({
            type: 'welcome',
            to: userProfile.email,
            body: `Hi ${userProfile.firstName},\n\nWelcome to Kartigo Draft! We're excited to help you generate expert-grade, legally compliant NDAs, employee offer letters, rental agreements, and more with our step-by-step assistant.\n\nWarm regards,\nThe Kartigo Team`
          });
        }

        // 2. Register current session in Firestore
        const sessionRef = doc(collection(db, 'users', currentUser.uid, 'sessions'));
        const { browser, device } = getBrowserInfo();
        const sessionData = {
          id: sessionRef.id,
          uid: currentUser.uid,
          device,
          browser,
          ip: "107.152.112.44", // Simulated IP
          loginTime: new Date(),
          lastActive: new Date()
        };
        await setDoc(sessionRef, sessionData);

        // Keep session updated periodically
        const updateSessionInterval = setInterval(async () => {
          await updateDoc(sessionRef, { lastActive: new Date() }).catch(() => {});
        }, 5 * 60 * 1000);

        // 3. Register sessions list listener
        const sessionsQuery = query(collection(db, 'users', currentUser.uid, 'sessions'));
        const unsubSessions = onSnapshot(sessionsQuery, (snap) => {
          const fetchedSessions: UserSession[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            fetchedSessions.push({
              id: docSnap.id,
              uid: data.uid,
              device: data.device,
              browser: data.browser,
              ip: data.ip,
              lastActive: data.lastActive?.toDate() || new Date(),
              loginTime: data.loginTime?.toDate() || new Date(),
              isCurrent: docSnap.id === sessionRef.id
            });
          });
          setSessions(fetchedSessions.sort((a, b) => b.loginTime.getTime() - a.loginTime.getTime()));
        });

        // 4. Register notifications listener
        const notificationsQuery = query(collection(db, 'users', currentUser.uid, 'notifications'));
        const unsubNotifications = onSnapshot(notificationsQuery, (snap) => {
          const fetchedNotifications: UserNotification[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            fetchedNotifications.push({
              id: docSnap.id,
              uid: data.uid,
              title: data.title,
              content: data.content,
              type: data.type || 'info',
              read: data.read || false,
              createdAt: data.createdAt?.toDate() || new Date()
            });
          });
          setNotifications(fetchedNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        });

        setLoading(false);

        return () => {
          clearInterval(updateSessionInterval);
          unsubSessions();
          unsubNotifications();
          // Clean up current session on disconnect
          deleteDoc(sessionRef).catch(() => {});
        };
      } else {
        setProfile(null);
        setSessions([]);
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const addMockNotification = async (title: string, content: string, type: 'info' | 'success' | 'warning' | 'error') => {
    if (!auth.currentUser) return;
    const notifyRef = doc(collection(db, 'users', auth.currentUser.uid, 'notifications'));
    await setDoc(notifyRef, {
      id: notifyRef.id,
      uid: auth.currentUser.uid,
      title,
      content,
      type,
      read: false,
      createdAt: new Date()
    });
  };

  const clearNotification = async (id: string) => {
    if (!auth.currentUser) return;
    await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', id));
  };

  const syncGuestData = async (uid: string) => {
    // 1. Sync Guest Conversations
    const guestConvsStr = sessionStorage.getItem('kartigo_guest_conversations') || localStorage.getItem('kartigo_guest_conversations');
    if (guestConvsStr) {
      try {
        const guestConvs = JSON.parse(guestConvsStr);
        for (const conv of guestConvs) {
          const convRef = doc(db, 'users', uid, 'drafts', conv.id);
          await setDoc(convRef, {
            ...conv,
            uid,
            updatedAt: serverTimestamp()
          }, { merge: true });

          const historyStr = sessionStorage.getItem(`kartigo_guest_conv_${conv.id}`) || localStorage.getItem(`kartigo_guest_conv_${conv.id}`);
          if (historyStr) {
            const history = JSON.parse(historyStr);
            await updateDoc(convRef, {
              history: history.messages || [],
              answers: history.answers || {}
            });
            sessionStorage.removeItem(`kartigo_guest_conv_${conv.id}`);
            localStorage.removeItem(`kartigo_guest_conv_${conv.id}`);
          }
        }
        sessionStorage.removeItem('kartigo_guest_conversations');
        localStorage.removeItem('kartigo_guest_conversations');
      } catch (e) {
        console.error("Error syncing guest conversations", e);
      }
    }

    // 2. Sync Guest Documents
    const guestDocsStr = sessionStorage.getItem('kartigo_guest_documents') || localStorage.getItem('kartigo_guest_documents');
    if (guestDocsStr) {
      try {
        const guestDocs = JSON.parse(guestDocsStr);
        for (const gDoc of guestDocs) {
          const docRef = doc(collection(db, 'documents'));
          await setDoc(docRef, {
            ...gDoc,
            id: docRef.id,
            userId: uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isPublic: false
          });
        }
        sessionStorage.removeItem('kartigo_guest_documents');
        localStorage.removeItem('kartigo_guest_documents');
      } catch (e) {
        console.error("Error syncing guest documents", e);
      }
    }

    // 3. Sync Auto-saved wizard answers
    // We can't easily iterate all localStorage keys here without a loop, 
    // but the most important ones are conversations and documents.
  };

  const register = async (form: any) => {
    const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
    
    // Create user document
    const userRef = doc(db, 'users', cred.user.uid);
    await setDoc(userRef, {
      uid: cred.user.uid,
      email: form.email,
      displayName: `${form.firstName} ${form.lastName}`,
      role: 'User',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    // Create profile
    const profileRef = doc(db, 'users', cred.user.uid, 'profiles', 'main');
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || '',
      state: form.state || 'Maharashtra',
      profilePicture: '',
      language: 'English',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      role: 'User',
      createdAt: new Date(),
      emailVerified: false,
      twoFactorEnabled: false
    };

    await setDoc(profileRef, newProfile);
    setProfile(newProfile);

    // Sync any guest data
    await syncGuestData(cred.user.uid);

    // Send mock email verification simulation
    setSimulateEmail({
      type: 'verify',
      to: form.email,
      body: `Hi ${form.firstName},\n\nThank you for signing up for Kartigo Draft. Please verify your email by clicking the link below:\n\nhttps://biznxt-online-496409.firebaseapp.com/__/auth/action?mode=verifyEmail&apiKey=AIzaSyDVVfbPyF1QM5gCkP9ed_ipvu_zwg2glpQ\n\nBest,\nKartigo Team`
    });

    await addMockNotification(
      "Verification Sent",
      "An email verification link has been sent to your inbox.",
      "info"
    );
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await syncGuestData(cred.user.uid);
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncGuestData(cred.user.uid);
  };

  const sendOTPCode = async (phone: string, containerId: string) => {
    // Standard phone provider configuration with dynamic Recaptcha
    const recaptcha = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {}
    });
    return await signInWithPhoneNumber(auth, phone, recaptcha);
  };

  const verifyOTPCode = async (confirmation: ConfirmationResult, code: string) => {
    await confirmation.confirm(code);
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    setSimulateEmail({
      type: 'reset',
      to: email,
      body: `Hi there,\n\nYou requested a password reset for your Kartigo Draft account. Reset your password by clicking this URL:\n\nhttps://biznxt-online-496409.firebaseapp.com/__/auth/action?mode=resetPassword&apiKey=AIzaSyDVVfbPyF1QM5gCkP9ed_ipvu_zwg2glpQ\n\nRegards,\nThe Kartigo Team`
    });
  };

  const sendEmailVerify = async () => {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
    setSimulateEmail({
      type: 'verify',
      to: auth.currentUser.email || '',
      body: `Hi,\n\nPlease verify your email to lock down your Kartigo account:\n\nhttps://biznxt-online-496409.firebaseapp.com/__/auth/action?mode=verifyEmail`
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const logoutEverywhere = async () => {
    if (!user) return;
    
    // Query all sessions for this user
    const q = query(collection(db, 'users', user.uid, 'sessions'));
    const snap = await getDocs(q);
    
    // Delete all sessions in Firestore
    const batchPromises = snap.docs.map(docSnap => deleteDoc(docSnap.ref));
    await Promise.all(batchPromises);

    // Sign out local user
    await signOut(auth);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const profileRef = doc(db, 'users', user.uid, 'profiles', 'main');
    const updated = { ...profile, ...data };
    await setDoc(profileRef, updated, { merge: true });
    setProfile(updated);
    
    // Sync critical defaults to localStorage
    if (data.defaultLocation) {
      localStorage.setItem('kartigo_default_location', JSON.stringify(data.defaultLocation));
    }

    await addMockNotification(
      "Profile Updated",
      "Your user profile settings have been successfully modified.",
      "success"
    );
  };

  const setDefaultLocation = async (location: UserLocation) => {
    // Persist to session/local storage for both Guest and Authenticated
    if (user) {
      localStorage.setItem('kartigo_default_location', JSON.stringify(location));
      await updateProfileData({ defaultLocation: location });
    } else {
      sessionStorage.setItem('kartigo_default_location', JSON.stringify(location));
      // Local feedback for guests
      await addMockNotification(
        "Location Set",
        "Your location has been set for this session. Log in to save it permanently.",
        "info"
      );
    }
  };

  const updateBusinessProfile = async (bizProfile: BusinessProfile) => {
    if (user && profile) {
      await updateProfileData({ businessProfile: bizProfile });
    } else {
      // For guests, store in sessionStorage (Session only)
      sessionStorage.setItem('kartigo_guest_business_profile', JSON.stringify(bizProfile));
      await addMockNotification(
        "Profile Updated",
        "Business profile updated for this session. Log in to save permanently.",
        "success"
      );
    }
  };

  const changePassword = async (newPass: string) => {
    if (!auth.currentUser) return;
    await updatePassword(auth.currentUser, newPass);
    
    // Simulate Email Password Changed Notice
    setSimulateEmail({
      type: 'password_changed',
      to: auth.currentUser.email || '',
      body: `Hi ${profile?.firstName || 'User'},\n\nThis is a security alert confirming that your Kartigo Draft account password was changed successfully.\n\nIf you did not make this change, please contact support immediately.`
    });

    await addMockNotification(
      "Password Changed",
      "Your password was changed. We sent a security notification to your email.",
      "success"
    );
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      sessions,
      notifications,
      loading,
      rememberMe,
      setRememberMe,
      register,
      loginWithEmail,
      loginWithGoogle,
      sendOTPCode,
      verifyOTPCode,
      forgotPassword,
      sendEmailVerify,
      logout,
      logoutEverywhere,
      updateProfileData,
      setDefaultLocation,
      updateBusinessProfile,
      changePassword,
      addMockNotification,
      clearNotification,
      simulateEmail,
      clearSimulatedEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
