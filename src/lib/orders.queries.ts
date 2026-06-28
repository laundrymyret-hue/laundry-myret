import { queryOptions } from "@tanstack/react-query";
import { getAddons } from "./orders.functions";

export const addonsQuery = queryOptions({
  queryKey: ["addons"],
  queryFn: () => getAddons(),
  staleTime: 60_000,
});
