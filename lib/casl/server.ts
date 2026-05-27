import { auth } from "@/auth";

import { createAbilityFor, createEmptyAbility } from "./ability";
import type { AppAbility } from "./types";

export async function getServerAbility(): Promise<AppAbility> {
  const session = await auth();
  if (!session?.user?.role) return createEmptyAbility();
  return createAbilityFor({
    id: session.user.id,
    role: session.user.role,
  });
}
