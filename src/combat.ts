import { AbilityContext, AbilityResult } from "./abilities";
import { Character } from "./character";
import { chance } from "./utils";

// Tipuri de date — setările luptei și rezultatele ei

export interface CombatOptions {
  //true=fiecare personaj păstrează abilitatea de la început până la final
  fixedAbilities: boolean;
  //true = afișez detaliile fiecărei runde, false = rulez silențios (simulare)
  verbose: boolean;
}

export interface RoundResult {
  roundNumber: number;
  attacker: string;
  defender: string;
  abilityLog: string;
  defenderHealthAfter: number;
  attackerDamageLog?: string;//există doar când Revenge Reflex se activează, altfel e undefined
}

export interface FightResult {
  winner: string;
  loser: string;
  totalRounds: number;
  winnerRemainingHealth: number;
  rounds: RoundResult[];// lista tuturor atacurilor;goală în modul simulare

}


// Damage pipeline

//Calculează dauna brută (atac − apărare,în cazul în care mi-ar da un număr negativ,pun 0)
function calculateRawDamage(attacker: Character, defender: Character): number {
  return Math.max(0, attacker.attack - defender.defense);
}

/**
 * Rulează pipeline-ul complet de abilități pentru un singur atac.
 *
 * Ordinea pașilor:
 *   1. Abilitatea atacatorului — onAttack (ex: Power Strike mărește dauna)
 *   2. Abilitatea apărătorului — onDefend (ex: Damage Reduction o înjumătățește)
 *
 * Apărătorul primește dauna produsă de pasul 1, nu dauna originală,
 * astfel cele două abilități se compun corect fără să se cunoască între ele.
 */
function resolveAttack(
  attacker: Character,
  defender: Character,
  dealBonusDamage: AbilityContext["dealBonusDamage"]
): { finalDamage: number; attackerLog: AbilityResult; defenderLog: AbilityResult } {
  const rawDamage = calculateRawDamage(attacker, defender);

  // Pasul 1 — abilitatea atacatorului
  const attackCtx: AbilityContext = {
    rawDamage,
    attacker,
    defender,
    dealBonusDamage,
  };
  const attackerLog = attacker.ability.onAttack(attackCtx);
  const damageAfterAttack = attackerLog.finalDamage;

  // Pasul 2 — abilitatea apărătorului
  //primește dauna după modificările atacatorului
  const defendCtx: AbilityContext = {
    rawDamage: damageAfterAttack,//apărătorul trebuie să vadă dauna după ce atacatorul și-a aplicat abilitatea
    attacker,
    defender,
    dealBonusDamage,
  };
  const defenderLog = defender.ability.onDefend(defendCtx);

  return {
    finalDamage: defenderLog.finalDamage,// dauna finală după ambii pași
    attackerLog,
    defenderLog,
  };
}

// Dirijorul luptei — coordonează cine atacă când și cât durează lupta
export function runFight(
  char1: Character,
  char2: Character,
  options: CombatOptions
): FightResult {
  //inițializări
  const rounds: RoundResult[] = [];// colectez toate atacurile aici
  let roundNumber = 0;// contorul rundelor

  // decid aleatoriu cine atacă primul — 50/50
  let [first, second] = chance(0.5) ? [char1, char2] : [char2, char1];

  while (char1.isAlive && char2.isAlive) {
    roundNumber++;

    //atribuirea abilităților
    if (options.fixedAbilities) {
      first.useFixedAbility();
      second.useFixedAbility();
    } 
    else {
      first.rollAbility();
      second.rollAbility();
    }

    // primul atac al rundei
    const roundLog = playHalf(first, second, roundNumber, options.verbose);
    if (options.verbose) rounds.push(roundLog);//dacă sunt în modul detaliat, adaug roundLog în vectorul rounds
    if (!second.isAlive) break;

    // al doilea atac al rundei
    const roundLog2 = playHalf(second, first, roundNumber, options.verbose, true);
    if (options.verbose) rounds.push(roundLog2);

    // fac swap,pentru că nu vreau ca primul personaj să înceapă mereu runda
    [first, second] = [second, first];
    if (!first.isAlive) break;

  
  }
  //determinarea câștigătorului și a pierzătorului
  const winner = char1.isAlive ? char1 : char2;
  const loser = char1.isAlive ? char2 : char1;

  return {
    winner: winner.name,
    loser: loser.name,
    totalRounds: roundNumber,// câte runde a durat lupta
    winnerRemainingHealth: winner.health,// cu câte HP a terminat câștigătorul
    rounds,// gol dacă e simulare
  };
}



// Un singur atac — un personaj îl lovește pe celălalt
// runFight o apelează de două ori pe rundă, o dată pentru fiecare personaj
function playHalf(
  attacker: Character,
  defender: Character,
  roundNumber: number,
  verbose: boolean,
  isSecondHalf = false
): RoundResult {
  let attackerDamageLog: string | undefined;

  // definesc callback-ul aici ca să aibă acces la attackerDamageLog
  // Revenge Reflex îl apelează când vrea să lovească înapoi atacatorul
  const dealBonusDamage: AbilityContext["dealBonusDamage"] = (target, amount) => {
    target.health = Math.max(0, target.health - amount);
    attackerDamageLog = `${target.name} takes ${amount} reflected damage (${target.health} HP remaining)`;
  };

  const { finalDamage, attackerLog, defenderLog } = resolveAttack(
    attacker,
    defender,
    dealBonusDamage
  );

 // dauna e aplicată efectiv pe HP-ul apărătorului
  defender.health = Math.max(0, defender.health - finalDamage);

  //Alege cel mai relevant mesaj de afișat dintre cele două log-uri.
  const abilityLog = selectPrimaryLog(attackerLog, defenderLog);

  return {
    roundNumber,
    attacker: attacker.name,
    defender: defender.name,
    abilityLog,
    defenderHealthAfter: defender.health,
    attackerDamageLog,
  };
}


/**
 * Dacă ambele abilități s-au activat în același atac (rar),
 * afișează mesajul apărătorului — el e cel care determină dauna finală.
 * Dacă niciuna nu s-a activat, spune o singură dată "No ability activated".
 */
function selectPrimaryLog(
  attackerLog: AbilityResult,
  defenderLog: AbilityResult
): string 
{
  if (defenderLog.activated) return defenderLog.log;
  if (attackerLog.activated) return attackerLog.log;
  return "No ability activated";
}

