// Returnează un număr întreg aleatoriu între min și max, ambele incluse.
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

 //Folosită pentru a decide dacă o abilitate se activează într-o rundă
export function chance(probability: number): boolean {
  return Math.random() < probability;
}
