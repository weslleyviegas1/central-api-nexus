import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Box,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Cloud,
  Code2,
  Gauge,
  Home,
  Link2,
  Menu,
  MoreHorizontal,
  Network,
  Plus,
  Power,
  Settings,
  SlidersHorizontal,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Central API Hub | Conexões do Ecossistema" },
      { name: "description", content: "Visualize, conecte e gerencie seus aplicativos e APIs em um único painel." },
      { property: "og:title", content: "Central API Hub | Conexões do Ecossistema" },
      { property: "og:description", content: "Visualize, conecte e gerencie seus aplicativos e APIs em um único painel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type AppId = "fluxo" | "agenda" | "saas1" | "saas2" | "saas3";
type Position = { x: number; y: number };
type AppData = {
  id: AppId;
  name: string;
  appId: string;
  status: "Conectado" | "Desconectado" | "Disponível";
  tone: "green" | "purple" | "blue" | "orange" | "pink";
  Icon: typeof Activity;
};

const apps: AppData[] = [
  { id: "fluxo", name: "Fluxo", appId: "app_fluxo_001", status: "Conectado", tone: "green", Icon: Activity },
  { id: "agenda", name: "Agenda", appId: "app_agenda_002", status: "Conectado", tone: "purple", Icon: CalendarDays },
  { id: "saas1", name: "SaaS 1", appId: "app_saas1_003", status: "Conectado", tone: "blue", Icon: Cloud },
  { id: "saas2", name: "SaaS 2", appId: "app_saas2_004", status: "Desconectado", tone: "orange", Icon: Box },
  { id: "saas3", name: "SaaS 3", appId: "app_saas3_005", status: "Disponível", tone: "pink", Icon: Activity },
];

const initialPositions: Record<AppId, Position> = {
  fluxo: { x: 19, y: 17 },
  agenda: { x: 69, y: 18 },
  saas1: { x: 18, y: 57 },
  saas2: { x: 72, y: 57 },
  saas3: { x: 46, y: 79 },
};

const navItems = [
  { label: "Dashboard", Icon: Home },
  { label: "Aplicações", Icon: Gauge },
  { label: "Integrações", Icon: Link2 },
  { label: "Eventos", Icon: Activity },
  { label: "Observabilidade", Icon: SlidersHorizontal },
  { label: "Configurações", Icon: Settings },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("brand-mark", compact && "brand-mark-compact")} aria-label="Central API Hub">
      <span />
      <span />
    </div>
  );
}

function AppGlyph({ app, small = false }: { app: AppData; small?: boolean }) {
  return (
    <span className={cn("app-glyph", `tone-${app.tone}`, small && "app-glyph-small")}>
      <app.Icon aria-hidden="true" />
    </span>
  );
}

