import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BookOpen, Lock, Mail, GraduationCap, Chrome } from 'lucide-react';
import type { UserRole } from '@/lib/mockData';
import { isUserBlocked } from '@/lib/blockedUsersStore';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pick up OAuth errors stored in sessionStorage
  useEffect(() => {
    const authError = sessionStorage.getItem('auth_error');
    if (authError) {
      setError(authError);
      sessionStorage.removeItem('auth_error');
    }
  }, []);

  const role: UserRole = showAdmin ? 'admin' : 'user';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@neu.edu.ph')) {
      setError('Please use your NEU email (@neu.edu.ph)');
      return;
    }
    if (role === 'admin' && password.length < 4) {
      setError('Please enter a valid password');
      return;
    }

    setLoading(true);
    try {
      const blocked = await isUserBlocked(email);
      if (blocked) {
        setError('Your account has been blocked. Please contact the library admin.');
        return;
      }
      const success = login(email, password, role);
      if (!success) {
        setError('Only admin emails (containing ".admin") or jcesperanza@neu.edu.ph can sign in as Admin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md px-4"
      >
        <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-primary to-accent" />
          <CardHeader className="text-center pt-10 pb-2 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <BookOpen className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">NEU Library</h1>
              <p className="text-muted-foreground mt-1 font-sans text-sm">Visitor Log System</p>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10 pt-4">
            <AnimatePresence mode="wait">
              {!showAdmin ? (
                <motion.div key="student" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground font-sans">Student Sign In</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium font-sans text-foreground">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@neu.edu.ph"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          className="pl-10 h-11 font-sans"
                        />
                      </div>
                    </div>
                    {error && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-destructive font-sans">
                        {error}
                      </motion.p>
                    )}
                    <Button type="submit" disabled={loading} className="w-full h-11 font-sans font-semibold text-base shadow-lg shadow-primary/20">
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                      <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground font-sans">or</span></div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        try { await loginWithGoogle(); } catch { setError('Google sign-in failed. Please try again.'); } finally { setLoading(false); }
                      }}
                      className="w-full h-11 font-sans font-semibold text-base gap-2"
                    >
                      <Chrome className="w-5 h-5" /> Sign in with Google
                    </Button>
                  </form>
                  <button
                    type="button"
                    onClick={() => { setShowAdmin(true); setError(''); setEmail(''); setPassword(''); }}
                    className="mt-6 w-full text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors font-sans text-center"
                  >
                    Admin? Tap here →
                  </button>
                </motion.div>
              ) : (
                <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground font-sans">Admin Sign In</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium font-sans text-foreground">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="admin@neu.edu.ph"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          className="pl-10 h-11 font-sans"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-sans">
                        Must contain ".admin" (e.g. miguel.admin@neu.edu.ph)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium font-sans text-foreground">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setError(''); }}
                          className="pl-10 h-11 font-sans"
                        />
                      </div>
                    </div>
                    {error && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-destructive font-sans">
                        {error}
                      </motion.p>
                    )}
                    <Button type="submit" disabled={loading} className="w-full h-11 font-sans font-semibold text-base shadow-lg shadow-primary/20">
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                  <button
                    type="button"
                    onClick={() => { setShowAdmin(false); setError(''); setEmail(''); setPassword(''); }}
                    className="mt-6 w-full text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors font-sans text-center"
                  >
                    ← Back to Student Sign In
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-xs text-center text-muted-foreground mt-6 font-sans">
              Use your NEU institutional email to log in
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
