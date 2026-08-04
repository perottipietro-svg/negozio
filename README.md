# Conto Vendita

Web app (PWA) per gestire la vendita in conto vendita di un singolo fornitore e produrre
il rendiconto settimanale in Excel da inviargli.

Stessa architettura della app PHM: **una pagina statica, nessun server, nessun servizio a pagamento,
nessuna scadenza.** Funziona anche offline e si installa sul telefono come una app normale.

## Cosa fa

- **Vendi** — griglia dei prodotti con ricerca e filtro per categoria. Un tocco su `+1 venduto`
  registra la vendita al prezzo del fornitore (con Annulla); toccando la scheda si aprono
  quantità, prezzo, data e note.
- **Vendite** — elenco per giorno, filtri di periodo, modifica ed eliminazione.
- **Prodotti** — anagrafica (nome, codice, prezzo fornitore, categoria), carichi di merce
  ricevuta e giacenza residua con avviso di scorta bassa. Importazione in blocco
  incollando le righe da Excel.
- **Report** — si sceglie il periodo (di default la settimana scorsa, lunedì–domenica) e si
  scarica un `.xlsx` con tre fogli: *Riepilogo* (per prodotto), *Dettaglio* (vendita per vendita)
  e *Giacenza* (ricevuti / venduti / rimanenza). Storico dei rendiconti già inviati.
- **Impostazioni** — dati negozio e fornitore, sincronizzazione, backup.

Il file Excel è generato interamente dentro il browser: nessuna libreria esterna, nessun
caricamento di dati su servizi di terzi.

## Sincronizzazione telefono ↔ PC (opzionale)

L'archivio può essere salvato in un **Gist privato** del proprio account GitHub, così tutti i
dispositivi restano allineati. È gratuito e senza scadenza.

1. Creare un token su <https://github.com/settings/tokens/new> — scadenza *No expiration*,
   unico permesso da spuntare: **gist**.
2. Incollarlo in *Impostazioni → Sincronizzazione* e premere **Sincronizza ora**.
3. Copiare l'**ID archivio** che compare e inserirlo, insieme allo stesso token, anche
   sull'altro dispositivo.

Il token resta solo nel browser del dispositivo e non viene mai scritto dentro l'archivio.
Se la sincronizzazione è spenta l'app funziona lo stesso: i dati restano in locale e si possono
spostare con *Esporta / Importa archivio*.

Unione dei dati: ogni record ha un identificativo e una data di modifica; in caso di modifiche
sullo stesso record da due dispositivi vince la più recente. Le eliminazioni vengono propagate.

## Struttura

| File | Ruolo |
|---|---|
| `index.html` | tutta l'app: interfaccia, logica, generatore XLSX, sincronizzazione |
| `manifest.json` | installazione come app sul telefono |
| `sw.js` | service worker: funzionamento offline |
| `icon-192.png`, `icon-512.png` | icone |

## Deploy

Push su `main`: il workflow in `.github/workflows/deploy.yml` pubblica la cartella su GitHub Pages.
