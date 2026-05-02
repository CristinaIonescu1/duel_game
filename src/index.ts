/**
 * Entry point — citește flag-urile din terminal și decide în ce mod rulăm.
 *
 * Flag-uri disponibile:
 *   --simulate          Rulează 1000 de simulări și afișează statistici agregate.
 *                       Fără acest flag se rulează un singur duel detaliat.
 *
 *   --fixed-abilities   Fiecare personaj păstrează abilitatea de la începutul meciului.
 *                       Fără acest flag abilitățile se schimbă aleatoriu la fiecare rundă.
 */

import { Character } from "./character";
import { runFight } from "./combat";
import { printCharacterSetup, printFightResult } from "./display";
import { runSimulation } from "./simulation";

//extrag doar flag-urile din terminal
const args = process.argv.slice(2);
const simulate = args.includes("--simulate");//true dacă s-a pus --simulate
const fixedAbilities = args.includes("--fixed-abilities");//true dacă s-a pus --fixed-abilities

//verbose e true doar în duel unic — în simulare nu mă interesează detaliile fiecărui atac
const options = { 
  fixedAbilities, //shorthand pentru fixedAbilities: fixedAbilities
  verbose: !simulate //inversul lui simulate
 };

if (simulate) {
  //modul simulare — rulează 1000 de dueluri și afișează statistici agregate
  console.log(`\nMode: Simulation (1 000 runs)`);
  console.log(`Abilities: ${fixedAbilities ? "fixed per character" : "re-rolled each round"}`);
  runSimulation(options);
} else {
  //modul duel unic — rulează un singur duel detaliat
  console.log(`\nMode: Single duel`);
  console.log(`Abilities: ${fixedAbilities ? "fixed per character" : "re-rolled each round"}`);

  //creez personajele — attack, defense și abilitatea sunt generate aleatoriu în constructor
  const char1 = new Character("Character 1");
  const char2 = new Character("Character 2");

  printCharacterSetup(char1, char2);//afișez statisticile inițiale

  const result = runFight(char1, char2, options);//rulez lupta
  printFightResult(result);//afișez detaliile rundă cu rundă
}
