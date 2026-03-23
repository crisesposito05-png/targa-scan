
'use client';

import { useState } from 'react';

interface VehicleData {
  plate: string;
  marca: string;
  modello: string;
  allestimento: string;
  tipo: string;
  anno: number;
  cavalli: number;
  cilindrata: string;
  alim: string;
  classe: string;
  km: number;
  prezzoNuovoBase: number;
  bollo: { ok: boolean; sc: string };
  rev: { ok: boolean; sc: string };
  rca: { comp: string; sc: string; ok: boolean };
  nota: string;
}

const DEMO: Record<string, VehicleData> = {
  'FI123AB': {
    plate: 'FI123AB', marca: 'Fiat', modello: 'Panda', allestimento: '1.2 Easy',
    tipo: 'Autovettura', anno: 2015, cavalli: 69, cilindrata: '1242 cc',
    alim: 'Benzina', classe: 'Euro 5', km: 72000, prezzoNuovoBase: 13500,
    bollo: { ok: true, sc: '31/12/2025' },
    rev: { ok: true, sc: '12/05/2027' },
    rca: { comp: 'Generali', sc: '20/07/2026', ok: true },
    nota: 'Fiat Panda 1.2 benzina 2015, Euro 5. Tutto in regola. Ottima city car economica.',
  },
  'RM456CD': {
    plate: 'RM456CD', marca: 'Volkswagen', modello: 'Golf', allestimento: '2.0 TDI Comfortline',
    tipo: 'Autovettura', anno: 2019, cavalli: 150, cilindrata: '1968 cc',
    alim: 'Diesel', classe: 'Euro 6d', km: 58000, prezzoNuovoBase: 32000,
    bollo: { ok: false, sc: '31/12/2024' },
    rev: { ok: false, sc: '03/03/2025' },
    rca: { comp: 'UnipolSai', sc: '15/03/2026', ok: true },
    nota: "VW Golf 2.0 TDI 2019. Bollo scaduto e revisione da rinnovare. Verificare prima dell'acquisto.",
  },
  'MI789EF': {
    plate: 'MI789EF', marca: 'Toyota', modello: 'Yaris', allestimento: '1.5 Hybrid Active',
    tipo: 'Autovettura', anno: 2021, cavalli: 116, cilindrata: '1490 cc',
    alim: 'Ibrido', classe: 'Euro 6d-Final', km: 31000, prezzoNuovoBase: 25500,
    bollo: { ok: true, sc: '31/12/2025' },
    rev: { ok: true, sc: '07/07/2026' },
    rca: { comp: 'Allianz', sc: '30/06/2026', ok: true },
    nota: 'Toyota Yaris ibrida 2021, Euro 6d-Final. Tutto in regola. Risparmio carburante eccellente.',
  },
};

const PLATE_RE = /^[A-Z]{2}\d{3}[A-Z]{2}$/;

function fmtEur(n: number): string {
  return n.toLocaleString('it-IT') + ' €';
}

function calcPrezzi(d: VehicleData) {
  const eta = new Date().getFullYear() - d.anno;
  const alimFactor = d.alim.toLowerCase().includes('ibrido') ? 0.82
    : d.alim.toLowerCase().includes('elettr') ? 0.75 : 0.90;
  const deprBase = Math.pow(0.87, eta);
  const kmFactor = Math.max(0.70, 1 - (d.km / 200000) * 0.30);
  const pct = Math.min(Math.round((1 - deprBase * kmFactor * alimFactor) * 100), 85);
  const mid = Math.round(d.prezzoNuovoBase * deprBase * kmFactor * alimFactor / 500) * 500;
  return {
    listino: d.prezzoNuovoBase,
    usatoMin: Math.round(mid * 0.88 / 500) * 500,
    usatoMid: mid,
    usatoMax: Math.round(mid * 1.12 / 500) * 500,
    pct,
  };
}

