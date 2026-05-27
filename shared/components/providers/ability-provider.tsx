"use client";

import { createContext, type ReactNode } from "react";

import { createContextualCan } from "@casl/react";

import { useAuth } from "@/features/auth";
import {
  createAbilityFor,
  createEmptyAbility,
  type AppAbility,
} from "@/lib/casl";

export const AbilityContext = createContext<AppAbility>(createEmptyAbility());

export const Can = createContextualCan(AbilityContext.Consumer);

type Props = { children: ReactNode };

export function AbilityProvider({ children }: Props) {
  const { isAuthenticated, user } = useAuth();

  const ability: AppAbility =
    isAuthenticated && user?.role
      ? createAbilityFor({ id: user.id, role: user.role })
      : createEmptyAbility();

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}
