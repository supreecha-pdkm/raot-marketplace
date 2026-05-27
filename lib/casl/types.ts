import type { MongoAbility } from "@casl/ability";

export type Role = "buyer" | "seller";

export type Actions = "manage" | "create" | "read" | "update" | "delete";

export type ProductSubject = { type: "Product"; sellerId: string };
export type OrderSubject = {
  type: "Order";
  buyerId?: string;
  sellerId?: string;
};

export type Subjects =
  | "Product"
  | "Order"
  | "all"
  | ProductSubject
  | OrderSubject;

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export type AbilityUser = {
  id: string;
  role: Role;
};