export default function Home() {
  const [plate, setPlate] = useState('');
  const [result, setResult] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clean = plate.trim().toUpperCase().replace(/\s/g, '');
  const isValid = PLATE_RE.test(clean);

  async function doSearch(p: string) {
    if (!PLATE_RE.test(p)) return;
    setLoading(true);
    setError('');
    setResult(null);
    await new Promise(r => setTimeout(r, 900));
    if (DEMO[p]) {
      setResult(DEMO[p]);
    } else {
      setError('Targa "' + p + '" non trovata. Prova: FI123AB, RM456CD o MI789EF.');
    }
    setLoading(false);
  }

  const S = {
    page: { minHeight: '100vh', background: '#f8f9fb', fontFamily: 'system-ui,sans-serif', padding: '1.5rem 1rem 4rem' } as React.CSSProperties,
    wrap: { maxWidth: 680, margin: '0 auto' } as React.CSSProperties,
    center: { textAlign: 'center' as const, marginBottom: '1.5rem' },
    badge: { display: 'inline-block', background: '#dbeafe', borderRadius: 100, padding: '3px 12px', fontSize: 12, color: '#1d4ed8', marginBottom: 10 } as React.CSSProperties,
    h1: { fontSize: 'clamp(1.5rem,5vw,2rem)', fontWeight: 700, color: '#0f1923', margin: 0 } as React.CSSProperties,
    sub: { color: '#6b7280', marginTop: 6, fontSize: 14 } as React.CSSProperties,
    inputCard: { background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '1.25rem', marginBottom: '1rem' } as React.CSSProperties,
    row: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
    input: (ok: boolean) => ({
      flex: 1, minWidth: 150, height: 48, fontSize: 20, fontWeight: 700,
      letterSpacing: '0.14em', fontFamily: 'monospace',
      padding: '0 12px',
      border: '2px solid ' + (ok ? '#22c55e' : '#d1d5db'),
      borderRadius: 10, outline: 'none', background: '#f9fafb', color: '#0f1923',
    } as React.CSSProperties),
    btn: (dis: boolean) => ({
      height: 48, padding: '0 1.25rem', background: '#0f1923', color: '#fff',
      border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
      cursor: dis ? 'not-allowed' : 'pointer', opacity: dis ? 0.5 : 1,
    } as React.CSSProperties),
  };

  return (
    <main style={S.page}>
      <div style={S.wrap}>
        <div style={S.center}>
          <div style={S.badge}>Verifica veicolo + quotazione prezzi</div>
          <h1 style={S.h1}>Targa Scan Italia</h1>
          <p style={S.sub}>Dati tecnici, stato legale e stima del valore di mercato</p>
        </div>

        <div style={S.inputCard}>
          <div style={S.row}>
            <input
              value={plate}
              onChange={e => setPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}
              onKeyDown={e => { if (e.key === 'Enter') doSearch(clean); }}
              placeholder="AB123CD"
              maxLength={7}
              style={S.input(isValid && plate.length > 0)}
            />
            <button
              onClick={() => doSearch(clean)}
              disabled={loading || !isValid}
              style={S.btn(loading || !isValid)}
            >
              {loading ? 'Ricerca...' : 'Verifica'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>Demo:</span>
            {['FI123AB', 'RM456CD', 'MI789EF'].map(p => (
              <button
                key={p}
                onClick={() => { setPlate(p); doSearch(p); }}
                style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, border: '1px solid #d1d5db', background: '#f3f4f6', cursor: 'pointer', color: '#374151' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #0f1923', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 10px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Ricerca in corso...</p>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '1rem', color: '#b91c1c', fontSize: 14 }}>
            {error}
          </div>
        )}

        {result && <Risultati data={result} />}
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '1.25rem', marginBottom: '1rem' }}>
      {children}
    </div>
  );
}

function Sezione({ titolo, colore, children }: { titolo: string; colore: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{ padding: '11px 14px', borderBottom: '1px solid #f3f4f6', fontSize: 13, fontWeight: 600, color: '#374151', background: colore }}>
        {titolo}
      </div>
      <div style={{ padding: '1rem' }}>
        {children}
      </div>
    </div>
  );
}

function Riga({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f9fafb' }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>{k}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1923' }}>{v}</span>
    </div>
  );
}

