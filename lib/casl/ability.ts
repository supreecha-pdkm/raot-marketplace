import { createMongoAbility } from "@casl/ability";

import { defineEmptyRules, defineRulesFor } from "./rules";
import type { AbilityUser, AppAbility } from "./types";

export function createAbilityFor(user: AbilityUser): AppAbility {
  return createMongoAbility(defineRulesFor(user)) as AppAbility;
}

export function createEmptyAbility(): AppAbility {
  return createMongoAbility(defineEmptyRules()) as AppAbility;
}
