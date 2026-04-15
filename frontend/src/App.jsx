// ============================================================
//  Smart Study Planner — React Frontend
//  Class 12 Computer Science Project
//  Stack: React + Recharts | Dark aesthetic UI
//  Connects to Flask backend via fetch() API calls
// ============================================================

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell
} from "recharts";

/* ── Color palette for subjects ── */
const COLORS = ['#6C63FF','#22C984','#4B9EFF','#F5A623','#FF5C5C','#A78BFA','#34D399'];

/* ── Sample initial data (replace with real API calls) ── */
const SUBJECTS_INIT = [
  { id: 1, name: 'Mathematics', goal: 3, color: '#6C63FF' },
  { id: 2, name: 'Physics',     goal: 2, color: '#22C984' },
  { id: 3, name: 'Chemistry',   goal: 2, color: '#4B9EFF' },
];
const SESSIONS_INIT = [
  { id: 1, subjectId: 1, hours: 2.5, date: '2025-04-10', notes: 'Calculus revision' },
  { id: 2, subjectId: 2, hours: 1.5, date: '2025-04-10', notes: 'Thermodynamics'   },
  { id: 3, subjectId: 1, hours: 3.0, date: '2025-04-11', notes: 'Integration'       },
  { id: 4, subjectId: 3, hours: 2.0, date: '2025-04-11', notes: 'Organic reactions' },
  { id: 5, subjectId: 2, hours: 2.5, date: '2025-04-12', notes: 'Optics'            },
];

/* ── Global CSS (inject once) ── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:#07080C; --bg2:#0D0F15; --bg3:#13151E;
      --card:#151820; --card2:#1A1D28;
      --border:rgba(255,255,255,.07); --border2:rgba(255,255,255,.13);
      --text:#F0F2FF; --muted:#7B7FA8; --muted2:#9699B8;
      --accent:#6C63FF; --accent2:#8B85FF;
      --green:#22C984; --amber:#F5A623; --red:#FF5C5C; --blue:#4B9EFF;
      --radius:12px; --radius2:8px;
    }
    body { font-family:'Space Grotesk',sans-serif; background:var(--bg); color:var(--text); }
    ::-webkit-scrollbar { width:4px }
    ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:4px }
    input, select, textarea {
      background:var(--bg3); border:1px solid var(--border2);
      border-radius:var(--radius2); color:var(--text);
      font-family:'Space Grotesk',sans-serif; font-size:14px;
      padding:9px 12px; outline:none; width:100%;
    }
    input:focus, select:focus, textarea:focus { border-color:var(--accent); }
  `}</style>
);

/* ══════════════════════════════════════════════════════════
   SMALL ATOMS
═══════════════════════════════════════════════════════════ */

const Badge = ({ children, color = '#6C63FF' }) => (
  <span style={{
    background: `${color}22`, color, fontSize: 11, fontWeight: 600,
    padding: '3px 8px', borderRadius: 4,
    letterSpacing: '.04em', textTransform: 'uppercase'
  }}>{children}</span>
);

const Label = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, color: 'var(--muted)',
    textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6
  }}>{children}</div>
);

const SectionTitle = ({ children }) => (
  <div style={{
    fontSize: 12, fontWeight: 700, color: 'var(--muted)',
    textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16
  }}>{children}</div>
);

/* ══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */
const NAV = [
  { id: 'dashboard', label: 'Dashboard',   icon: '▦' },
  { id: 'subjects',  label: 'Subjects',    icon: '◈' },
  { id: 'log',       label: 'Log Session', icon: '＋' },
  { id: 'progress',  label: 'Progress',    icon: '▲' },
];

