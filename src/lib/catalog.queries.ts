import { queryOptions } from "@tanstack/react-query";
import { getCategories, getCategoryWithServices } from "./catalog.functions";

export const categoriesQuery = queryOptions({
  queryKey: ["catalog", "categories"],
  queryFn: () => getCategories(),
  staleTime: 60_000,
});

export const categoryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["catalog", "category", slug],
    queryFn: () => getCategoryWithServices({ data: { slug } }),
    staleTime: 60_000,
  });
