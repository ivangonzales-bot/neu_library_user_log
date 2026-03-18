import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/authContext';
import { COLLEGES, VISIT_REASONS, PROGRAMS, VisitorEntry } from '@/lib/mockData';
import { getAllLogs, getLogsByEmail, getUniqueUsers, subscribe, updateLog, deleteLog } from '@/lib/visitorLogStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { BookOpen, LogOut, Users, TrendingUp, GraduationCap, Briefcase, Calendar, Filter, X, ArrowLeft, Pencil, Trash2, Eye, History } from 'lucide-react';
import { format, isToday, isThisWeek, isWithinInterval, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type DateFilter = 'today' | 'week' | 'custom';
type View = 'overview' | 'student-detail';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [tick, setTick] = useState(0);

  // Student detail view
  const [view, setView] = useState<View>('overview');
  const [selectedEmail, setSelectedEmail] = useState('');

  // Edit modal
  const [editEntry, setEditEntry] = useState<VisitorEntry | null>(null);
  const [editReason, setEditReason] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editProgram, setEditProgram] = useState('');

  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);

  const allVisitors = useMemo(() => getAllLogs(), [tick]);
  const uniqueUsers = useMemo(() => getUniqueUsers(), [tick]);

  const filteredVisitors = useMemo(() => {
    return allVisitors.filter((v: VisitorEntry) => {
      if (dateFilter === 'today' && !isToday(v.timestamp)) return false;
      if (dateFilter === 'week' && !isThisWeek(v.timestamp, { weekStartsOn: 1 })) return false;
      if (dateFilter === 'custom' && startDate && endDate) {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        end.setHours(23, 59, 59);
        if (!isWithinInterval(v.timestamp, { start, end })) return false;
      }
      if (reasonFilter !== 'all' && v.reason !== reasonFilter) return false;
      if (collegeFilter !== 'all' && v.college !== collegeFilter) return false;
      if (employeeFilter === 'employee' && !v.isEmployee) return false;
      if (employeeFilter === 'student' && v.isEmployee) return false;
      if (employeeFilter === 'teacher' && v.employeeType !== 'teacher') return false;
      if (employeeFilter === 'staff' && v.employeeType !== 'staff') return false;
      return true;
    });
  }, [allVisitors, dateFilter, startDate, endDate, reasonFilter, collegeFilter, employeeFilter]);

  const stats = useMemo(() => {
    const total = filteredVisitors.length;
    const employees = filteredVisitors.filter(v => v.isEmployee).length;
    const students = total - employees;
    const topReason = filteredVisitors.reduce((acc, v) => {
      acc[v.reason] = (acc[v.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topReasonName = Object.entries(topReason).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';
    return { total, employees, students, topReasonName };
  }, [filteredVisitors]);

  // Student detail logs
  const studentLogs = useMemo(() => {
    if (!selectedEmail) return [];
    return getLogsByEmail(selectedEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmail, tick]);

  const selectedUser = uniqueUsers.find(u => u.email === selectedEmail);

  const clearFilters = () => {
    setDateFilter('week');
    setStartDate('');
    setEndDate('');
    setReasonFilter('all');
    setCollegeFilter('all');
    setEmployeeFilter('all');
  };

  const hasActiveFilters = reasonFilter !== 'all' || collegeFilter !== 'all' || employeeFilter !== 'all' || dateFilter !== 'week';

  const openEdit = (entry: VisitorEntry) => {
    setEditEntry(entry);
    setEditReason(entry.reason);
    setEditCollege(entry.college);
    setEditProgram(entry.program || '');
  };

  const saveEdit = () => {
    if (!editEntry) return;
    updateLog(editEntry.id, {
      reason: editReason,
      college: editCollege,
      program: editProgram || undefined,
    });
    setEditEntry(null);
    toast({ title: 'Entry updated successfully' });
  };

  const handleDelete = (id: string) => {
    deleteLog(id);
    toast({ title: 'Entry deleted' });
  };

  const editPrograms = editCollege ? (PROGRAMS[editCollege] || []) : [];

  const statCards = [
    { title: 'Total Visitors', value: stats.total, icon: Users, color: 'bg-primary/10 text-primary' },
    { title: 'Students', value: stats.students, icon: GraduationCap, color: 'bg-[hsl(var(--stat-green))]/10 text-[hsl(var(--stat-green))]' },
    { title: 'Employees', value: stats.employees, icon: Briefcase, color: 'bg-[hsl(var(--stat-purple))]/10 text-[hsl(var(--stat-purple))]' },
    { title: 'Top Reason', value: stats.topReasonName, icon: TrendingUp, color: 'bg-[hsl(var(--stat-orange))]/10 text-[hsl(var(--stat-orange))]', isText: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold text-foreground font-sans text-sm">NEU Library</span>
              <Badge variant="secondary" className="ml-2 font-sans text-xs capitalize">{user?.role}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-sans hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="font-sans gap-2 text-muted-foreground">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <AnimatePresence mode="wait">
          {view === 'overview' ? (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Visitor Statistics</h1>
                <p className="text-muted-foreground font-sans mt-1">Monitor and analyze library visitor data</p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                  <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-muted-foreground font-sans uppercase tracking-wider">{s.title}</span>
                          <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center`}>
                            <s.icon className="w-4 h-4" />
                          </div>
                        </div>
                        <p className={`font-bold text-foreground ${s.isText ? 'text-lg' : 'text-3xl'}`}>
                          {s.isText ? s.value : (s.value as number).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Filters */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 font-sans">
                      <Filter className="w-4 h-4" /> Filters
                    </CardTitle>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="font-sans text-xs gap-1">
                        <X className="w-3 h-3" /> Clear all
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground font-sans">Time Period</label>
                      <div className="flex gap-1">
                        {(['today', 'week', 'custom'] as DateFilter[]).map(d => (
                          <Button key={d} size="sm" variant={dateFilter === d ? 'default' : 'outline'} onClick={() => setDateFilter(d)} className="font-sans text-xs capitalize">
                            <Calendar className="w-3 h-3 mr-1" />
                            {d === 'custom' ? 'Custom' : d === 'today' ? 'Today' : 'This Week'}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {dateFilter === 'custom' && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground font-sans">From</label>
                          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9 w-40 font-sans text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground font-sans">To</label>
                          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9 w-40 font-sans text-sm" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="space-y-1.5 min-w-[180px]">
                      <label className="text-xs font-medium text-muted-foreground font-sans">Reason</label>
                      <Select value={reasonFilter} onValueChange={setReasonFilter}>
                        <SelectTrigger className="h-9 font-sans text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Reasons</SelectItem>
                          {VISIT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 min-w-[220px]">
                      <label className="text-xs font-medium text-muted-foreground font-sans">College</label>
                      <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                        <SelectTrigger className="h-9 font-sans text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Colleges</SelectItem>
                          {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 min-w-[160px]">
                      <label className="text-xs font-medium text-muted-foreground font-sans">Visitor Type</label>
                      <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                        <SelectTrigger className="h-9 font-sans text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="student">Students Only</SelectItem>
                          <SelectItem value="employee">All Employees</SelectItem>
                          <SelectItem value="teacher">Teachers Only</SelectItem>
                          <SelectItem value="staff">Staff Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Students List */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-sans flex items-center gap-2">
                    <Users className="w-4 h-4" /> Visitors Directory
                    <span className="text-sm font-normal text-muted-foreground">({uniqueUsers.length} users)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-sans text-xs">Name</TableHead>
                          <TableHead className="font-sans text-xs">Email</TableHead>
                          <TableHead className="font-sans text-xs">Total Visits</TableHead>
                          <TableHead className="font-sans text-xs">Last Visit</TableHead>
                          <TableHead className="font-sans text-xs">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uniqueUsers.map(u => (
                          <TableRow key={u.email} className="cursor-pointer" onClick={() => { setSelectedEmail(u.email); setView('student-detail'); }}>
                            <TableCell className="font-sans text-sm font-medium">{u.name}</TableCell>
                            <TableCell className="font-sans text-sm text-muted-foreground">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-sans text-xs">{u.visitCount}</Badge>
                            </TableCell>
                            <TableCell className="font-sans text-sm text-muted-foreground">
                              {format(u.lastVisit, 'MMM d, yyyy h:mm a')}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="font-sans text-xs gap-1">
                                <Eye className="w-3 h-3" /> View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Recent All Visitors */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-sans">
                    Recent Visitors
                    <span className="text-sm font-normal text-muted-foreground ml-2">({filteredVisitors.length} records)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[420px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-sans text-xs">Name</TableHead>
                          <TableHead className="font-sans text-xs">College</TableHead>
                          <TableHead className="font-sans text-xs">Reason</TableHead>
                          <TableHead className="font-sans text-xs">Type</TableHead>
                          <TableHead className="font-sans text-xs">Date & Time</TableHead>
                          <TableHead className="font-sans text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVisitors.slice(0, 50).map(v => (
                          <TableRow key={v.id}>
                            <TableCell className="font-sans text-sm font-medium">{v.name}</TableCell>
                            <TableCell className="font-sans text-sm text-muted-foreground">{v.college}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-sans text-xs font-normal">{v.reason}</Badge>
                            </TableCell>
                            <TableCell>
                              {v.isEmployee ? (
                                <Badge className="font-sans text-xs bg-[hsl(var(--stat-purple))]/10 text-[hsl(var(--stat-purple))] border-0">
                                  {v.employeeType === 'teacher' ? 'Teacher' : 'Staff'}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="font-sans text-xs font-normal">Student</Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-sans text-sm text-muted-foreground">
                              {format(v.timestamp, 'MMM d, yyyy h:mm a')}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => openEdit(v)} className="h-7 w-7 p-0">
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredVisitors.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-sans">
                              No visitors match the selected filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Student Detail View */
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setView('overview')} className="font-sans gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{selectedUser?.name}</h1>
                  <p className="text-sm text-muted-foreground font-sans">{selectedEmail} · {studentLogs.length} total visits</p>
                </div>
              </div>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-sans flex items-center gap-2">
                    <History className="w-4 h-4" /> Visit History
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
                          <TableHead className="font-sans text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentLogs.map(v => (
                          <TableRow key={v.id}>
                            <TableCell className="font-sans text-sm text-muted-foreground">
                              {format(v.timestamp, 'MMM d, yyyy h:mm a')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-sans text-xs font-normal">{v.reason}</Badge>
                            </TableCell>
                            <TableCell className="font-sans text-sm text-muted-foreground">{v.college}</TableCell>
                            <TableCell className="font-sans text-sm text-muted-foreground">{v.program || '—'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => openEdit(v)} className="h-7 w-7 p-0">
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {studentLogs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-sans">
                              No visits found for this user.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(open) => { if (!open) setEditEntry(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans">Edit Visit Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground font-sans">Reason</label>
              <Select value={editReason} onValueChange={setEditReason}>
                <SelectTrigger className="h-10 font-sans text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VISIT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground font-sans">College</label>
              <Select value={editCollege} onValueChange={(v) => { setEditCollege(v); setEditProgram(''); }}>
                <SelectTrigger className="h-10 font-sans text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground font-sans">Program</label>
              <Select value={editProgram} onValueChange={setEditProgram}>
                <SelectTrigger className="h-10 font-sans text-sm"><SelectValue placeholder="Select program..." /></SelectTrigger>
                <SelectContent>
                  {editPrograms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEntry(null)} className="font-sans">Cancel</Button>
            <Button onClick={saveEdit} className="font-sans">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Small import used in detail view
import { History } from 'lucide-react';
