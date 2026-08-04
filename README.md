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
  ricevuta e giacenza residua con avviso di scorta bassa.
- **Importazione del listino** — da file **.xlsx** o **CSV**, oppure incollando le righe.
  Le colonne (*Nome, Codice, Prezzo, Q.tà ricevuta, Categoria*) vengono riconosciute dalle
  intestazioni, in qualunque ordine e con diverse diciture; senza intestazioni si usa l'ordine
  standard. Prima di scrivere niente viene mostrata un'anteprima, con segnalazione dei prodotti
  già presenti (aggiornabili invece che duplicati). `esempio-prodotti.xlsx` è un listino di prova
  con 20 articoli, scaricabile dall'app stessa.
  I file .xlsx sono letti direttamente nel browser (zip + `DecompressionStream`), senza librerie.
  I PDF non sono supportati: l'estrazione da PDF non è abbastanza affidabile per dei prezzi.
- **Report** — si sceglie il periodo (di default la settimana scorsa, lunedì–domenica) e si
  scarica un `.xlsx` con tre fogli: *Riepilogo* (per prodotto), *Dettaglio* (vendita per vendita)
  e *Giacenza* (ricevuti / venduti / rimanenza). Storico dei rendiconti già inviati.
- **Impostazioni** — dati negozio e fornitore, sincronizzazione, backup.

Il file Excel è generato interamente dentro il browser: nessuna libreria esterna, nessun
caricamento di dati su servizi di terzi.

## Sincronizzazione telefono ↔ PC (opzionale)

L'archivio può essere salvato in un **Gist privato** del proprio account GitHub, così tutti i
dispositivi restano allineati. È gratuito e senza scadenza.

**Primo dispositivo:** creare un token su <https://github.com/settings/tokens/new> — scadenza
*No expiration*, unico permesso da spuntare **gist** — incollarlo in *Impostazioni →
Sincronizzazione* e premere **Attiva sincronizzazione**.

**Dispositivi successivi:** sul primo dispositivo premere *Collega un altro dispositivo*: compare
un **codice QR**. Lo si inquadra con la fotocamera dell'altro dispositivo e l'app si apre già
collegata — non c'è niente da digitare. Il QR contiene token e ID archivio in un frammento di URL
(`#s=…`), che non viene mai inviato a nessun server e viene rimosso dalla barra degli indirizzi
appena letto. Resta comunque una chiave: non va fotografato né condiviso. In alternativa si
possono inserire token e ID archivio a mano.

Il QR è generato dall'app stessa (`qrBuild`, modalità byte, correzione L, versioni 1-10, scelta
automatica della maschera): niente librerie esterne. Le matrici prodotte sono state confrontate
modulo per modulo con un'implementazione di riferimento su tutte le versioni e tutte e 8 le maschere.

**Quando sincronizza:** all'apertura, a ogni modifica (dopo 1,5 s), al ritorno sull'app, al rientro
in rete e comunque ogni minuto. L'archivio viene riscritto solo se il contenuto è davvero cambiato.

Il token resta solo nel browser del dispositivo e non viene mai scritto dentro l'archivio.
Se la sincronizzazione è spenta l'app funziona lo stesso: i dati restano in locale e si possono
spostare con *Esporta / Importa archivio*.

Unione dei dati: ogni record ha un identificativo e una data di modifica; in caso di modifiche
sullo stesso record da due dispositivi vince la più recente. Le eliminazioni vengono propagate.

## Struttura

| File | Ruolo |
|---|---|
| `index.html` | tutta l'app: interfaccia, logica, lettore e generatore XLSX, sincronizzazione |
| `esempio-prodotti.xlsx` | listino di prova con 20 articoli |
| `manifest.json` | installazione come app sul telefono |
| `sw.js` | service worker: funzionamento offline |
| `icon-192.png`, `icon-512.png` | icone |

## Deploy

Push su `main`: il workflow in `.github/workflows/deploy.yml` pubblica la cartella su GitHub Pages.
