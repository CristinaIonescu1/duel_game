# Duel Game

## Descriere

Proiect TypeScript care simulează un duel turn-based între două personaje generate aleator, fiecare cu valori pentru atac, apărare și o abilitate specială. Poate fi rulat ca duel simplu afișat pas cu pas sau ca simulare de 1 000 de lupte pentru statistici agregate.

Logica este împărțită pe fișiere separate pentru personaje, abilități, luptă, afișare și simulare.

## Ce face programul

- generează două personaje cu valori random pentru attack și defense
- fiecare personaj pornește cu 100 HP
- abilitățile pot influența atacul sau apărarea în timpul luptei
- programul decide aleator cine începe primul
- lupta continuă pe runde până când unul dintre personaje ajunge la 0 HP
- există și un mod de simulare pentru a calcula win rate și durata medie a luptelor

## Extensii implementate

### Revenge Reflex (abilitatea 4)

Adăugată fără să modific funcția principală de calcul al daunelor. Când personajul e atacat, are 25% șansă să blocheze complet damage-ul și să returneze 50% din el atacatorului.

### Moduri de Configurare (Flags)

Aplicația poate fi personalizată prin argumente în linia de comandă pentru a schimba logica abilităților sau pentru a genera analize statistice complexe.

###  Gestiunea Abilităților: `--fixed-abilities`
Acest flag determină dacă personajele își păstrează abilitatea pe tot parcursul meciului sau o schimbă constant.

| Mod Execuție | Descriere Comportament |
| :--- | :--- |
| **Dynamic** (Implicit) | **Re-roll per rundă:** Fiecare personaj primește o abilitate nouă, extrasă aleatoriu, la începutul fiecărei runde. |
| **Static** (`--fixed-abilities`) | **Fixed per match:** Personajele primesc o singură abilitate la începutul duelului și o păstrează până la final. |

###  Analiză Statistică: `--simulate`
Schimbă modul de funcționare de la un singur meci demonstrativ la o simulare  de 1.000 de lupte.

| Mod | Detalii și Output Terminal |
| :--- | :--- |
| **Single Duel** (Implicit) | **Duel Start:** Afișează atributele inițiale (Attack/Defense) pentru ambii luptători. <br> **Log-uri pe runde:** Fiecare rundă detaliază ambele schimburi de lovituri (cine pe cine atacă), dacă s-a activat vreo abilitate și HP-ul rămas pentru fiecare victimă. <br> **Final:** Declară câștigătorul meciului. |
| **Simulation** (`--simulate`) | Execută automat **1.000 de simulări** și generează un raport statistic pentru fiecare jucător: <ul><li>**Atribute:** Afișează valorile de Attack și Defense generate.</li><li>**Win Rate:** Procentajul de victorii și raportul exact (ex: `86.1% — 861/1000`).</li><li>**Eficiență:** Media rundelor de luptă și viața medie (HP) rămasă în momentul victoriei.</li><li>**Statistici Abilități:** Dacă rulezi cu `--fixed-abilities`, vezi rata de succes pentru fiecare abilitate specifică.</li><li>**Global:** Calculează durata medie a duelurilor (**Average fight duration**).</li></ul> |


## Abilități implementate

1. **Damage Reduction** — când personajul e atacat, are 25% șansă să primească doar jumătate din damage
2. **Power Strike** — când personajul atacă, are 25% șansă să atace cu 50% mai multă putere
3. **Second Wind** — dacă un atac aduce personajul sub 30 HP, are 25% șansă să se vindece cu 5 HP
4. **Revenge Reflex** — când personajul e atacat, are 25% șansă să blocheze tot damage-ul și să reflecte 50% din el înapoi atacatorului

## Structura proiectului

```text
duel_game/
├── src/
│   ├── abilities.ts
│   ├── character.ts
│   ├── combat.ts
│   ├── display.ts
│   ├── index.ts
│   ├── simulation.ts
│   └── utils.ts
├── node_modules/
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Tehnologii folosite

- TypeScript
- Node.js
- ts-node

## Cerințe

- Node.js instalat
- npm instalat
- terminal deschis în folderul proiectului

## Instalare

```bash
npm install
```

## Rulare

Toate comenzile folosesc `npx ts-node` direct, fără pas de compilare.

### 1. Duel unic — abilități noi la fiecare rundă

```bash
npx ts-node src/index.ts
```

### 2. Duel unic — abilități fixe pe tot meciul

```bash
npx ts-node src/index.ts --fixed-abilities
```

### 3. 1 000 de simulări — abilități noi la fiecare rundă

```bash
npx ts-node src/index.ts --simulate
```

### 4. 1 000 de simulări — abilități fixe pe tot meciul

```bash
npx ts-node src/index.ts --simulate --fixed-abilities
```

## Posibilă problemă în PowerShell

Pe unele sisteme Windows scripturile nu pornesc direct din PowerShell. Dacă apare o eroare legată de execution policy, deschide PowerShell ca administrator și rulează:

```powershell
Set-ExecutionPolicy Unrestricted
```
