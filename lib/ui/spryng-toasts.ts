"use client";

import { toast } from "sonner";

export const SpryngToasts = {
  goalSet() {
    toast.success("Nice work — goal set", {
      description: "We’ll guide you step-by-step toward your first hire.",
    });
  },

  dueDateSaved(date: string) {
    toast.success("Deadline saved", {
      description: `First report due date set to ${date}.`,
    });
  },

  proofSaved(fileName?: string) {
    toast.success("Nice work — proof saved", {
      description: fileName
        ? `${fileName} is now stored in your Proof Vault.`
        : "Your confirmation is now stored in your Proof Vault.",
    });
  },

  registrationSubmitted() {
    toast.success("Great progress — submitted", {
      description: "We logged your submission. Next: watch for state follow-ups.",
    });
  },

  registrationCompleted() {
    toast.success("Congratulations — you’re set up", {
      description: "Employer registration is complete. Your record is audit-ready.",
    });
  },
};