function Sidebar({ page, setPage, user, onLogout }) {
  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '28px 0'
    }}>
      {/* Brand */}
      <div style={{ padding: '0 24px 28px' }}>
        <div style={{
          fontFamily: 'Syne', fontSize: 18, fontWeight: 800,
          letterSpacing: '-.02em'
        }}>
          Study<span style={{ color: 'var(--accent)' }}>Plan</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, letterSpacing: '.05em', textTransform: 'uppercase' }}>
         Study Tracker
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {NAV.map(n => {
          const active = page === n.id;
          return (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '11px 24px',
              background: active ? 'linear-gradient(90deg,rgba(108,99,255,.18) 0%,transparent 100%)' : 'transparent',
              border: 'none',
              borderLeft: active ? '2.5px solid var(--accent)' : '2.5px solid transparent',
              color: active ? 'var(--text)' : 'var(--muted)',
              fontSize: 13.5, fontWeight: active ? 600 : 400,
              cursor: 'pointer', fontFamily: 'Space Grotesk', textAlign: 'left', transition: 'all .15s'
            }}>
              <span style={{ fontSize: 16, opacity: active ? 1 : .7 }}>{n.icon}</span>
              {n.label}
            </button>
          );
        })}
      </nav>

      {/* User card + logout */}
      <div style={{ padding: '0 24px' }}>
        <div style={{
          background: 'var(--bg3)', borderRadius: 'var(--radius)',
          padding: 12, border: '1px solid var(--border)'
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--accent),var(--blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, marginBottom: 8
          }}>{user[0].toUpperCase()}</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Class XII Student</div>
          <button onClick={onLogout} style={{
            marginTop: 10, padding: '5px 0', width: '100%',
            background: 'rgba(255,92,92,.1)', border: '1px solid rgba(255,92,92,.2)',
            borderRadius: 6, color: 'var(--red)', fontSize: 11,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk'
          }}>Logout</button>
        </div>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════════ */
