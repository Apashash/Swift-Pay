import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  FileText,
  Filter,
  Globe2,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { apiFetch, type ApiTransaction } from '@/lib/api';

type Status = 'Actif' | 'En attente' | 'Suspendu' | 'Approuvé' | 'Refusé';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  country: string;
  joinedAt: string;
  verified: boolean;
  role: 'user' | 'admin';
  avatar?: string | null;
}

interface AdminKyc {
  id: string;
  userId: string;
  name: string;
  email: string;
  country: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface AdminTransaction extends ApiTransaction {
  customer: string;
}

interface AdminOverview {
  users: { total: number; verified: number };
  transactions: { total: number; pending: number; volume: number };
  kyc: { pending: number; approved: number };
}

interface DemoUser {
  id: string;
  name: string;
  email: string;
  country: string;
  joined: string;
  volume: string;
  status: Status;
  avatar?: string | null;
}

const demoUsers: DemoUser[] = [
  { id: 'USR-2048', name: 'Aminata Diop', email: 'aminata.diop@example.com', country: 'Sénégal', joined: '24 juin 2025', volume: '1 248 500 FCFA', status: 'Actif' },
  { id: 'USR-1934', name: 'Koffi Mensah', email: 'koffi.mensah@example.com', country: 'Côte d’Ivoire', joined: '19 juin 2025', volume: '824 000 FCFA', status: 'En attente' },
  { id: 'USR-1871', name: 'Nadia Kouassi', email: 'nadia.kouassi@example.com', country: 'Côte d’Ivoire', joined: '17 juin 2025', volume: '3 610 200 FCFA', status: 'Actif' },
  { id: 'USR-1760', name: 'Moussa Traoré', email: 'moussa.traore@example.com', country: 'Mali', joined: '12 juin 2025', volume: '245 900 FCFA', status: 'Suspendu' },
  { id: 'USR-1682', name: 'Chantal N’Guessan', email: 'chantal.nguessan@example.com', country: 'Cameroun', joined: '04 juin 2025', volume: '972 300 FCFA', status: 'Actif' },
];

const demoKyc = [
  { id: 'KYC-0084', name: 'Koffi Mensah', type: 'Carte nationale', country: 'Côte d’Ivoire', submitted: 'Il y a 18 min', status: 'En attente' as Status },
  { id: 'KYC-0083', name: 'Mariama Bah', type: 'Passeport', country: 'Guinée', submitted: 'Il y a 42 min', status: 'En attente' as Status },
  { id: 'KYC-0082', name: 'Yao N’Dri', type: 'Carte nationale', country: 'Côte d’Ivoire', submitted: 'Hier, 18:21', status: 'Approuvé' as Status },
  { id: 'KYC-0081', name: 'Aïcha Koné', type: 'Permis de conduire', country: 'Sénégal', submitted: 'Hier, 16:04', status: 'Refusé' as Status },
];

const demoTransfers = [
  { id: 'SP-4F82A1', kind: 'Dépôt', customer: 'Nadia Kouassi', channel: 'USDT → FCFA', amount: '450 000 FCFA', status: 'Approuvé' as Status, time: 'Aujourd’hui, 09:42' },
  { id: 'SP-4F81C9', kind: 'Retrait', customer: 'Aminata Diop', channel: 'Wave Sénégal', amount: '125 000 FCFA', status: 'En attente' as Status, time: 'Aujourd’hui, 09:37' },
  { id: 'SP-4F80B2', kind: 'Envoi', customer: 'Chantal N’Guessan', channel: 'MTN Mobile Money', amount: '88 500 FCFA', status: 'Approuvé' as Status, time: 'Aujourd’hui, 09:11' },
  { id: 'SP-4F7E14', kind: 'Retrait', customer: 'Moussa Traoré', channel: 'Orange Money Mali', amount: '64 000 FCFA', status: 'Refusé' as Status, time: 'Hier, 22:19' },
  { id: 'SP-4F7D80', kind: 'Dépôt', customer: 'Koffi Mensah', channel: 'BTC → FCFA', amount: '310 000 FCFA', status: 'En attente' as Status, time: 'Hier, 21:54' },
];

const navTitles: Record<string, string> = {
  utilisateurs: 'Utilisateurs',
  kyc: 'Vérifications KYC',
  transactions: 'Transactions',
  'paiements-en-attente': 'Paiements en attente',
  'numeros-retrait': 'Numéros de retrait',
  frais: 'Frais',
  conversions: 'Conversions',
  'pays-operateurs': 'Pays & opérateurs',
  afribapay: 'AfribaPay',
  authenticator: 'Authenticator',
};

const formatNumber = (number: number) => number.toLocaleString('fr-FR');

function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Actif: 'bg-[#e7f5dc] text-[#4e812c]',
    'En attente': 'bg-[#fff1dc] text-[#a96823]',
    Suspendu: 'bg-[#fbe6e5] text-[#b74c47]',
    Approuvé: 'bg-[#e7f5dc] text-[#4e812c]',
    Refusé: 'bg-[#fbe6e5] text-[#b74c47]',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}>{status}</span>;
}

