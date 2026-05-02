import { Ability, randomAbility } from "./abilities";
import { randomInt } from "./utils";

export interface CharacterSnapshot {
  name: string;
  attack: number;
  defense: number;
  ability: string;
}

export class Character {
  readonly name: string;
  readonly attack: number;
  readonly defense: number;
  health: number;

  ability: Ability;
  private readonly fixedAbility: Ability;

  private static readonly STARTING_HEALTH = 100;
  private static readonly ATTACK_MIN = 15;
  private static readonly ATTACK_MAX = 20;
  private static readonly DEFENSE_MIN = 10;
  private static readonly DEFENSE_MAX = 15;

  constructor(name: string) {
    this.name = name;
    this.attack = randomInt(Character.ATTACK_MIN, Character.ATTACK_MAX);
    this.defense = randomInt(Character.DEFENSE_MIN, Character.DEFENSE_MAX);
    this.health = Character.STARTING_HEALTH;
    this.fixedAbility = randomAbility();
    this.ability = this.fixedAbility;
  }

  get isAlive(): boolean {
    return this.health > 0;
  }

  
  //Alege o abilitate nouă aleatorie. Folosită când abilitățile se rerulează fiecare rundă.
  rollAbility(): void {
    this.ability = randomAbility();
  }


  //Resetează abilitatea curentă la cea originală. Folosită în modul cu abilități fixe.
  useFixedAbility(): void {
    this.ability = this.fixedAbility;
  }

  snapshot(): CharacterSnapshot {
    return {
      name: this.name,
      attack: this.attack,
      defense: this.defense,
      ability: this.ability.name,
    };
  }


  //Resetează viața la 100.Folosită în simulare când se rulează 1000 de lupte.
  reset(): void {
    this.health = Character.STARTING_HEALTH;
  }
}
