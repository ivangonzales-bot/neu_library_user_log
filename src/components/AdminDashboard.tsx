import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/authContext';
import { COLLEGES, VISIT_REASONS, VisitorEntry } from '@/lib/mockData';
import { getAllLogs, subscribe } from '@/lib/visitorLogStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookOpen, LogOut, Users, TrendingUp, GraduationCap, Briefcase, Calendar, Filter, X } from 'lucide-react';
import { format, isToday, isThisWeek, isWithinInterval, parseISO } from 'date-fns';

type DateFilter = 'today' | 'week' | 'custom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);

  const allVisitors = getAllLogs();

  const filteredVisitors = useMemo(() => {
    return allVisitors.filter((v: VisitorEntry) => {
      // Date filter
      if (dateFilter === 'today' && !isToday(v.timestamp)) return false;
      if (dateFilter === 'week' && !isThisWeek(v.timestamp, { weekStartsOn: 1 })) return false;
      if (dateFilter === 'custom' && startDate && endDate) {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        end.setHours(23, 59, 59);
        if (!isWithinInterval(v.timestamp, { start, end })) return false;
      }
      // Reason filter
      if (reasonFilter !== 'all' && v.reason !== reasonFilter) return false;
      // College filter
      if (collegeFilter !== 'all' && v.college !== collegeFilter) return false;
      // Employee filter
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
    const topCollege = filteredVisitors.reduce((acc, v) => {
      acc[v.college] = (acc[v.college] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCollegeName = Object.entries(topCollege).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';
    const topReason = filteredVisitors.reduce((acc, v) => {
      acc[v.reason] = (acc[v.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topReasonName = Object.entries(topReason).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';
    return { total, employees, students, topCollegeName, topReasonName };
  }, [filteredVisitors]);

  const clearFilters = () => {
    setDateFilter('week');
    setStartDate('');
    setEndDate('');
    setReasonFilter('all');
    setCollegeFilter('all');
    setEmployeeFilter('all');
  };

  const hasActiveFilters = reasonFilter !== 'all' || collegeFilter !== 'all' || employeeFilter !== 'all' || dateFilter !== 'week';

  const statCards = [
    { title: 'Total Visitors', value: stats.total, icon: Users, color: 'bg-primary/10 text-primary' },
    { title: 'Students', value: stats.students, icon: GraduationCap, color: 'bg-[hsl(var(--stat-green))]/10 text-[hsl(var(--stat-green))]' },
    { title: 'Employees', value: stats.employees, icon: Briefcase, color: 'bg-[hsl(var(--stat-purple))]/10 text-[hsl(var(--stat-purple))]' },
    { title: 'Top Reason', value: stats.topReasonName, icon: TrendingUp, color: 'bg-[hsl(var(--stat-orange))]/10 text-[hsl(var(--stat-orange))]', isText: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold text-foreground font-sans text-sm">NEU Library</span>
              <Badge variant="secondary" className="ml-2 font-sans text-xs">Admin</Badge>
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
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Visitor Statistics</h1>
          <p className="text-muted-foreground font-sans mt-1">Monitor and analyze library visitor data</p>
        </motion.div>

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
                    {s.isText ? s.value : s.value.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
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
              {/* Date filter row */}
              <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground font-sans">Time Period</label>
                  <div className="flex gap-1">
                    {(['today', 'week', 'custom'] as DateFilter[]).map(d => (
                      <Button
                        key={d}
                        size="sm"
                        variant={dateFilter === d ? 'default' : 'outline'}
                        onClick={() => setDateFilter(d)}
                        className="font-sans text-xs capitalize"
                      >
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

              {/* Category filters */}
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
        </motion.div>

        {/* Visitor Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
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
                      </TableRow>
                    ))}
                    {filteredVisitors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-sans">
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
      </main>
    </div>
  );
}