function Pillola({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return (
    <span style={{
      background: ok ? '#dcfce7' : '#fef2f2',
      color: ok ? '#15803d' : '#b91c1c',
      padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
    }}>
      {ok ? yes : no}
    </span>
  );
}

function Risultati({ data }: { data: VehicleData }) {
  const p = calcPrezzi(data);
  const as24 = 'https://www.autoscout24.it/lst/' + data.marca.toLowerCase() + '/' + data.modello.toLowerCase() + '?atype=C&cy=I&fregfrom=' + data.anno + '&fregto=' + (data.anno + 1);
  const subito = 'https://www.subito.it/annunci-italia/vendita/usato/?q=' + encodeURIComponent(data.marca + ' ' + data.modello) + '&tipo_veicolo=Automobile';

  const linkStyle = {
    fontSize: 11, color: '#1d4ed8', background: '#dbeafe',
    border: '1px solid #bfdbfe', borderRadius: 100,
    padding: '3px 10px', textDecoration: 'none', display: 'inline-block',
  } as React.CSSProperties;

  const specsData = [
    ['Marca', data.marca], ['Modello', data.modello],
    ['Anno', String(data.anno)], ['Tipo', data.tipo],
    ['Alimentazione', data.alim], ['Classe', data.classe],
    ['Potenza', data.cavalli + ' CV'], ['Cilindrata', data.cilindrata],
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 18, fontWeight: 700,
            background: '#f1f5ff', border: '2px solid #c7d3f5',
            borderRadius: 8, padding: '5px 14px', letterSpacing: '0.14em', color: '#1e3a8a',
          }}>
            {data.plate}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0f1923' }}>{data.marca} {data.modello}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{data.allestimento} · {data.anno} · {data.km.toLocaleString('it-IT')} km</div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 8, marginBottom: '1rem' }}>
        {[
          { l: 'Bollo', ok: data.bollo.ok, v: data.bollo.ok ? 'Pagato' : 'Non pagato', s: 'Scad. ' + data.bollo.sc },
          { l: 'Revisione', ok: data.rev.ok, v: data.rev.ok ? 'In regola' : 'Da rinnovare', s: 'Prox. ' + data.rev.sc },
          { l: 'Assicurazione', ok: data.rca.ok, v: data.rca.ok ? 'Valida' : 'Scaduta', s: data.rca.comp + ' · ' + data.rca.sc },
        ].map(c => (
          <div key={c.l} style={{
            background: c.ok ? '#f0fdf4' : '#fef2f2',
            borderRadius: 12, border: '1px solid ' + (c.ok ? '#bbf7d0' : '#fecaca'),
            padding: 12, textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{c.ok ? '✅' : '❌'}</div>
            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>{c.l}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.ok ? '#15803d' : '#b91c1c' }}>{c.v}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{c.s}</div>
          </div>
        ))}
      </div>

      <Sezione titolo="Quotazione e valore di mercato" colore="#eff6ff">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 14 }}>
          <div style={{ background: '#dbeafe', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#1d4ed8', marginBottom: 6 }}>
              Prezzo listino (nuovo)
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1e40af' }}>{fmtEur(p.listino)}</div>
            <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 3 }}>Prezzo originale</div>
          </div>
          <div style={{ background: '#dcfce7', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#15803d', marginBottom: 6 }}>
              Stima valore usato
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#166534' }}>{fmtEur(p.usatoMid)}</div>
            <div style={{ fontSize: 11, color: '#16a34a', marginTop: 3 }}>{fmtEur(p.usatoMin)} – {fmtEur(p.usatoMax)}</div>
          </div>
        </div>

        <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Deprezzamento stimato</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>-{p.pct}%</span>
          </div>
          <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: p.pct + '%', background: '#f59e0b', borderRadius: 3 }} />
          </div>
        </div>

        <Riga k="Eta veicolo" v={(new Date().getFullYear() - data.anno) + ' anni (imm. ' + data.anno + ')'} />
        <Riga k="Km dichiarati" v={data.km.toLocaleString('it-IT') + ' km'} />
        <Riga k="Alimentazione" v={data.alim} />

        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>Verifica annunci reali:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <a href={as24} target="_blank" rel="noopener noreferrer" style={linkStyle}>AutoScout24</a>
            <a href={subito} target="_blank" rel="noopener noreferrer" style={linkStyle}>Subito.it</a>
            <a href="https://www.automobile.it/valutazione-auto" target="_blank" rel="noopener noreferrer" style={linkStyle}>automobile.it</a>
            <a href="https://www.motornet.it/quotazioni/" target="_blank" rel="noopener noreferrer" style={linkStyle}>Eurotax</a>
            <a href="https://quotazioni.quattroruote.it/nominale" target="_blank" rel="noopener noreferrer" style={linkStyle}>Quattroruote</a>
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10, lineHeight: 1.5 }}>
          Stima basata su deprezzamento annuo, km e tipo di alimentazione.
        </p>
      </Sezione>

      <Sezione titolo="Dati tecnici" colore="#f0fdf4">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8 }}>
          {specsData.map(([k, v]) => (
            <div key={k} style={{ background: '#f9fafb', borderRadius: 10, padding: '9px 11px' }}>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f1923' }}>{v}</div>
            </div>
          ))}
        </div>
      </Sezione>

      <Sezione titolo="Stato legale" colore="#f0fdf4">
        <Riga k="Bollo" v={<Pillola ok={data.bollo.ok} yes="Pagato" no="Non pagato" />} />
        <Riga k="Scadenza bollo" v={data.bollo.sc} />
        <Riga k="Revisione" v={<Pillola ok={data.rev.ok} yes="In regola" no="Da rinnovare" />} />
        <Riga k="Prossima revisione" v={data.rev.sc} />
        <Riga k="Assicurazione RCA" v={<Pillola ok={data.rca.ok} yes="Valida" no="Scaduta" />} />
        <Riga k="Compagnia" v={data.rca.comp} />
        <Riga k="Scadenza RCA" v={data.rca.sc} />
      </Sezione>

      <Sezione titolo="Nota per l'acquisto" colore="#fffbeb">
        <div style={{ background: '#fefce8', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#713f12', lineHeight: 1.7 }}>
          {data.nota}
        </div>
      </Sezione>
    </div>
  );
}
