"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PreferenceQuestionnaire } from "./preference-questionnaire";
import { Button } from "@/components/ui/button";

export function RevisePreferences() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="w-full basis-full">
        <PreferenceQuestionnaire
          compact
          onComplete={() => {
            setEditing(false);
            router.refresh();
          }}
        />
        <Button
          type="button"
          variant="ghost"
          className="mt-2"
          onClick={() => setEditing(false)}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setEditing(true)}
      className="text-gemma"
    >
      Revise preferences
    </Button>
  );
}
