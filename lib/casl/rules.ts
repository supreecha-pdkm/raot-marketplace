import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";

import type { AbilityUser, Actions, AppAbility, Subjects } from "./types";

export function defineRulesFor(user: AbilityUser) {
  const { can, rules } = new AbilityBuilder<MongoAbility<[Actions, Subjects]>>(
    createMongoAbility,
  );

  if (user.role === "buyer") {
    can("read", "Product");
    can("create", "Order");
    can("read", "Order", { buyerId: user.id });
  }

  if (user.role === "seller") {
    can("manage", "Product", { sellerId: user.id });
    can("read", "Order", { sellerId: user.id });
  }

  return rules;
}

export function defineEmptyRules(): AppAbility["rules"] {
  return [];
}
