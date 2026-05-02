import { chance } from "./utils";


export interface AbilityContext {
  rawDamage: number;
  defender: { health: number; name: string };
  attacker: { health: number; name: string };
  dealBonusDamage: (target: { health: number; name: string }, amount: number) => void;
}

export interface AbilityResult {
  activated: boolean;
  finalDamage: number;
  log: string;
}

// Interfața nu spune cum funcționează o abilitate,
// ci doar ce primește și ce trebuie să returneze.
export interface Ability {
  readonly name: string;//nu pot schimba numele abilității după ce a fost setat
  onDefend(ctx: AbilityContext): AbilityResult;
  onAttack(ctx: AbilityContext): AbilityResult;
}

/**
 * Clasa părinte a tuturor abilităților.
 * onAttack și onDefend au comportamentul default.
 */

abstract class BaseAbility implements Ability {
  abstract readonly name: string;//fiecare clasă copil trebuie să definească numele funcției

  onDefend(ctx: AbilityContext): AbilityResult {
    return { 
      activated: false,
       finalDamage: ctx.rawDamage, 
       log: "No ability activated"
      };
  }

  onAttack(ctx: AbilityContext): AbilityResult {
    return { 
      activated: false, 
      finalDamage: ctx.rawDamage,
       log: "No ability activated" 
      };
  }
}

// Definirea primei abilități – Damage Reduction: când personajul e atacat, are 25% șansă să primească doar jumătate din daună
export class DamageReduction extends BaseAbility {
  readonly name = "Damage Reduction";
  private readonly ACTIVATION_CHANCE = 0.25;//25% șansă să se activeze 
  private readonly REDUCTION_FACTOR = 0.5;//înmulțesc dauna cu 0.5 ca să o înjumătățesc

  override onDefend(ctx: AbilityContext): AbilityResult {
    //dacă abilitatea nu s-a activat,nu mai continui calculul
    if (!chance(this.ACTIVATION_CHANCE)) {
      return { 
        activated: false, 
        finalDamage: ctx.rawDamage, 
        log: "No ability activated" 
      };
    }

    //în caz contrar,calculez dauna redusă,rotunjind rezultatul
    const finalDamage = Math.floor(ctx.rawDamage * this.REDUCTION_FACTOR);

    //returnez rezultatul
    return {
      activated: true,
      finalDamage,
      log: `${ctx.defender.name} activates Damage Reduction (damage halved: ${ctx.rawDamage} → ${finalDamage})`,
    };
  }
}


// Definirea abilității 2 – Power Strike: când personajul atacă, are 25% șansă să dea cu 50% mai multă daună
export class PowerStrike extends BaseAbility {
  readonly name = "Power Strike";
  private readonly ACTIVATION_CHANCE = 0.25;
  private readonly BONUS_MULTIPLIER = 1.5;//înmulțesc dauna cu 1.5 ca să o măresc cu 50%

  override onAttack(ctx: AbilityContext): AbilityResult {
    //dacă abilitatea nu s-a activat,nu mai continui calculul
    if (!chance(this.ACTIVATION_CHANCE)) {
      return { 
        activated: false, 
        finalDamage: ctx.rawDamage, 
        log: "No ability activated" 
      };
    }

    //în caz contrar,calculez dauna mărită,rotunjind rezultatul
    const finalDamage = Math.floor(ctx.rawDamage * this.BONUS_MULTIPLIER);

    //afișez rezultatul
    return {
      activated: true,
      finalDamage,
      log: `${ctx.attacker.name} activates Power Strike (damage boosted: ${ctx.rawDamage} → ${finalDamage})`,
    };
  }
}


// definirea abilității 3 – Second Wind: când personajul e atacat și lovitura îl aduce sub 30 HP,
// are 25% șansă să absoarbă 5 din damage-ul primit
export class SecondWind extends BaseAbility {
  readonly name = "Second Wind";
  private readonly ACTIVATION_CHANCE = 0.25;
  private readonly HEALTH_THRESHOLD = 30;//pragul de HP(viață) sub care se poate activa vindecarea
  private readonly HEAL_AMOUNT = 5;// câte HP recuperează

  override onDefend(ctx: AbilityContext): AbilityResult {
    //calculez HP ul după lovitură
    const healthAfterHit = ctx.defender.health - ctx.rawDamage;

    //dacă abilitatea nu s-a activat,nu mai continui calculul
    if (healthAfterHit >= this.HEALTH_THRESHOLD || !chance(this.ACTIVATION_CHANCE)) {
      return { 
        activated: false, 
        finalDamage: ctx.rawDamage, 
        log: "No ability activated" 
      };
    }

    //în caz contrar,calculez dauna efectivă,scăzând din cea inițială vindecarea
    const effectiveDamage = Math.max(0, ctx.rawDamage - this.HEAL_AMOUNT);
    //returnez rezultatul
    return {
      activated: true,
      finalDamage: effectiveDamage,
      log: `${ctx.defender.name} activates Second Wind (heals ${this.HEAL_AMOUNT} HP after dropping below ${this.HEALTH_THRESHOLD})`,
    };
  }
}

//definirea abilității 4 – Revenge Reflex: când personajul e atacat, are 25% șansă să blocheze
// tot damage-ul și să reflecte 50% din el înapoi la atacator
export class RevengeReflex extends BaseAbility {
  readonly name = "Revenge Reflex";
  private readonly ACTIVATION_CHANCE = 0.25;
  private readonly REFLECT_FACTOR = 0.5;//reflectă 50% din damage înapoi la atacator

  override onDefend(ctx: AbilityContext): AbilityResult {
    //dacă abilitatea nu s-a activat,nu mai continui calculul
    if (!chance(this.ACTIVATION_CHANCE)) {
      return { 
        activated: false, 
        finalDamage: ctx.rawDamage, 
        log: "No ability activated" 
      };
    }
    
    //în caz contrar,calculez dauna reflectată către atacator
    const reflectedDamage = Math.floor(ctx.rawDamage * this.REFLECT_FACTOR);
    ctx.dealBonusDamage(ctx.attacker, reflectedDamage);

    return {
      activated: true,
      finalDamage: 0,
      log: `${ctx.defender.name} activates Revenge Reflex (blocks all damage, reflects ${reflectedDamage} to ${ctx.attacker.name})`,
    };
  }
}


// Registry – lista tuturor abilităților disponibile în joc.
export const ABILITY_REGISTRY: ReadonlyArray<new () => Ability> = [
  DamageReduction,
  PowerStrike,
  SecondWind,
  RevengeReflex,
];

// Aleg o abilitate aleatorie din registry și returnez un obiect nou din ea.
export function randomAbility(): Ability {
  const Ctor = ABILITY_REGISTRY[Math.floor(Math.random() * ABILITY_REGISTRY.length)];
  return new Ctor();
}