function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88a14a]">{eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17211c] md:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-xs leading-5 text-[#819087]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon, accent = 'lime' }: { label: string; value: string; detail: string; icon: React.ElementType; accent?: 'lime' | 'orange' | 'blue' | 'red' }) {
  const accentStyles = {
    lime: 'bg-[#edf8e3] text-[#5c8b35]',
    orange: 'bg-[#fff1df] text-[#b8712c]',
    blue: 'bg-[#e7f1f8] text-[#507b9b]',
    red: 'bg-[#fbe8e6] text-[#bb5951]',
  };
  return (
    <div className="rounded-2xl border border-[#dfe6df] bg-white p-5 shadow-[0_4px_18px_rgba(46,70,51,0.03)]">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-[#819087]">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentStyles[accent]}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
      <p className="mt-1 text-[10px] text-[#819087]">{detail}</p>
    </div>
  );
}

function DataTable({ children, headers }: { children: React.ReactNode; headers: string[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dfe6df] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b border-[#edf0ed] bg-[#fbfcfb]">
            <tr>{headers.map((header) => <th key={header} className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#97a39b]">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#edf0ed]">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function Toolbar({ search, setSearch, filter, setFilter, filterOptions, onExport }: { search: string; setSearch: (value: string) => void; filter: string; setFilter: (value: string) => void; filterOptions: string[]; onExport?: () => void }) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa79e]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher..." className="h-10 w-full rounded-xl border border-[#dfe6df] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#8fb85e] focus:ring-2 focus:ring-[#b8f26d]/30" />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa79e]" />
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 appearance-none rounded-xl border border-[#dfe6df] bg-white pl-9 pr-8 text-xs outline-none focus:border-[#8fb85e]">
            {filterOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
      </div>
      {onExport && <button type="button" onClick={onExport} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dfe6df] bg-white px-4 text-xs font-semibold hover:bg-[#f0f5ee]"><Download className="h-3.5 w-3.5" /> Exporter</button>}
    </div>
  );
}

function DashboardView({ transactions, overview }: { transactions: ApiTransaction[]; overview: AdminOverview | null }) {
  const recent = transactions.slice(0, 4);
  const overviewUsers = overview?.users.total ?? 0;
  const overviewVolume = overview?.transactions.volume ?? 0;
  const overviewTransactions = overview?.transactions.total ?? transactions.length;
  const overviewPending = (overview?.transactions.pending ?? 0) + (overview?.kyc.pending ?? 0);
  return (
    <>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Volume traité" value={`${formatNumber(overviewVolume)} FCFA`} detail="Transactions complétées" icon={ArrowUpRight} />
        <StatCard label="Utilisateurs actifs" value={formatNumber(overviewUsers)} detail={`${overview?.users.verified ?? 0} comptes vérifiés`} icon={Users} accent="blue" />
        <StatCard label="Transactions" value={formatNumber(overviewTransactions)} detail="Toutes les opérations enregistrées" icon={ArrowLeftRight} accent="orange" />
        <StatCard label="En attente" value={formatNumber(overviewPending)} detail={`${overview?.kyc.pending ?? 0} KYC · ${overview?.transactions.pending ?? 0} paiements`} icon={Clock3} accent="red" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-[#dfe6df] bg-white p-5 md:p-6">
          <div className="flex items-start justify-between"><div><h3 className="text-sm font-semibold">Volume des transactions</h3><p className="mt-1 text-[11px] text-[#819087]">Évolution des flux en FCFA · 30 derniers jours</p></div><select className="rounded-lg border border-[#dfe6df] bg-white px-2 py-1.5 text-[10px] text-[#718078]"><option>30 jours</option><option>7 jours</option><option>12 mois</option></select></div>
          <div className="mt-8 flex h-48 items-end gap-1.5 border-b border-l border-[#edf0ed] px-3 pb-0 pt-4 sm:gap-3">
            {[38, 52, 44, 67, 55, 72, 61, 84, 73, 92, 78, 88, 68, 76, 96, 82, 90, 74, 87, 99, 81, 93, 77, 89].map((height, index) => <div key={`${height}-${index}`} className={`group relative flex-1 rounded-t-md transition-all hover:bg-[#8fb85e] ${index === 19 ? 'bg-[#83b84d]' : 'bg-[#dceecb]'}`} style={{ height: `${height}%` }}><span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-[#17211c] px-1.5 py-1 text-[9px] text-white group-hover:block">{Math.round(height * 8)}k</span></div>)}
          </div>
          <div className="mt-3 flex justify-between pl-3 text-[10px] text-[#a1aca4]"><span>01 juin</span><span>08 juin</span><span>15 juin</span><span>22 juin</span><span>Aujourd’hui</span></div>
        </div>
        <div className="rounded-2xl border border-[#dfe6df] bg-white p-5 md:p-6">
          <div className="flex items-start justify-between"><div><h3 className="text-sm font-semibold">Répartition des opérations</h3><p className="mt-1 text-[11px] text-[#819087]">Sur les 30 derniers jours</p></div><button type="button" className="rounded-lg p-1.5 text-[#9aa79e] hover:bg-[#f0f5ee]"><MoreHorizontal className="h-4 w-4" /></button></div>
          <div className="mx-auto mt-7 flex h-36 w-36 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#83b84d 0 48%, #efad59 48% 73%, #78a5bf 73% 91%, #d9e3d7 91% 100%)' }}><div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white"><strong className="text-xl">18,4M</strong><span className="text-[10px] text-[#819087]">FCFA</span></div></div>
          <div className="mt-7 grid grid-cols-2 gap-3 text-[10px]">{[['#83b84d', 'Envois', '48%'], ['#efad59', 'Dépôts', '25%'], ['#78a5bf', 'Retraits', '18%'], ['#d9e3d7', 'Autres', '9%']].map(([color, label, value]) => <div key={label} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /><span className="text-[#718078]">{label}</span><strong className="ml-auto">{value}</strong></div>)}</div>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-[#dfe6df] bg-white">
        <div className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-4"><div><h3 className="text-sm font-semibold">Activité récente</h3><p className="mt-1 text-[11px] text-[#819087]">Dernières opérations enregistrées</p></div><Link href="/admin/transactions" className="flex items-center gap-1 text-[11px] font-semibold text-[#6e9b3d] hover:text-[#4e812c]">Voir tout <ChevronRight className="h-3.5 w-3.5" /></Link></div>
         <div className="divide-y divide-[#edf0ed]">{recent.length === 0 ? <div className="px-5 py-12 text-center text-xs text-[#819087]">Aucune activité enregistrée pour le moment.</div> : recent.map((item, index) => <div key={item.id} className="flex items-center gap-3 px-5 py-3.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf6e7] text-[#61943a]"><ArrowUpFromLine className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{item.recipient}</p><p className="text-[10px] text-[#819087]">{item.network}</p></div><div className="text-right"><p className="text-xs font-semibold">{formatNumber(item.amountFcfa)} FCFA</p><p className="text-[10px] text-[#819087]">{new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p></div><CheckCircle2 className="h-4 w-4 text-[#82b64e]" /></div>)}</div>
      </div>
    </>
  );
}

function UsersView({ users: sourceUsers, loading }: { users: AdminUser[]; loading: boolean }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous les statuts');
  const [users, setUsers] = useState<DemoUser[]>([]);
  useEffect(() => {
    setUsers(sourceUsers.map((user) => ({
      id: user.id,
      name: user.fullName,
      email: user.email,
      country: user.country,
      joined: new Date(user.joinedAt).toLocaleDateString('fr-FR'),
      volume: '—',
      status: user.verified ? 'Actif' : 'En attente',
      avatar: user.avatar,
    })));
  }, [sourceUsers]);
  const filtered = useMemo(() => users.filter((user) => (`${user.name} ${user.email} ${user.country}`).toLowerCase().includes(search.toLowerCase()) && (filter === 'Tous les statuts' || user.status === filter)), [users, search, filter]);
  return <><SectionHeading eyebrow="Exploitation · Données Supabase" title="Utilisateurs" description="Consultez les comptes, leur activité et leur statut de vérification." /><Toolbar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} filterOptions={['Tous les statuts', 'Actif', 'En attente', 'Suspendu']} onExport={() => window.alert('Export des utilisateurs prêt.')} /><DataTable headers={['Utilisateur', 'Pays', 'Inscription', 'Volume traité', 'Statut', '']}>{loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-xs text-[#819087]">Chargement des utilisateurs…</td></tr> : filtered.map((user) => <tr key={user.id} className="text-xs hover:bg-[#fbfcfb]"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#dcebd2] text-[10px] font-bold text-[#41602b]">{user.avatar ? <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" /> : user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><p className="font-semibold">{user.name}</p><p className="mt-0.5 text-[10px] text-[#819087]">{user.email}</p></div></div></td><td className="px-5 py-4 text-[#66756b]">{user.country}</td><td className="px-5 py-4 text-[#66756b]">{user.joined}</td><td className="px-5 py-4 font-semibold">{user.volume}</td><td className="px-5 py-4"><StatusPill status={user.status} /></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: item.status === 'Suspendu' ? 'Actif' : 'Suspendu' } : item))} className="rounded-lg p-2 text-[#9aa79e] hover:bg-[#edf6e7] hover:text-[#4e812c]" title="Changer le statut"><MoreHorizontal className="h-4 w-4" /></button></td></tr>)}</DataTable>{!loading && filtered.length === 0 && <div className="rounded-b-2xl border border-t-0 border-[#dfe6df] bg-white p-10 text-center text-xs text-[#819087]">Aucun utilisateur ne correspond à votre recherche.</div>}</>;
}

function KycView({ submissions, loading }: { submissions: AdminKyc[]; loading: boolean }) {
  const [rows, setRows] = useState<AdminKyc[]>([]);
  const [filter, setFilter] = useState('Toutes');
  useEffect(() => setRows(submissions), [submissions]);
  const filterStatus = filter === 'En attente' ? 'pending' : filter === 'Approuvées' ? 'approved' : filter === 'Refusées' ? 'rejected' : null;
  const filtered = rows.filter((row) => !filterStatus || row.status === filterStatus);
  return <><SectionHeading eyebrow="Exploitation · Données Supabase" title="Vérifications KYC" description="Examinez les demandes d’identité et maintenez une file de revue claire." /><div className="mb-5 grid gap-3 sm:grid-cols-3"><StatCard label="À examiner" value={String(rows.filter((row) => row.status === 'pending').length)} detail="Demandes en attente" icon={Clock3} accent="orange" /><StatCard label="Approuvées" value={String(rows.filter((row) => row.status === 'approved').length)} detail="Dossiers validés" icon={BadgeCheck} /><StatCard label="Dossiers reçus" value={String(rows.length)} detail="Toutes les demandes" icon={RefreshCw} accent="blue" /></div><Toolbar search="" setSearch={() => undefined} filter={filter} setFilter={setFilter} filterOptions={['Toutes', 'En attente', 'Approuvées', 'Refusées']} /><DataTable headers={['Référence', 'Demandeur', 'Document', 'Pays', 'Soumis le', 'Statut', 'Action']}>{loading ? <tr><td colSpan={7} className="px-5 py-12 text-center text-xs text-[#819087]">Chargement des dossiers KYC…</td></tr> : filtered.map((row) => { const status = row.status === 'pending' ? 'En attente' : row.status === 'approved' ? 'Approuvé' : 'Refusé'; return <tr key={row.id} className="text-xs"><td className="px-5 py-4 font-mono text-[10px] text-[#819087]">{row.id}</td><td className="px-5 py-4 font-semibold">{row.name}<span className="mt-1 block text-[10px] font-normal text-[#819087]">{row.email}</span></td><td className="px-5 py-4 text-[#66756b]">Dossier identité</td><td className="px-5 py-4 text-[#66756b]">{row.country}</td><td className="px-5 py-4 text-[#66756b]">{new Date(row.submittedAt).toLocaleString('fr-FR')}</td><td className="px-5 py-4"><StatusPill status={status} /></td><td className="px-5 py-4"><div className="flex gap-1">{row.status === 'pending' && <><button type="button" onClick={() => void updateKyc(row.id, 'approved', setRows)} className="rounded-lg bg-[#e7f5dc] p-2 text-[#4e812c]" title="Approuver"><Check className="h-3.5 w-3.5" /></button><button type="button" onClick={() => void updateKyc(row.id, 'rejected', setRows)} className="rounded-lg bg-[#fbe6e5] p-2 text-[#b74c47]" title="Refuser"><X className="h-3.5 w-3.5" /></button></>}<button type="button" className="rounded-lg p-2 text-[#9aa79e] hover:bg-[#f0f5ee]" title="Ouvrir le dossier"><FileText className="h-3.5 w-3.5" /></button></div></td></tr>; })}</DataTable></>;
}

async function updateKyc(id: string, status: 'approved' | 'rejected', setRows: React.Dispatch<React.SetStateAction<AdminKyc[]>>) {
  await apiFetch(`/admin/kyc/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  setRows((current) => current.map((row) => row.id === id ? { ...row, status } : row));
}

function TransactionsView({ defaultTab, transactions: sourceTransactions }: { defaultTab: string; transactions: AdminTransaction[] }) {
  const [location, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous les statuts');
  const currentTab = defaultTab || location.split('/').pop() || 'transactions';
  const rows = sourceTransactions.map((row) => ({ id: row.id, kind: 'Envoi', customer: row.customer, channel: `${row.network} · ${row.cryptoCurrency}`, amount: `${formatNumber(row.amountFcfa)} FCFA`, status: row.status === 'completed' ? 'Approuvé' as Status : row.status === 'pending' ? 'En attente' as Status : 'Refusé' as Status, time: new Date(row.createdAt).toLocaleString('fr-FR') })).filter((row) => (currentTab === 'transactions' || currentTab === 'envois' || currentTab === 'depots' || currentTab === 'retraits' ? (currentTab === 'envois' || currentTab === 'transactions') : false)).filter((row) => `${row.id} ${row.customer} ${row.channel}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'Tous les statuts' || row.status === filter));
  const tabs = [{ href: '/admin/transactions', label: 'Toutes' }, { href: '/admin/transactions/depots', label: 'Dépôts' }, { href: '/admin/transactions/retraits', label: 'Retraits' }, { href: '/admin/transactions/envois', label: 'Envois' }];
  return <><SectionHeading eyebrow="Exploitation · Données de suivi local" title="Transactions" description="Suivez les mouvements de valeur et identifiez rapidement les opérations à traiter." action={<button type="button" onClick={() => window.alert('Export prêt à être connecté à l’endpoint administrateur.')} className="inline-flex items-center gap-2 rounded-xl border border-[#dfe6df] bg-white px-4 py-2.5 text-xs font-semibold"><Download className="h-3.5 w-3.5" /> Exporter CSV</button>} /><div className="mb-5 flex gap-1 overflow-x-auto border-b border-[#dfe6df]">{tabs.map((tab) => <button type="button" key={tab.href} onClick={() => navigate(tab.href)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-semibold ${location === tab.href ? 'border-[#83b84d] text-[#4e812c]' : 'border-transparent text-[#819087] hover:text-[#17211c]'}`}>{tab.label}</button>)}</div><Toolbar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} filterOptions={['Tous les statuts', 'Approuvé', 'En attente', 'Refusé']} /><DataTable headers={['Référence', 'Client', 'Canal', 'Montant', 'Date', 'Statut', '']}>{rows.map((row) => <tr key={row.id} className="text-xs hover:bg-[#fbfcfb]"><td className="px-5 py-4 font-mono text-[10px] text-[#819087]">{row.id}</td><td className="px-5 py-4 font-semibold">{row.customer}</td><td className="px-5 py-4 text-[#66756b]">{row.channel}</td><td className="px-5 py-4 font-semibold">{row.amount}</td><td className="px-5 py-4 text-[#66756b]">{row.time}</td><td className="px-5 py-4"><StatusPill status={row.status} /></td><td className="px-5 py-4 text-right"><button type="button" className="rounded-lg p-2 text-[#9aa79e] hover:bg-[#f0f5ee]" title="Voir le détail"><ChevronRight className="h-4 w-4" /></button></td></tr>)}</DataTable></>;
}

function ConfigurationView({ type }: { type: string }) {
  const config: Record<string, { title: string; description: string; icon: React.ElementType }> = {
    frais: { title: 'Frais', description: 'Définissez les règles de frais appliquées aux opérations SwiftPay.', icon: CircleDollarSign },
    conversions: { title: 'Conversions', description: 'Supervisez les taux de conversion et leur source de marché.', icon: RefreshCw },
    'pays-operateurs': { title: 'Pays & opérateurs', description: 'Gérez les corridors et les réseaux mobile money disponibles.', icon: Globe2 },
    afribapay: { title: 'AfribaPay', description: 'Connectez et surveillez la configuration du partenaire de paiement.', icon: ShieldAlert },
    authenticator: { title: 'Authenticator', description: 'Renforcez les accès administrateurs avec une politique 2FA claire.', icon: KeyRound },
  };
  const current = config[type] || config.frais;
  const [enabled, setEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [rate, setRate] = useState('655');
  const Icon = current.icon;
  return <><SectionHeading eyebrow="Configuration · Paramètres locaux" title={current.title} description={current.description} action={<span className="inline-flex items-center gap-2 rounded-full bg-[#fff1dc] px-3 py-2 text-[10px] font-semibold text-[#a96823]"><span className="h-1.5 w-1.5 rounded-full bg-[#e7a04e]" /> Données de configuration locale</span>} /><div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]"><div className="rounded-2xl border border-[#dfe6df] bg-white p-5 md:p-7"><div className="mb-7 flex items-center gap-3 border-b border-[#edf0ed] pb-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf6e7] text-[#61943a]"><Icon className="h-5 w-5" /></span><div><h3 className="text-sm font-semibold">Paramètres actifs</h3><p className="mt-1 text-[11px] text-[#819087]">Les changements sont enregistrés dans cette session.</p></div></div>{type === 'frais' && <div className="space-y-5"><label className="block"><span className="mb-2 block text-xs font-semibold">Frais d’envoi (%)</span><input defaultValue="1,50" className="h-11 w-full rounded-xl border border-[#dfe6df] px-3 text-sm outline-none focus:border-[#8fb85e]" /></label><label className="block"><span className="mb-2 block text-xs font-semibold">Frais minimum (FCFA)</span><input defaultValue="250" className="h-11 w-full rounded-xl border border-[#dfe6df] px-3 text-sm outline-none focus:border-[#8fb85e]" /></label></div>}{type === 'conversions' && <div className="space-y-5"><label className="block"><span className="mb-2 block text-xs font-semibold">Taux USDT / FCFA</span><div className="flex items-center gap-2"><input value={rate} onChange={(event) => setRate(event.target.value)} className="h-11 flex-1 rounded-xl border border-[#dfe6df] px-3 text-sm outline-none focus:border-[#8fb85e]" /><span className="text-xs text-[#819087]">FCFA</span></div></label><label className="flex items-center justify-between rounded-xl bg-[#f7faf6] p-4"><span><span className="block text-xs font-semibold">Mise à jour automatique</span><span className="mt-1 block text-[10px] text-[#819087]">Synchroniser toutes les 15 minutes</span></span><button type="button" onClick={() => setEnabled((value) => !value)} className="text-[#6f9f3c]">{enabled ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-[#a1aca4]" />}</button></label></div>}{type === 'authenticator' && <div className="space-y-4"><div className="rounded-xl border border-[#d7e8c6] bg-[#edf8e3] p-4 text-xs leading-5 text-[#50733a]">La double authentification est recommandée pour tous les profils ayant accès aux opérations financières.</div>{['Exiger la 2FA pour les administrateurs', 'Bloquer après 5 tentatives', 'Notifier les nouvelles connexions'].map((label, index) => <label key={label} className="flex items-center justify-between border-b border-[#edf0ed] py-3 last:border-0"><span className="text-xs font-medium">{label}</span><button type="button" onClick={() => setEnabled((value) => !value)} className="text-[#6f9f3c]">{enabled || index === 0 ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-[#a1aca4]" />}</button></label>)}</div>}{(type === 'pays-operateurs' || type === 'afribapay') && <div className="space-y-3">{(type === 'pays-operateurs' ? ['Sénégal · Wave', 'Côte d’Ivoire · MTN Mobile Money', 'Mali · Orange Money', 'Cameroun · MTN Mobile Money'] : ['Clé API de production', 'URL de callback', 'Mode de règlement']).map((label, index) => <div key={label} className="flex items-center justify-between rounded-xl border border-[#edf0ed] p-4"><div><p className="text-xs font-semibold">{label}</p><p className="mt-1 text-[10px] text-[#819087]">{index === 0 && type === 'afribapay' ? '••••••••••••••••' : index === 1 && type === 'afribapay' ? 'https://api.swiftpay.example/callback' : 'Actif et vérifié'}</p></div><button type="button" className="rounded-lg border border-[#dfe6df] p-2 text-[#819087] hover:bg-[#f0f5ee]"><Pencil className="h-3.5 w-3.5" /></button></div>)}</div>}<div className="mt-8 flex items-center justify-end gap-3 border-t border-[#edf0ed] pt-5"><span className={`text-[11px] text-[#61943a] transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}>Paramètres enregistrés</span><button type="button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2400); }} className="rounded-xl bg-[#17211c] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#29382f]">Enregistrer</button></div></div><div className="rounded-2xl border border-[#dfe6df] bg-[#eef6e8] p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#6e9b3d]"><ShieldAlert className="h-5 w-5" /></div><h3 className="mt-5 text-lg font-semibold">À propos de cette section</h3><p className="mt-2 text-xs leading-5 text-[#668061]">Cette interface prépare les contrôles administrateurs. Les endpoints dédiés pourront remplacer les valeurs locales sans modifier les parcours opérateurs existants.</p><div className="mt-7 border-t border-[#d3e6c9] pt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#75966a]">Dernière synchronisation</div><p className="mt-2 text-xs text-[#55744c]">Aujourd’hui à 09:45 · session locale</p></div></div></>;
}

function PendingView() {
  const [rows, setRows] = useState(demoTransfers.filter((row) => row.status === 'En attente'));
  return <><SectionHeading eyebrow="Exploitation · Données de suivi local" title="Paiements en attente" description="Une file de travail courte pour traiter les opérations qui nécessitent une intervention." /><div className="mb-5 rounded-2xl border border-[#f2dcb8] bg-[#fff8ea] p-4 text-xs text-[#93642f]"><strong>37 opérations</strong> sont actuellement en attente. Les actions ci-dessous mettent à jour la file locale de démonstration.</div><div className="grid gap-4 sm:grid-cols-2">{rows.map((row) => <div key={row.id} className="rounded-2xl border border-[#dfe6df] bg-white p-5"><div className="flex items-start justify-between"><div><span className="rounded-full bg-[#fff1dc] px-2 py-1 text-[10px] font-semibold text-[#a96823]">{row.kind}</span><h3 className="mt-3 text-sm font-semibold">{row.customer}</h3><p className="mt-1 text-[11px] text-[#819087]">{row.channel} · {row.id}</p></div><p className="text-sm font-semibold">{row.amount}</p></div><div className="mt-5 flex items-center justify-between border-t border-[#edf0ed] pt-4"><span className="text-[10px] text-[#819087]">{row.time}</span><button type="button" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} className="rounded-lg bg-[#e7f5dc] px-3 py-2 text-[10px] font-semibold text-[#4e812c]">Marquer traité</button></div></div>)}</div>{rows.length === 0 && <div className="rounded-2xl border border-dashed border-[#cfdcc9] bg-[#fbfdf9] p-12 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-[#80b64d]" /><p className="mt-3 text-sm font-semibold">File traitée</p><p className="mt-1 text-xs text-[#819087]">Aucun paiement local ne nécessite votre attention.</p></div>}</>;
}

function WithdrawalNumbersView() {
  const [numbers, setNumbers] = useState([{ number: '+221 77 402 18 62', operator: 'Wave Sénégal', owner: 'Aminata Diop', status: 'Actif' }, { number: '+225 05 84 12 90 11', operator: 'MTN Côte d’Ivoire', owner: 'Nadia Kouassi', status: 'Actif' }, { number: '+223 76 44 20 08', operator: 'Orange Mali', owner: 'Moussa Traoré', status: 'Suspendu' }]);
  return <><SectionHeading eyebrow="Exploitation · Données de suivi local" title="Numéros de retrait" description="Contrôlez les numéros utilisés pour les sorties de fonds et leur opérateur." action={<button type="button" onClick={() => setNumbers((current) => [...current, { number: '+221 70 000 00 00', operator: 'Wave Sénégal', owner: 'Numéro local', status: 'Actif' }])} className="inline-flex items-center gap-2 rounded-xl bg-[#17211c] px-4 py-2.5 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" /> Ajouter un numéro</button>} /><DataTable headers={['Numéro', 'Opérateur', 'Titulaire', 'Ajouté le', 'Statut', '']}>{numbers.map((row, index) => <tr key={`${row.number}-${index}`} className="text-xs"><td className="px-5 py-4 font-mono text-[11px]">{row.number}</td><td className="px-5 py-4 text-[#66756b]">{row.operator}</td><td className="px-5 py-4 font-semibold">{row.owner}</td><td className="px-5 py-4 text-[#66756b]">24 juin 2025</td><td className="px-5 py-4"><StatusPill status={row.status as Status} /></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => setNumbers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, status: item.status === 'Actif' ? 'Suspendu' : 'Actif' } : item))} className="rounded-lg p-2 text-[#9aa79e] hover:bg-[#f0f5ee]" title="Changer le statut"><MoreHorizontal className="h-4 w-4" /></button></td></tr>)}</DataTable></>;
}

export default function AdminWorkspace() {
  const [location] = useLocation();
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<AdminTransaction[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [submissions, setSubmissions] = useState<AdminKyc[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiFetch<{ transactions: ApiTransaction[] }>('/transactions?period=mois'),
      apiFetch<AdminOverview>('/admin/overview'),
      apiFetch<{ users: AdminUser[] }>('/admin/users'),
      apiFetch<{ submissions: AdminKyc[] }>('/admin/kyc'),
      apiFetch<{ transactions: AdminTransaction[] }>('/admin/transactions'),
    ]).then(([activity, adminOverview, adminUsers, adminKyc, allTransactions]) => {
      if (!mounted) return;
      setTransactions(activity.transactions || []);
      setOverview(adminOverview);
      setUsers(adminUsers.users || []);
      setSubmissions(adminKyc.submissions || []);
      setAdminTransactions(allTransactions.transactions || []);
    }).catch(() => {
      if (!mounted) return;
      setTransactions([]);
      setOverview(null);
      setUsers([]);
      setSubmissions([]);
      setAdminTransactions([]);
    }).finally(() => { if (mounted) { setLoading(false); setAdminLoading(false); } });
    return () => { mounted = false; };
  }, []);

  const segment = location.split('/')[2] || '';
  const page = location.split('/')[3] || '';
  let content: React.ReactNode;
  if (loading && location === '/admin') content = <div className="admin-skeleton-grid">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-[#e5ece3]" />)}</div>;
  else if (location === '/admin') content = <DashboardView transactions={transactions} overview={overview} />;
  else if (segment === 'utilisateurs') content = <UsersView users={users} loading={adminLoading} />;
  else if (segment === 'kyc') content = <KycView submissions={submissions} loading={adminLoading} />;
  else if (segment === 'transactions') content = <TransactionsView defaultTab={page} transactions={adminTransactions} />;
  else if (segment === 'paiements-en-attente') content = <PendingView />;
  else if (segment === 'numeros-retrait') content = <WithdrawalNumbersView />;
  else content = <ConfigurationView type={segment} />;
  return <AdminLayout>{content}</AdminLayout>;
}