// convex/utils/pagination.ts
import { v } from "convex/values";

export const paginationOptsValidator = {
  cursor: v.optional(v.string()),
  limit: v.optional(v.number())
};
