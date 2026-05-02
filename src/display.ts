import { Character } from "./character";
import { FightResult } from "./combat";

// afișează statisticile inițiale ale celor două personaje înainte de luptă
export function printCharacterSetup(char1: Character, char2: Character): void {
  console.log("\n" + "=".repeat(50));
  console.log("DUEL START");
  console.log("=".repeat(50));
  console.log(`${char1.name}: attack = ${char1.attack}, defense = ${char1.defense}`);
  console.log(`${char2.name}: attack = ${char2.attack}, defense = ${char2.defense}`);
  console.log("=".repeat(50) + "\n");
}

// afișează detaliile luptei rundă cu rundă și anunță câștigătorul
export function printFightResult(result: FightResult): void {
  let currentRound = 0;  // ține minte în ce rundă suntem ca să nu afișăm "Round X" de două ori

  // parcurg fiecare atac din luptă și îl afișez
  for (const round of result.rounds) {

    // afișez "Round X" doar când se schimbă runda — fiecare rundă are două atacuri
    if (round.roundNumber !== currentRound) {
      currentRound = round.roundNumber;
      console.log(`\nRound ${currentRound}:`);
    }

    console.log(`  ${round.attacker} attacks ${round.defender}`);
    console.log(`  ${round.abilityLog}`);

    // afișez dauna reflectată doar dacă Revenge Reflex s-a activat
    if (round.attackerDamageLog) {
      console.log(`  ${round.attackerDamageLog}`);
    }

    // dacă HP-ul a ajuns la 0, personajul a murit
    if (round.defenderHealthAfter <= 0) {
      console.log(`  ${round.defender} has been defeated!`);
    } else {
      console.log(`  ${round.defender} has ${round.defenderHealthAfter} HP remaining`);
    }
  }

  // anunț câștigătorul și câte HP i-au rămas
  console.log("\n" + "=".repeat(50));
  console.log(`  ${result.winner} won after ${result.totalRounds} rounds!`);
  console.log(`  Remaining health: ${result.winnerRemainingHealth} HP`);
  console.log("=".repeat(50) + "\n");
}