function Sidebar({ selected, onSelect }: { selected: AppId; onSelect: (id: AppId) => void }) {
  return (
    <aside className="sidebar-shell">
      <nav className="primary-nav" aria-label="Navegação principal">
        {navItems.map(({ label, Icon }) => (
          <button className={cn("nav-button", label === "Aplicações" && "active")} key={label} type="button">
            <Icon aria-hidden="true" /> <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="available-title"><span>SaaS Disponíveis</span><span className="count-badge">5</span></div>
      <div className="sidebar-apps">
        {apps.map((app) => (
          <button className={cn("sidebar-app", selected === app.id && "selected")} key={app.id} onClick={() => onSelect(app.id)} type="button">
            <AppGlyph app={app} small />
            <span className="sidebar-app-copy"><strong>{app.name}</strong><small>{app.appId}</small></span>
            <MoreHorizontal aria-hidden="true" />
          </button>
        ))}
      </div>
      <Button className="api-manager" variant="outline"><Code2 /> <span>Gerenciar APIs</span><Plus /></Button>
    </aside>
  );
}

function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Navegação móvel">
      <Button size="icon" variant="ghost" aria-label="Abrir menu"><Menu /></Button>
      {navItems.slice(0, 4).map(({ label, Icon }) => (
        <button className={cn("mobile-nav-item", label === "Aplicações" && "active")} type="button" key={label}>
          <Icon /> <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function ConnectionLines({ positions, enabled }: { positions: Record<AppId, Position>; enabled: Record<AppId, boolean> }) {
  return (
    <svg className="connections" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
      {apps.map((app) => {
        const p = positions[app.id];
        const x = p.x * 10 + 100;
        const y = p.y * 7 + 40;
        const cx = 500;
        const cy = 340;
        const bend = x < cx ? x + 120 : x - 120;
        return (
          <g key={app.id} className={cn(`line-${app.tone}`, !enabled[app.id] && "line-inactive")}>
            <path d={`M ${x} ${y} C ${bend} ${y}, ${bend} ${cy}, ${cx} ${cy}`} />
            {enabled[app.id] && <circle cx={(x + cx) / 2} cy={(y + cy) / 2} r="4" />}
          </g>
        );
      })}
    </svg>
  );
}

function EcosystemMap({ selected, onSelect, enabled, setEnabled }: {
  selected: AppId;
  onSelect: (id: AppId) => void;
  enabled: Record<AppId, boolean>;
  setEnabled: React.Dispatch<React.SetStateAction<Record<AppId, boolean>>>;
}) {
  const [positions, setPositions] = useState(initialPositions);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<AppId | null>(null);

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const id = dragging.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!id || !rect) return;
    setPositions((current) => ({
      ...current,
      [id]: {
        x: Math.max(1, Math.min(79, ((event.clientX - rect.left) / rect.width) * 100 - 10)),
        y: Math.max(3, Math.min(81, ((event.clientY - rect.top) / rect.height) * 100 - 7)),
      },
    }));
  };

  const release = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) event.currentTarget.releasePointerCapture(event.pointerId);
    dragging.current = null;
  };

  const clear = () => setEnabled({ fluxo: false, agenda: false, saas1: false, saas2: false, saas3: false });
  const connectedCount = Object.values(enabled).filter(Boolean).length;

  return (
    <section className="workspace-panel">
      <header className="workspace-header">
        <div><h1>Conexões do Ecossistema</h1><p>Arraste os aplicativos para o painel e conecte seus SaaS através da Central.</p></div>
        <div className="workspace-summary">
          <span><i className="status-light connected" />{connectedCount} conectados</span>
          <span><i className="status-light available" />{5 - connectedCount} disponíveis</span>
          <Button size="sm" onClick={clear}>Limpar painel</Button>
        </div>
      </header>
      <div
        ref={canvasRef}
        className="map-canvas"
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <div className="dot-grid" />
        <ConnectionLines positions={positions} enabled={enabled} />
        <div className="central-node"><span className="central-pulse" /><Logo compact /><strong>Central</strong><small>API Hub</small></div>
        {apps.map((app) => (
          <button
            type="button"
            key={app.id}
            className={cn("map-node", `node-${app.tone}`, selected === app.id && "selected")}
            style={{ left: `${positions[app.id].x}%`, top: `${positions[app.id].y}%` }}
            onPointerDown={(event) => {
              dragging.current = app.id;
              event.currentTarget.setPointerCapture(event.pointerId);
              onSelect(app.id);
            }}
            aria-label={`${app.name}, ${enabled[app.id] ? "conectado" : app.status.toLowerCase()}`}
          >
            <AppGlyph app={app} />
            <span className="map-node-copy"><strong>{app.name}</strong><small><i className={cn("status-light", enabled[app.id] ? "connected" : app.status === "Desconectado" ? "disconnected" : "available")} />{enabled[app.id] ? "Conectado" : app.status}</small></span>
            <MoreHorizontal className="map-node-menu" />
          </button>
        ))}
        <BottomPanels />
      </div>
    </section>
  );
}

function BottomPanels() {
  return (
    <div className="bottom-panels">
      <div className="api-config-card">
        <span className="config-icon"><Settings /></span>
        <span><strong>API / Integrações</strong><small>Adicione novos SaaS ao seu ecossistema</small></span>
        <Button variant="primary" size="sm"><Plus /> Configurar API</Button>
      </div>
      <div className="metrics-card">
        <div className="traffic"><span><i className="status-light connected" />Tráfego em tempo real</span><svg viewBox="0 0 210 40" preserveAspectRatio="none"><path d="M0 32 C14 34 15 12 30 21 S50 31 61 13 S78 27 91 15 S106 19 118 10 S133 16 143 8 S160 11 173 5 S194 7 210 1" /></svg></div>
        <Metric label="Requisições" value="24.893" change="↑ 12%" />
        <Metric label="Erros" value="0,12%" change="↓ 8%" bad />
        <Metric label="Latência média" value="142ms" change="↓ 15%" />
      </div>
    </div>
  );
}

function Metric({ label, value, change, bad = false }: { label: string; value: string; change: string; bad?: boolean }) {
  return <div className="metric"><small>{label}</small><strong>{value}</strong><span className={cn(bad && "bad")}>{change}</span></div>;
}

function DetailsPanel({ app, enabled, onToggle, onClose }: { app: AppData; enabled: boolean; onToggle: () => void; onClose: () => void }) {
  return (
    <aside className="details-panel">
      <div className="details-card">
        <header className="details-heading">
          <AppGlyph app={app} />
          <span><strong>{app.name}</strong><small>{app.appId}</small><em><i className={cn("status-light", enabled ? "connected" : "available")} />{enabled ? "Conectado" : "Disponível"}</em></span>
          <button className={cn("connection-switch", enabled && "on")} onClick={onToggle} type="button" aria-label={enabled ? "Desconectar aplicação" : "Conectar aplicação"}><span /></button>
          <Button className="mobile-details-close" size="icon" variant="ghost" onClick={onClose} aria-label="Fechar detalhes"><X /></Button>
        </header>
        <section className="detail-section">
          <h2>Conexões ativas</h2>
          {apps.slice(0, 3).map((target, index) => (
            <div className="connection-row" key={target.id}>
              <i className={cn("status-light", index < 2 && enabled ? "connected" : "available")} />
              <span>{app.name} → Central → {target.name}<small>{index < 2 && enabled ? "Ativa" : "Desativada"}</small></span>
              <button className={cn("mini-switch", index < 2 && enabled && "on")} type="button"><span /></button>
            </div>
          ))}
          <Button className="full-button" size="sm">Gerenciar conexões</Button>
        </section>
        <section className="detail-section actions-section">
          <h2><ChevronDown /> Ações</h2>
          <Button variant="danger"><Trash2 /> Remover</Button>
          <Button variant="primary"><Link2 /> Gerar conexão</Button>
          <Button className="warning-button"><Power /> Desligar conexão</Button>
        </section>
        <section className="detail-section detail-table">
          <h2>Detalhes da aplicação</h2>
          <dl>
            <div><dt>Nome</dt><dd>{app.name}</dd></div>
            <div><dt>Application ID</dt><dd>{app.appId}</dd></div>
            <div><dt>Ambiente</dt><dd className="positive">● Produção</dd></div>
            <div><dt>Versão da API</dt><dd>v1</dd></div>
            <div><dt>Base URL</dt><dd>https://api.{app.name.toLowerCase().replace(" ", "")}.com/v1</dd></div>
            <div><dt>Status da API</dt><dd className="positive">● Operacional</dd></div>
          </dl>
          <Button className="full-button" size="sm">Ver mais detalhes</Button>
        </section>
      </div>
    </aside>
  );
}

function MobileApps({ selected, onSelect }: { selected: AppId; onSelect: (id: AppId) => void }) {
  return (
    <section className="mobile-app-list">
      <header><span>SaaS Disponíveis <b>5</b></span><button type="button">Ver todos</button></header>
      {apps.slice(0, 4).map((app) => (
        <button className={cn("mobile-app-row", selected === app.id && "selected")} key={app.id} onClick={() => onSelect(app.id)} type="button">
          <AppGlyph app={app} small /><span><strong>{app.name}</strong><small>{app.appId}</small></span><ChevronRight />
        </button>
      ))}
      <Button className="floating-add" variant="primary" size="icon" aria-label="Adicionar SaaS"><Plus /></Button>
    </section>
  );
}

function Index() {
  const [selected, setSelected] = useState<AppId>("fluxo");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [enabled, setEnabled] = useState<Record<AppId, boolean>>({ fluxo: true, agenda: true, saas1: true, saas2: false, saas3: false });
  const selectedApp = useMemo(() => apps.find((app) => app.id === selected) ?? apps[0], [selected]);
  const choose = (id: AppId) => { setSelected(id); if (window.matchMedia("(max-width: 760px)").matches) setDetailsOpen(true); };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><Logo /><span><strong>Central API Hub</strong><small><i className="status-light connected" />Online</small></span></div>
        <div className="top-actions"><Button variant="ghost" size="icon" aria-label="Notificações"><Bell /></Button><span className="divider" /><CircleUserRound className="avatar" /><span className="profile-copy"><strong>Administrador</strong><small>admin@seuprojeto.com</small></span><ChevronDown className="profile-chevron" /></div>
      </header>
      <MobileNav />
      <Sidebar selected={selected} onSelect={choose} />
      <div className="main-area">
        <EcosystemMap selected={selected} onSelect={choose} enabled={enabled} setEnabled={setEnabled} />
        <MobileApps selected={selected} onSelect={choose} />
      </div>
      <div className={cn("details-wrap", detailsOpen && "open")}>
        <DetailsPanel app={selectedApp} enabled={enabled[selected]} onToggle={() => setEnabled((current) => ({ ...current, [selected]: !current[selected] }))} onClose={() => setDetailsOpen(false)} />
      </div>
    </main>
  );
}
