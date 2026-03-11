import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  Key, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  Menu, 
  X, 
  Phone, 
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Clock,
  LayoutDashboard,
  Home
} from 'lucide-react';

// Types
import { Space, Request, Stats } from './types';

// Push Notification Helpers
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const subscribeToPush = async (userType: 'driver' | 'owner', neighborhood?: string) => {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const response = await fetch('/api/vapid-public-key');
    const { publicKey } = await response.json();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        user_type: userType,
        neighborhood
      })
    });
    return true;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return false;
  }
};

// Components
const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-zinc-900 p-1.5 rounded-lg">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-zinc-900">VAGA013</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('home')}
            className={`text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Início
          </button>
          <button 
            onClick={() => setActiveTab('motorista')}
            className={`text-sm font-medium transition-colors ${activeTab === 'motorista' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Para Motoristas
          </button>
          <button 
            onClick={() => setActiveTab('proprietario')}
            className={`text-sm font-medium transition-colors ${activeTab === 'proprietario' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Para Proprietários
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>
          <a 
            href="https://wa.me/5513999999999" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-5 py-2 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            WhatsApp
          </a>
        </div>

        <div className="md:hidden">
          <Menu className="w-6 h-6 text-zinc-900" />
        </div>
      </div>
    </div>
  </nav>
);

const Hero = ({ onStart }: { onStart: (role: 'driver' | 'owner') => void }) => (
  <section className="pt-32 pb-20 px-4">
    <div className="max-w-7xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase bg-zinc-100 text-zinc-600 rounded-full">
          Santos & Baixada Santista
        </span>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 mb-8 leading-[1.1]">
          Sua vaga de garagem <br />
          <span className="text-zinc-400">agora é renda extra.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-zinc-500 mb-12">
          Conectamos proprietários de vagas ociosas com motoristas que precisam estacionar. 
          Seguro, prático e até 40% mais barato que estacionamentos convencionais.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => onStart('driver')}
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all group"
          >
            Quero Estacionar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onStart('owner')}
            className="w-full sm:w-auto px-8 py-4 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-semibold hover:bg-zinc-50 transition-all"
          >
            Tenho uma Vaga
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-20 relative rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl aspect-[21/9]"
      >
        <img 
          src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=2000" 
          alt="Parking in Santos" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 to-transparent" />
      </motion.div>
    </div>
  </section>
);

const StatsSection = () => (
  <section className="py-20 bg-zinc-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Economia para Motoristas', value: 'Até 40%', icon: DollarSign },
          { label: 'Renda para Proprietários', value: 'Até R$ 800/mês', icon: TrendingUp },
          { label: 'Segurança Garantida', value: '100% Verificado', icon: ShieldCheck },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
            <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
              <stat.icon className="w-6 h-6 text-zinc-900" />
            </div>
            <div className="text-3xl font-bold text-zinc-900 mb-2">{stat.value}</div>
            <div className="text-zinc-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const DriverForm = ({ onBack }: { onBack: () => void }) => {
  const [formData, setFormData] = useState({
    driver_name: '',
    driver_phone: '',
    neighborhood: 'Gonzaga',
    period: 'Mensal'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Request notification permission and subscribe
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await subscribeToPush('driver', formData.neighborhood);
      }
    }

    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Pedido Recebido!</h2>
        <p className="text-zinc-500 mb-8">Entraremos em contato via WhatsApp em breve para confirmar as vagas disponíveis no {formData.neighborhood}.</p>
        <button onClick={onBack} className="text-zinc-900 font-semibold underline">Voltar ao início</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-20 px-4">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 mb-8 hover:text-zinc-900 transition-colors">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Voltar
      </button>
      <h2 className="text-4xl font-bold mb-4">Encontre sua vaga</h2>
      <p className="text-zinc-500 mb-10">Diga-nos onde você precisa estacionar e nós cuidamos do resto.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Seu Nome</label>
          <input 
            required
            type="text" 
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
            placeholder="Ex: João Silva"
            value={formData.driver_name}
            onChange={e => setFormData({...formData, driver_name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">WhatsApp</label>
          <input 
            required
            type="tel" 
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
            placeholder="(13) 99999-9999"
            value={formData.driver_phone}
            onChange={e => setFormData({...formData, driver_phone: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Bairro</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              value={formData.neighborhood}
              onChange={e => setFormData({...formData, neighborhood: e.target.value})}
            >
              <option>Gonzaga</option>
              <option>Boqueirão</option>
              <option>Ponta da Praia</option>
              <option>Embaré</option>
              <option>Centro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Período</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              value={formData.period}
              onChange={e => setFormData({...formData, period: e.target.value})}
            >
              <option>Diária</option>
              <option>Mensal (Seg-Sex)</option>
              <option>Mensal Integral</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all">
          Solicitar Vaga
        </button>
      </form>
    </div>
  );
};

const OwnerForm = ({ onBack }: { onBack: () => void }) => {
  const [formData, setFormData] = useState({
    owner_name: '',
    owner_phone: '',
    address: '',
    neighborhood: 'Gonzaga',
    price_daily: 20,
    price_monthly: 350,
    rules: '',
    is_covered: true,
    num_spaces: 1,
    vehicle_type: 'médio' as 'pequeno' | 'médio' | 'grande'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Request notification permission and subscribe
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await subscribeToPush('owner');
      }
    }

    const res = await fetch('/api/spaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Vaga Cadastrada!</h2>
        <p className="text-zinc-500 mb-8">Nossa equipe entrará em contato para validar os detalhes e começar a oferecer sua vaga para motoristas.</p>
        <button onClick={onBack} className="text-zinc-900 font-semibold underline">Voltar ao início</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-20 px-4">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 mb-8 hover:text-zinc-900 transition-colors">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Voltar
      </button>
      <h2 className="text-4xl font-bold mb-4">Rentabilize sua vaga</h2>
      <p className="text-zinc-500 mb-10">Cadastre seu espaço e comece a gerar renda passiva ainda hoje.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Seu Nome</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              placeholder="Ex: Maria Oliveira"
              value={formData.owner_name}
              onChange={e => setFormData({...formData, owner_name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">WhatsApp</label>
            <input 
              required
              type="tel" 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              placeholder="(13) 99999-9999"
              value={formData.owner_phone}
              onChange={e => setFormData({...formData, owner_phone: e.target.value})}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Endereço Completo</label>
          <input 
            required
            type="text" 
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
            placeholder="Rua, Número, Edifício"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Bairro</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              value={formData.neighborhood}
              onChange={e => setFormData({...formData, neighborhood: e.target.value})}
            >
              <option>Gonzaga</option>
              <option>Boqueirão</option>
              <option>Ponta da Praia</option>
              <option>Embaré</option>
              <option>Centro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Tipo de Vaga</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              value={formData.is_covered ? 'coberta' : 'descoberta'}
              onChange={e => setFormData({...formData, is_covered: e.target.value === 'coberta'})}
            >
              <option value="coberta">Coberta</option>
              <option value="descoberta">Descoberta</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Quantidade de Vagas</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              value={formData.num_spaces}
              onChange={e => setFormData({...formData, num_spaces: Number(e.target.value)})}
            >
              <option value={1}>1 Vaga</option>
              <option value={2}>2 Vagas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Tamanho do Automóvel</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              value={formData.vehicle_type}
              onChange={e => setFormData({...formData, vehicle_type: e.target.value as any})}
            >
              <option value="pequeno">Pequeno</option>
              <option value="médio">Médio</option>
              <option value="grande">Grande</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Preço Diário Sugerido (R$)</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              value={formData.price_daily}
              onChange={e => setFormData({...formData, price_daily: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Preço Mensal Sugerido (R$)</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              value={formData.price_monthly}
              onChange={e => setFormData({...formData, price_monthly: Number(e.target.value)})}
            />
          </div>
        </div>
        <button type="submit" className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all">
          Cadastrar Minha Vaga
        </button>
      </form>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [filters, setFilters] = useState({
    neighborhood: '',
    status: '',
    is_covered: '',
    num_spaces: '',
    vehicle_type: '',
    date: ''
  });

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats);
    fetch('/api/spaces').then(r => r.json()).then(data => {
      const formattedSpaces = data.map((s: any) => ({
        ...s,
        is_covered: !!s.is_covered
      }));
      setSpaces(formattedSpaces);
    });
    fetch('/api/requests').then(r => r.json()).then(setRequests);
  }, []);

  const handleCompleteTransaction = async (spaceId: number, amount: number) => {
    const commission = amount * 0.25;
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ space_id: spaceId, driver_name: 'Demo Driver', amount, commission })
    });
    // Refresh stats
    fetch('/api/stats').then(r => r.json()).then(setStats);
  };

  const filteredSpaces = spaces.filter(space => {
    if (filters.neighborhood && space.neighborhood !== filters.neighborhood) return false;
    if (filters.status && space.status !== filters.status) return false;
    if (filters.is_covered !== '') {
      const covered = filters.is_covered === 'true';
      if (space.is_covered !== covered) return false;
    }
    if (filters.num_spaces && space.num_spaces !== Number(filters.num_spaces)) return false;
    if (filters.vehicle_type && space.vehicle_type !== filters.vehicle_type) return false;
    if (filters.date) {
      const spaceDate = new Date(space.created_at).toISOString().split('T')[0];
      if (spaceDate !== filters.date) return false;
    }
    return true;
  });

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Painel VAGA013</h2>
          <p className="text-zinc-500">Gestão operacional da Baixada Santista</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900 text-white px-6 py-3 rounded-2xl">
            <div className="text-xs opacity-60 uppercase font-bold tracking-wider mb-1">Receita (Comissões)</div>
            <div className="text-xl font-bold">R$ {stats?.revenue.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200 mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Menu className="w-5 h-5 text-zinc-900" />
          <h3 className="font-bold">Filtros de Vagas</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <select 
            className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            value={filters.neighborhood}
            onChange={e => setFilters({...filters, neighborhood: e.target.value})}
          >
            <option value="">Todos os Bairros</option>
            <option>Gonzaga</option>
            <option>Boqueirão</option>
            <option>Ponta da Praia</option>
            <option>Embaré</option>
            <option>Centro</option>
          </select>
          <select 
            className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value})}
          >
            <option value="">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
          </select>
          <select 
            className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            value={filters.is_covered}
            onChange={e => setFilters({...filters, is_covered: e.target.value})}
          >
            <option value="">Tipo de Vaga</option>
            <option value="true">Coberta</option>
            <option value="false">Descoberta</option>
          </select>
          <select 
            className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            value={filters.num_spaces}
            onChange={e => setFilters({...filters, num_spaces: e.target.value})}
          >
            <option value="">Qtd Vagas</option>
            <option value="1">1 Vaga</option>
            <option value="2">2 Vagas</option>
          </select>
          <select 
            className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            value={filters.vehicle_type}
            onChange={e => setFilters({...filters, vehicle_type: e.target.value})}
          >
            <option value="">Tamanho Carro</option>
            <option value="pequeno">Pequeno</option>
            <option value="médio">Médio</option>
            <option value="grande">Grande</option>
          </select>
          <input 
            type="date" 
            className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            value={filters.date}
            onChange={e => setFilters({...filters, date: e.target.value})}
          />
        </div>
        {(filters.neighborhood || filters.status || filters.is_covered !== '' || filters.num_spaces || filters.vehicle_type || filters.date) && (
          <button 
            onClick={() => setFilters({ neighborhood: '', status: '', is_covered: '', num_spaces: '', vehicle_type: '', date: '' })}
            className="mt-4 text-xs font-bold text-zinc-500 hover:text-zinc-900 underline"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Home className="w-5 h-5" />
              Vagas Cadastradas ({filteredSpaces.length})
            </h3>
          </div>
          <div className="space-y-4">
            {filteredSpaces.map(space => (
              <div key={space.id} className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-bold text-lg">{space.address}</div>
                    <div className="text-zinc-500 text-sm">{space.neighborhood} • {space.is_covered ? 'Coberta' : 'Descoberta'}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    space.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {space.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <Phone className="w-4 h-4" />
                    {space.owner_phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <DollarSign className="w-4 h-4" />
                    R$ {space.price_monthly}/mês
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <Car className="w-4 h-4" />
                    {space.num_spaces} vaga(s) • {space.vehicle_type}
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <Clock className="w-4 h-4" />
                    {new Date(space.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-100 flex gap-2">
                  <button 
                    onClick={() => handleCompleteTransaction(space.id, 20)}
                    className="text-xs font-bold bg-zinc-100 px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    Simular Diária (R$ 20)
                  </button>
                  <button 
                    onClick={() => handleCompleteTransaction(space.id, 350)}
                    className="text-xs font-bold bg-zinc-100 px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    Simular Mensal (R$ 350)
                  </button>
                </div>
              </div>
            ))}
            {filteredSpaces.length === 0 && (
              <div className="py-12 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
                <p className="text-zinc-400">Nenhuma vaga encontrada com estes filtros.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Car className="w-5 h-5" />
              Solicitações ({requests.length})
            </h3>
          </div>
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-bold text-lg">{req.driver_name}</div>
                    <div className="text-zinc-500 text-sm">{req.neighborhood} • {req.period}</div>
                  </div>
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    {req.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600 text-sm">
                  <Phone className="w-4 h-4" />
                  {req.driver_phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onStart={(role) => setActiveTab(role === 'driver' ? 'motorista' : 'proprietario')} />
              <StatsSection />
              
              {/* Pricing Section */}
              <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold tracking-tight mb-4">Planos Flexíveis</h2>
                    <p className="text-zinc-500">Preços transparentes para motoristas e proprietários.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { title: 'Diária (8h)', price: 'R$ 20', detail: 'Ideal para trabalho' },
                      { title: 'Diária Premium', price: 'R$ 35', detail: 'Finais de semana' },
                      { title: 'Mensal (Seg-Sex)', price: 'R$ 350', detail: 'Recorrente comercial' },
                      { title: 'Mensal Integral', price: 'R$ 500', detail: '24/7 Garantido' },
                    ].map((plan, i) => (
                      <div key={i} className="p-8 border border-zinc-200 rounded-3xl hover:border-zinc-900 transition-all group">
                        <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">{plan.title}</div>
                        <div className="text-4xl font-bold mb-2">{plan.price}</div>
                        <div className="text-zinc-500 text-sm">{plan.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'motorista' && (
            <motion.div
              key="driver"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DriverForm onBack={() => setActiveTab('home')} />
            </motion.div>
          )}

          {activeTab === 'proprietario' && (
            <motion.div
              key="owner"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <OwnerForm onBack={() => setActiveTab('home')} />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 p-1 rounded">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tighter">VAGA013</span>
          </div>
          <div className="text-sm text-zinc-400">
            © 2026 VAGA013 Santos. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-zinc-900">Termos</a>
            <a href="#" className="hover:text-zinc-900">Privacidade</a>
            <a href="#" className="hover:text-zinc-900">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
