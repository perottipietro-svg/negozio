# Conto Vendita

Web app (PWA) per gestire la vendita in conto vendita di un singolo fornitore e produrre
il rendiconto settimanale in Excel da inviargli.

Stessa architettura della app PHM: **una pagina statica, nessun server, nessun servizio a pagamento,
nessuna scadenza.** Funziona anche offline e si installa sul telefono come una app normale.

## Cosa fa

- **Vendi** — griglia dei prodotti con ricerca e filtro per categoria. Un tocco su `+1 venduto`
  registra la vendita; toccando la scheda si aprono quantità, prezzo, data e note.
  La scheda toccata lampeggia, prende il bordo colorato e mostra un contatore con i pezzi
  venduti oggi, così sul telefono si vede subito che il tocco è andato a segno e quante volte.
  Tocchi ravvicinati sullo stesso prodotto (entro 20 s, stesso giorno e stesso prezzo) alzano la
  quantità della riga già aperta invece di crearne una nuova: il doppio tocco per sbaglio si
  corregge con un solo *Annulla*, che toglie un pezzo alla volta ed elimina la riga se arriva a zero.
- **Vendite** — elenco per giorno, filtri di periodo, modifica ed eliminazione.
- **Prodotti** — anagrafica (nome, codice, costo fornitore, prezzo di vendita, aliquota IVA,
  categoria), carichi di merce ricevuta e giacenza residua con avviso di scorta bassa.
  Mentre si compila la scheda vengono mostrati il margine, il **prezzo di pareggio**
  (costo × (1+IVA): sotto quella cifra si è in perdita) e il **prezzo suggerito** per la
  percentuale di margine desiderata, applicabile con un tocco.
- **Importazione del listino** — da file **.xlsx** o **CSV**, oppure incollando le righe.
  Le colonne (*Nome, Codice, Prezzo, Q.tà ricevuta, Categoria*) vengono riconosciute dalle
  intestazioni, in qualunque ordine e con diverse diciture; senza intestazioni si usa l'ordine
  standard. Prima di scrivere niente viene mostrata un'anteprima, con segnalazione dei prodotti
  già presenti (aggiornabili invece che duplicati). `esempio-prodotti.xlsx` è un listino di prova
  con 20 articoli, scaricabile dall'app stessa.
  I file .xlsx sono letti direttamente nel browser (zip + `DecompressionStream`), senza librerie.
  I PDF non sono supportati: l'estrazione da PDF non è abbastanza affidabile per dei prezzi.
- **Report** — due prospetti sullo stesso periodo (di default la settimana scorsa, lunedì–domenica):
  - *Per il fornitore*: `.xlsx` con tre fogli — *Riepilogo* per prodotto, *Dettaglio* vendita per
    vendita, *Giacenza* (ricevuti / venduti / rimanenza), ciascuno con imponibile, IVA e totale.
    Prezzi di vendita e margini non compaiono. Storico dei rendiconti già inviati.
  - *Il mio bilancio*: incassato, costo della merce, margine e percentuale, prospetto IVA
    (imponibile e IVA sulle vendite, IVA sugli acquisti, differenza), dettaglio per prodotto e per
    mese, esportabile in `.xlsx`.
- **Impostazioni** — dati negozio e fornitore, sincronizzazione, backup.

I file Excel sono generati interamente dentro il browser: nessuna libreria esterna, nessun
caricamento di dati su servizi di terzi.

## Prezzi e IVA — le convenzioni

| Campo | Significato |
|---|---|
| `prezzo` | costo del fornitore, **imponibile**, IVA esclusa |
| `pv` | prezzo di vendita al pubblico, **lordo**, IVA inclusa |
| `iva` | aliquota del prodotto; i nuovi partono dal valore predefinito in Impostazioni (22%) |

Da qui discende tutto il resto: imponibile delle vendite = incasso ÷ (1 + aliquota), IVA sulle
vendite = incasso − imponibile, IVA sugli acquisti = costo × aliquota, **margine = imponibile
vendite − costo imponibile** (i due termini sono entrambi al netto dell'IVA, quindi confrontabili).

Ogni vendita conserva la propria copia di costo, prezzo e aliquota: ritoccare il listino non
cambia i rendiconti già emessi. Tutti gli importi sono arrotondati al centesimo **riga per riga**,
così i totali coincidono sempre con la somma di ciò che si legge nel documento.

Il prospetto IVA è un conteggio gestionale sulla merce venduta nel periodo: **non è la
liquidazione IVA**, che segue le fatture registrate e non il momento della vendita.

## Sincronizzazione telefono ↔ PC (opzionale)

L'archivio può essere salvato in un **Gist privato** del proprio account GitHub, così tutti i
dispositivi restano allineati. È gratuito e senza scadenza.

**Primo dispositivo:** creare un token su <https://github.com/settings/tokens/new> — scadenza
*No expiration*, unico permesso da spuntare **gist** — incollarlo in *Impostazioni →
Sincronizzazione* e premere **Attiva sincronizzazione**.

**Dispositivi successivi:** sul primo dispositivo premere *Collega un altro dispositivo*: compare
un **codice QR**. Lo si inquadra con la fotocamera dell'altro dispositivo e l'app si apre già
collegata — non c'è niente da digitare. Per un **altro computer**, o qualsiasi dispositivo senza
fotocamera, lo stesso pannello offre *Copia il link di collegamento*: basta aprire quel link sulla
macchina da collegare. In alternativa si inseriscono token e ID archivio a mano. Il QR contiene token e ID archivio in un frammento di URL
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
sullo stesso record da due dispositivi vince la più recente. Le eliminazioni viaggiano come
"lapidi" (`deleted: true` con data di modifica), così spariscono anche sugli altri dispositivi
invece di tornare indietro al primo allineamento; dopo 90 giorni le lapidi vengono buttate.

Per lo stesso motivo *Cancella i dati* distingue fra **solo su questo dispositivo** — che spegne
anche la sincronizzazione, altrimenti l'archivio condiviso rimanderebbe tutto indietro — e
**su tutti i dispositivi**, che svuota anche l'archivio.

## Struttura

| File | Ruolo |
|---|---|
| `index.html` | tutta l'app: interfaccia, logica, lettore e generatore XLSX, sincronizzazione |
| `esempio-prodotti.xlsx` | listino di prova con 20 articoli |
| `manifest.json` | installazione come app sul telefono |
| `sw.js` | service worker: funzionamento offline |

Aggiornamenti: la pagina e `esempio-prodotti.xlsx` sono serviti sempre dalla rete quando c'è
connessione (`fetch` con `cache: 'reload'`, che scavalca anche il `max-age` di GitHub Pages),
con la cache come rete di sicurezza per l'uso offline. In *Impostazioni → Versione* è indicata
la versione in esecuzione, con un pulsante che svuota cache e service worker e ricarica.
La costante `APP_VER` in `index.html` va alzata a ogni rilascio.
| `icon-192.png`, `icon-512.png` | icone |

## Deploy

Push su `main`: il workflow in `.github/workflows/deploy.yml` pubblica la cartella su GitHub Pages.
