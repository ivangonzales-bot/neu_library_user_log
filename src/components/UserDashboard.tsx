import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/authContext';
import { COLLEGES, PROGRAMS, VISIT_REASONS } from '@/lib/mockData';
import { addVisit, getAllVisits, VisitRecord } from '@/lib/visitorLogStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookOpen, LogOut, Send, History } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [college, setCollege] = useState('');
  const [program, setProgram] = useState('');
  const [myLogs, setMyLogs] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyLogs = async () => {
    if (!user) return;
    const all = await getAllVisits();
    // Filter by user_id which we store as the email
    setMyLogs(all.filter(v => v.user_id === user.email));
  };

  useEffect(() => {
    fetchMyLogs();
  }, [user]);

  const availablePrograms = college ? (PROGRAMS[college] || []) : [];

  const handleSubmit = async () => {
    if (!reason) {
      toast({ title: 'Please select a reason for your visit', variant: 'destructive' });
      return;
    }
    if (!college) {
      toast({ title: 'Please select your college', variant: 'destructive' });
      return;
    }
    if (!program) {
      toast({ title: 'Please select your program', variant: 'destructive' });
      return;
    }

    const finalReason = reason === 'Other' ? (customReason.trim() || 'Other') : reason;

    setLoading(true);
    try {
      await addVisit({
        user_id: user?.email || 'unknown',
        college,
        program,
        reason: finalReason,
      });
      toast({ title: 'Visit logged successfully! Signing out...' });
      setTimeout(() => {
        logout();
      }, 1500);
    } catch {
      toast({ title: 'Failed to save visit. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground font-sans text-sm">NEU Library</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-sans hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="font-sans gap-2 text-muted-foreground">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome to NEU Library!</h1>
          <p className="text-muted-foreground font-sans mt-1">
            Hello, <span className="font-semibold text-foreground">{user?.name}</span>! Log your visit below.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-sans flex items-center gap-2">
                  <Send className="w-4 h-4" /> Log Your Visit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground font-sans">Reason for Visit</label>
                  <Select value={reason} onValueChange={(v) => { setReason(v); if (v !== 'Other') setCustomReason(''); }}>
                    <SelectTrigger className="h-10 font-sans text-sm"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                    <SelectContent>
                      {VISIT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {reason === 'Other' && (
                    <Textarea
                      placeholder="Please specify your reason..."
                      value={customReason}
                      onChange={e => setCustomReason(e.target.value)}
                      className="mt-2 font-sans text-sm resize-none"
                      maxLength={200}
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground font-sans">College</label>
                  <Select value={college} onValueChange={(v) => { setCollege(v); setProgram(''); }}>
                    <SelectTrigger className="h-10 font-sans text-sm"><SelectValue placeholder="Select college..." /></SelectTrigger>
                    <SelectContent>
                      {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground font-sans">Program / Course</label>
                  <Select value={program} onValueChange={setProgram} disabled={!college}>
                    <SelectTrigger className="h-10 font-sans text-sm"><SelectValue placeholder={college ? "Select program..." : "Select college first"} /></SelectTrigger>
                    <SelectContent>
                      {availablePrograms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSubmit} disabled={loading} className="w-full font-sans gap-2 mt-2">
                  <Send className="w-4 h-4" /> {loading ? 'Saving...' : 'Submit Log'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-sans flex items-center gap-2">
                  <History className="w-4 h-4" /> Your Visit History
                  <span className="text-sm font-normal text-muted-foreground">({myLogs.length} visits)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-sans text-xs">Date & Time</TableHead>
                        <TableHead className="font-sans text-xs">Reason</TableHead>
                        <TableHead className="font-sans text-xs">College</TableHead>
                        <TableHead className="font-sans text-xs">Program</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myLogs.map(v => (
                        <TableRow key={v.id}>
                          <TableCell className="font-sans text-sm text-muted-foreground">
                            {v.created_at ? format(new Date(v.created_at), 'MMM d, yyyy h:mm a') : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-sans text-xs font-normal">{v.reason || '—'}</Badge>
                          </TableCell>
                          <TableCell className="font-sans text-sm text-muted-foreground">{v.college || '—'}</TableCell>
                          <TableCell className="font-sans text-sm text-muted-foreground">{v.program || '—'}</TableCell>
                        </TableRow>
                      ))}
                      {myLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-muted-foreground font-sans">
                            No visits logged yet. Submit your first log!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