function DashboardPage({ subjects, sessions }) {
  const totalHours = sessions.reduce((a, s) => a + s.hours, 0);
  const today      = new Date().toISOString().slice(0, 10);
  const todayHours = sessions.filter(s => s.date === today).reduce((a, s) => a + s.hours, 0);

  const chartData = subjects.map(sub => {
    const hrs = sessions.filter(s => s.subjectId === sub.id).reduce((a, s) => a + s.hours, 0);
    return { name: sub.name.length > 7 ? sub.name.slice(0, 7) + '…' : sub.name, hours: parseFloat(hrs.toFixed(1)), color: sub.color };
  });

  const recent = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const STATS = [
    { label: 'Total Hours', value: totalHours.toFixed(1), unit: 'hrs', color: 'var(--accent)',  bg: 'rgba(108,99,255,.12)' },
    { label: 'Today',       value: todayHours.toFixed(1), unit: 'hrs', color: 'var(--green)',   bg: 'rgba(34,201,132,.12)' },
    { label: 'Subjects',    value: subjects.length,        unit: '',    color: 'var(--blue)',    bg: 'rgba(75,158,255,.12)'  },
    { label: 'Sessions',    value: sessions.length,        unit: '',    color: 'var(--amber)',   bg: 'rgba(245,166,35,.12)'  },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, letterSpacing: '-.03em' }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 'var(--radius)', padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Syne', color: s.color, lineHeight: 1 }}>
              {s.value}<span style={{ fontSize: 14, fontWeight: 400, marginLeft: 3, opacity: .7 }}>{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        {/* Bar chart */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <SectionTitle>Hours per Subject</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#7B7FA8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7B7FA8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent sessions */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <SectionTitle>Recent Sessions</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map(s => {
              const sub = subjects.find(x => x.id === s.subjectId);
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg3)', borderRadius: 'var(--radius2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: sub?.color || '#888', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{sub?.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.date}</div>
                    </div>
                  </div>
                  <Badge color={sub?.color}>{s.hours}h</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SUBJECTS PAGE
═══════════════════════════════════════════════════════════ */
function SubjectsPage({ subjects, setSubjects, sessions }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(2);
  const [colorIdx, setColorIdx] = useState(0);

const add = async () => {
 
  if (!name.trim()) return;

  const payload = {
    name: name.trim(),
    goal: Number(goal),
    color: COLORS[colorIdx % COLORS.length]
  };

  try {
    await fetch("http://127.0.0.1:5000/api/subjects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const list = await fetch("http://127.0.0.1:5000/api/subjects");
    const data = await list.json();
     console.log("API DATA =", data);


    setSubjects(
  data.map(item => ({
    ...item,
    id: Number(item.id),
    goal: Number(item.goal)
  }))
)

    setName("");
    setGoal(2);
    setColorIdx(p => p + 1);

  } catch (err) {
    console.log(err);
  }
};

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, letterSpacing: '-.03em' }}>Subjects</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Manage your subjects and study goals</p>
      </div>

      {/* Add form */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>Add New Subject</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 10, alignItems: 'end' }}>
          <div><Label>Subject Name</Label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mathematics" onKeyDown={e => e.key === 'Enter' && add()} /></div>
          <div><Label>Daily Goal (hrs)</Label><input type="number" value={goal} onChange={e => setGoal(e.target.value)} min="0.5" max="12" step="0.5" /></div>
          <button onClick={add} style={{ padding: '9px 22px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius2)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk', whiteSpace: 'nowrap', alignSelf: 'flex-end' }}>+ Add</button>
        </div>
      </div>

      {/* Subject grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
        {subjects.map(sub => {
          const hrs = sessions.filter(s => s.subjectId === sub.id).reduce((a, s) => a + s.hours, 0);
          const pct = Math.min((hrs / (sub.goal * 7)) * 100, 100);
          return (
            <div key={sub.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: sub.color }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{sub.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Goal: {sub.goal} hrs/day</div>
                </div>
                <button onClick={() => setSubjects(p => p.filter(s => s.id !== sub.id))} style={{ background: 'rgba(255,92,92,.12)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>Remove</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                <span>Total studied</span><span style={{ color: sub.color, fontWeight: 600 }}>{hrs.toFixed(1)}h</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: sub.color, borderRadius: 4, transition: 'width .4s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{pct.toFixed(0)}% of weekly goal</div>
            </div>
          );
        })}
        {subjects.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13, padding: 32, textAlign: 'center', gridColumn: '1/-1', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>No subjects yet — add one above</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LOG SESSION PAGE
═══════════════════════════════════════════════════════════ */
function LogPage({ subjects, sessions, setSessions }) {
  const today = new Date().toISOString().slice(0, 10);
  const [subId,  setSubId]  = useState('');
  const [hours,  setHours]  = useState('');
  const [date,   setDate]   = useState(today);
  const [notes,  setNotes]  = useState('');
  const [saved,  setSaved]  = useState(false);

  const save = async () => {
  if (!subId || !hours || parseFloat(hours) <= 0) return;

  const payload = {
    subjectId: Number(subId),
    hours: Number(hours),
    date,
    notes
  };

  try {
    await fetch("http://127.0.0.1:5000/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const res = await fetch("http://127.0.0.1:5000/api/sessions");
    const data = await res.json();

    setSessions(
      data.map(item => ({
        ...item,
        id: Number(item.id),
        subjectId: Number(item.subjectId),
        hours: Number(item.hours)
      }))
    );

    setHours('');
    setNotes('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);

  } catch (err) {
    console.log(err);
  }
};

  return (
    <div style={{ maxWidth: 540 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, letterSpacing: '-.03em' }}>Log Session</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Record what you studied today</p>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
        <div style={{ marginBottom: 16 }}><Label>Subject</Label>
          <select value={subId} onChange={e => setSubId(e.target.value)}>
            <option value="">Select subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ marginBottom: 16 }}><Label>Hours Studied</Label><input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 1.5" min="0.1" max="24" step="0.5" /></div>
          <div style={{ marginBottom: 16 }}><Label>Date</Label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: 20 }}><Label>Notes (optional)</Label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What topics did you cover?" rows={3} />
        </div>
        <button onClick={save} style={{ width: '100%', padding: 11, background: saved ? 'var(--green)' : 'var(--accent)', border: 'none', borderRadius: 'var(--radius2)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk', transition: 'background .3s' }}>
          {saved ? '✓ Session Saved!' : 'Save Session'}
        </button>
      </div>

      <div style={{ marginTop: 20, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
        <SectionTitle>Today's Sessions</SectionTitle>
        {sessions.filter(s => s.date === today).length === 0
          ? <div style={{ color: 'var(--muted)', fontSize: 13 }}>Nothing logged today yet.</div>
          : sessions.filter(s => s.date === today).map(s => {
              const sub = subjects.find(x => x.id === s.subjectId);
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: sub?.color || '#888' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{sub?.name}</div>
                      {s.notes && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.notes}</div>}
                    </div>
                  </div>
                  <Badge color={sub?.color}>{s.hours}h</Badge>
                </div>
              );
            })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PROGRESS PAGE
═══════════════════════════════════════════════════════════ */
function ProgressPage({ subjects, sessions }) {
  const chartData = subjects.map(sub => {
    const hrs = sessions.filter(s => s.subjectId === sub.id).reduce((a, s) => a + s.hours, 0);
    return { name: sub.name, studied: parseFloat(hrs.toFixed(1)), goal: parseFloat((sub.goal * 7).toFixed(1)), color: sub.color };
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const key = d.toISOString().slice(0, 10);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), hrs: parseFloat(sessions.filter(s => s.date === key).reduce((a, s) => a + s.hours, 0).toFixed(1)) };
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, letterSpacing: '-.03em' }}>Progress</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Your analytics dashboard</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <SectionTitle>Goal vs Actual (weekly)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#7B7FA8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v.length > 5 ? v.slice(0, 5) + '…' : v} />
              <YAxis tick={{ fill: '#7B7FA8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
              <Bar dataKey="goal"    fill="rgba(255,255,255,.06)" radius={[4, 4, 0, 0]} name="Goal" />
              <Bar dataKey="studied" radius={[4, 4, 0, 0]} name="Studied">{chartData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <SectionTitle>7-Day Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#7B7FA8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7B7FA8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="hrs" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 4, strokeWidth: 0 }} name="Hours" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject breakdown table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Subject Breakdown</div>
        {subjects.map((sub, i) => {
          const hrs = sessions.filter(s => s.subjectId === sub.id).reduce((a, s) => a + s.hours, 0);
          const pct = Math.min((hrs / (sub.goal * 7)) * 100, 100);
          const status = hrs >= sub.goal * 7 ? { label: 'On Track', color: 'var(--green)' } : hrs > 0 ? { label: 'In Progress', color: 'var(--amber)' } : { label: 'Not Started', color: 'var(--muted)' };
          return (
            <div key={sub.id} style={{ padding: '14px 20px', borderBottom: i < subjects.length - 1 ? '1px solid var(--border)' : 'none', display: 'grid', gridTemplateColumns: '1.2fr 80px 80px 120px 100px', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: sub.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{sub.name}</span>
              </div>
              <div style={{ fontSize: 13 }}>{hrs.toFixed(1)}<span style={{ color: 'var(--muted)', fontSize: 11 }}> hrs</span></div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{sub.goal * 7}<span style={{ fontSize: 11 }}> goal</span></div>
              <div>
                <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: sub.color, borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{pct.toFixed(0)}%</div>
              </div>
              <Badge color={status.color}>{status.label}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AUTH SCREEN
═══════════════════════════════════════════════════════════ */
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [email, setEmail] = useState('');
  const [err,  setErr]  = useState('');

  const submit = () => {
    if (!user.trim() || !pass.trim()) { setErr('Fill in all fields'); return; }
    if (mode === 'signup' && !email.trim()) { setErr('Email required'); return; }
    if (pass.length < 4) { setErr('Password min 4 chars'); return; }
    onLogin(user);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Left */}
      <div style={{ flex: 1, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 60 }}>
        <div style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1, marginBottom: 20 }}>
          Plan your<br /><span style={{ color: 'var(--accent)' }}>study</span> better.
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 320 }}>Track hours, set goals, and visualise your progress with a clean dashboard built for Class XII.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 36 }}>
          {['Track subjects & daily goals', 'Log study sessions in seconds', 'Charts & progress analytics'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(108,99,255,.2)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--accent)', fontWeight: 800 }}>✓</div>
              <span style={{ color: 'var(--muted2)' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={{ width: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%' }}>
          <div style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 28 }}>
            {mode === 'login' ? 'Login to your study planner' : 'Start planning your studies'}
          </p>

          {err && <div style={{ background: 'rgba(255,92,92,.12)', border: '1px solid rgba(255,92,92,.3)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--red)', marginBottom: 14 }}>{err}</div>}

          <div style={{ marginBottom: 14 }}><Label>Username</Label><input value={user} onChange={e => setUser(e.target.value)} placeholder="your_username" onKeyDown={e => e.key === 'Enter' && submit()} /></div>
          {mode === 'signup' && <div style={{ marginBottom: 14 }}><Label>Email</Label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" /></div>}
          <div style={{ marginBottom: 22 }}><Label>Password</Label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Min 4 characters" onKeyDown={e => e.key === 'Enter' && submit()} /></div>

          <button onClick={submit} style={{ width: '100%', padding: 12, background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius2)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk', letterSpacing: '.02em' }}>
            {mode === 'login' ? 'Login →' : 'Create Account →'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'var(--muted)' }}>
            {mode === 'login'
              ? <><span>No account? </span><button onClick={() => { setMode('signup'); setErr(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: 12, fontFamily: 'Space Grotesk' }}>Sign up</button></>
              : <><span>Have an account? </span><button onClick={() => { setMode('login'); setErr(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: 12, fontFamily: 'Space Grotesk' }}>Login</button></>}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [backendMsg, setBackendMsg] = useState("");
  const [user,     setUser]     = useState(null);
  const [page,     setPage]     = useState('dashboard');
  const [subjects, setSubjects] = useState([]);
 const [sessions, setSessions] = useState([]);

  useEffect(() => {
  fetch("http://127.0.0.1:5000/api/test")
    .then(res => res.json())
    .then(data => setBackendMsg(data.message))
    .catch(err => console.log(err));
}, []);

useEffect(() => {
  fetch("http://127.0.0.1:5000/api/subjects")
    .then(res => res.json())
   .then(data =>
  setSubjects(
    data.map(item => ({
      ...item,
      id: Number(item.id),
      goal: Number(item.goal)
    }))
  )
)
    .catch(err => console.log(err));
}, []);


useEffect(() => {
  fetch("http://127.0.0.1:5000/api/sessions")
    .then(res => res.json())
    .then(data =>
      setSessions(
        data.map(item => ({
          ...item,
          id: Number(item.id),
          subjectId: Number(item.subjectId),
          hours: Number(item.hours)
        }))
      )
    )
    .catch(err => console.log(err));
}, []);



  if (!user) return <><GlobalStyle /><AuthScreen onLogin={u => setUser(u)} /></>;

  const pages = {
    dashboard: <DashboardPage subjects={subjects} sessions={sessions} />,
    subjects:  <SubjectsPage  subjects={subjects} setSubjects={setSubjects} sessions={sessions} />,
    log:       <LogPage       subjects={subjects} sessions={sessions} setSessions={setSessions} />,
    progress:  <ProgressPage  subjects={subjects} sessions={sessions} />,
  };
console.log("SUBJECTS STATE =", subjects);
 return (
  <>
    <GlobalStyle />
    <div style={{ padding: "10px", color: "lime", textAlign: "center", fontSize: "14px" }}>
      {backendMsg}
    </div>

    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: window.innerWidth <= 768 ? "column" : "row"
      }}
    >
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        onLogout={() => setUser(null)}
      />

      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: window.innerWidth <= 768 ? "16px" : "32px 36px",
          background: "var(--bg)"
        }}
      >
        {pages[page]}
      </main>
    </div>
  </>
);
}
