"use client";

import { useContext } from "react";

import { AbilityContext } from "@/shared/components/providers/ability-provider";
import type { AppAbility } from "@/lib/casl";

export function useAbility(): AppAbility {
  return useContext(AbilityContext);
}
