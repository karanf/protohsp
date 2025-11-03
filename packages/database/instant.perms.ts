// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  /**
   * Welcome to Instant's permission system!
   * Right now your rules are empty. To start filling them in, check out the docs:
   * https://www.instantdb.com/docs/permissions
   *
   * Here's an example to give you a feel:
   * posts: {
   *   allow: {
   *     view: "true",
   *     create: "isOwner",
   *     update: "isOwner",
   *     delete: "isOwner",
   *   },
   *   bind: ["isOwner", "auth.id != null && auth.id == data.ownerId"],
   * },
   */
  changeQueue: {
    allow: {
      view: "true", // Allow viewing change queue data
      create: "auth.id != null", // Allow authenticated users to create changes
      update: "auth.id != null", // Allow authenticated users to update changes
      delete: "auth.id != null", // Allow authenticated users to delete changes
    }
  }
} satisfies InstantRules;

export default rules;
