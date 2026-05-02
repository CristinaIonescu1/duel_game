import { ABILITY_REGISTRY } from "./abilities";
import { Character } from "./character";
import { CombatOptions, FightResult, runFight } from "./combat";


// Interfețe necesare

interface AbilityStats {
  wins: number;// câte victorii a avut personajul cu abilitatea X
  total: number;// de câte ori a avut personajul abilitatea X
}

interface CharacterStats {
  wins: number;// câte victorii totale
  totalRoundsWon: number;// suma rundelor din toate victoriile
  totalHealthWon: number;// suma HP-ului rămas din toate victoriile
  abilityWins: Map<string, AbilityStats>;// statistici per abilitate
}


// Rularea simulării
const SIMULATION_RUNS = 1000;

export function runSimulation(options: CombatOptions): void {
  // Creez cele două personaje o singură dată — attack și defense rămân
  // aceleași pe tot parcursul simulărilor ca să compar același cuplu de personaje
  const char1 = new Character("Character 1");
  const char2 = new Character("Character 2");

  // Inițializez foaia de scor pentru fiecare personaj, cu toate valorile la zero.
  const stats: Record<string, CharacterStats> = {
    [char1.name]: makeCharStats(),
    [char2.name]: makeCharStats(),
  };

  console.log(`\nRunning ${SIMULATION_RUNS} simulations...\n`);

  for (let i = 0; i < SIMULATION_RUNS; i++) {
    // Resetez HP-ul la 100 înainte de fiecare luptă
    char1.reset();
    char2.reset();

    // Rulez o luptă fără detalii — verbose: false
    const result = runFight(char1, char2, { ...options, verbose: false });

    // Înregistrez rezultatul în foaia de scor
    recordResult(result, stats, char1, char2, options.fixedAbilities);
  }
 
  // După toate cele 1000 de lupte, afișez statisticile finale
  printStats(stats, char1, char2, options.fixedAbilities);
}


// Înregistrează rezultatul unei lupte în foaia de scor.
function recordResult(
  result: FightResult,// rezultatul duelului
  stats: Record<string, CharacterStats>,// foaia de scor
  char1: Character,
  char2: Character,
  fixedAbilities: boolean// sunt abilitățile fixe?
): void {
  // Găsesc statisticile câștigătorului în foaia de scor.
  const winnerStats = stats[result.winner];
  // Adaug o victorie, rundele și viața rămasă la totalurile câștigătorului.
  // Vor fi folosite mai târziu pentru a calcula mediile.
  winnerStats.wins++;
  winnerStats.totalRoundsWon += result.totalRounds;
  winnerStats.totalHealthWon += result.winnerRemainingHealth;

  // Înregistrez statisticile per abilitate doar în modul cu abilități fixe,
  // pentru că în modul aleatoriu abilitatea se schimbă fiecare rundă
  // și nu pot ști care a contat.
  if (fixedAbilities) {
    // Găsesc obiectul câștigătorului ca să îi pot accesa abilitatea
    const winner = result.winner === char1.name ? char1 : char2;
    const abilityName = winner.ability.name;

    // Caut înregistrarea abilității în Map.
    // Dacă nu există încă, o creez cu valorile la 0.
    const entry = winnerStats.abilityWins.get(abilityName) ?? { wins: 0, total: 0 };

    // Adaug o victorie abilității și o salvez înapoi în Map
    entry.wins++;
    winnerStats.abilityWins.set(abilityName, entry);

    // Înregistrez câte lupte a jucat fiecare abilitate, indiferent dacă a câștigat sau nu.
    // Necesar pentru a calcula rata de victorie: wins / total.
    for (const ch of [char1, char2]) {
     // Iau statisticile și numele abilității personajului curent
     const s = stats[ch.name];
     const ab = ch.ability.name;

    // Caut înregistrarea abilității sau o creez goală dacă nu există
    const e = s.abilityWins.get(ab) ?? { wins: 0, total: 0 };

    // Adaug o apariție și salvez înapoi în Map.
    e.total++;
    s.abilityWins.set(ab, e);
}
  }
}

function printStats(
  stats: Record<string, CharacterStats>,// foaia de scor cu toate statisticile
  char1: Character,
  char2: Character,
  fixedAbilities: boolean// sunt abilitățile fixe?
): void {
  const total = SIMULATION_RUNS;

  console.log("=".repeat(50));
  console.log("SIMULATION RESULTS");
  console.log("=".repeat(50));

  // Trec prin ambele personaje ca să nu scriu același cod de două ori.
  [char1, char2].forEach((ch) => {
    // Scot statisticile personajului curent din foaia de scor.
    const s = stats[ch.name];

    // Calculez procentul de victorii și îl rotunjesc la o zecimală.
    const winPct = ((s.wins / total) * 100).toFixed(1);

    // Media rundelor din luptele câștigate.
    // Dacă n-a câștigat niciodată, evit împărțirea la zero și afișez N/A.
    const avgRounds = s.wins > 0 ? (s.totalRoundsWon / s.wins).toFixed(1) : "N/A";

    // Același lucru pentru HP-ul rămas la finalul luptelor câștigate.
    const avgHealth = s.wins > 0 ? (s.totalHealthWon / s.wins).toFixed(1) : "N/A";

    console.log(`\n${ch.name}`);
    console.log(`  Attack: ${ch.attack} | Defense: ${ch.defense}`);
    console.log(`  Win rate: ${winPct}% (${s.wins}/${total})`);
    console.log(`  Avg rounds when winning: ${avgRounds}`);
    console.log(`  Avg HP remaining when winning: ${avgHealth}`);

    // Statisticile per abilitate au sens doar în modul fixed.
    // În modul aleatoriu abilitatea se schimbă în fiecare rundă,
    // deci nu pot ști care a contat cu adevărat.
    if (fixedAbilities && s.abilityWins.size > 0) {
      console.log(`  Win rate by ability:`);

      
      for (const [abilityName, ab] of s.abilityWins) {
        // Sar abilitățile pe care personajul nu le-a avut în nicio simulare.
        if (ab.total > 0) {
          const abWinPct = ((ab.wins / ab.total) * 100).toFixed(1);
          console.log(` ${abilityName}: ${abWinPct}% (${ab.wins} wins / ${ab.total} fights)`);
        }
      }
    }
  });

  console.log("\n" + "=".repeat(50));

 // Adun rundele din toate luptele ca să pot calcula durata medie.
  let totalRounds = 0;
  for (const character of Object.values(stats)) {
    totalRounds += character.totalRoundsWon;
  }

  // Împart la numărul de simulări — rezultă durata medie per luptă.
  const avgDuration = (totalRounds / total).toFixed(1);
  console.log(`Average fight duration: ${avgDuration} rounds`);
  console.log("=".repeat(50) + "\n");
}

//Funcție ajutătoare
// Creez un obiect de statistici gol pentru un personaj nou intrat în foaia de scor
function makeCharStats(): CharacterStats {
  return {
    wins: 0,
    totalRoundsWon: 0,
    totalHealthWon: 0,
    abilityWins: new Map(),
  };
}


