"use client";

import { useEffect, useMemo, useState } from "react";
import { SKILLS_STORAGE_KEY, STARTER_SKILLS, Skill, SkillInput } from "@/lib/skills";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { skillInsert, toSkill } from "@/lib/supabase/mappers";

function readSkills() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    // Skills are stored separately so projects and memories remain untouched.
    const storedSkills = window.localStorage.getItem(SKILLS_STORAGE_KEY);
    return storedSkills ? (JSON.parse(storedSkills) as Skill[]) : [];
  } catch {
    return [];
  }
}

function writeSkills(skills: Skill[]) {
  // localStorage keeps the prompt library available after refresh in this MVP.
  window.localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(skills));
}

function createSkill(input: SkillInput): Skill {
  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
}

export function useSkills() {
  const { isConfigured, user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      async function loadSkills() {
        if (isConfigured && user && supabase) {
          const { data, error: requestError } = await supabase
            .from("skills")
            .select("*")
            .order("created_at", { ascending: false });
          if (requestError) setError(requestError.message);
          else setSkills((data ?? []).map(toSkill));
        } else {
          setSkills(readSkills());
        }
        setIsLoaded(true);
      }
      loadSkills();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isConfigured, user]);

  const addSkill = async (input: SkillInput) => {
    if (isConfigured && user && supabase) {
      const { data, error: requestError } = await supabase
        .from("skills")
        .insert(skillInsert(user.id, input))
        .select("*")
        .single();
      if (requestError) {
        setError(requestError.message);
        return null;
      }
      const skill = toSkill(data);
      setSkills((currentSkills) => [skill, ...currentSkills]);
      return skill;
    }

    const skill = createSkill(input);

    setSkills((currentSkills) => {
      const nextSkills = [skill, ...currentSkills];
      writeSkills(nextSkills);
      return nextSkills;
    });

    return skill;
  };

  const addStarterSkills = async () => {
    if (isConfigured && user && supabase) {
      const existingNames = new Set(skills.map((skill) => skill.name));
      const rows = STARTER_SKILLS.filter((skill) => !existingNames.has(skill.name)).map((skill) =>
        skillInsert(user.id, skill)
      );
      if (rows.length === 0) return;
      const { data, error: requestError } = await supabase.from("skills").insert(rows).select("*");
      if (requestError) {
        setError(requestError.message);
        return;
      }
      setSkills((currentSkills) => [...(data ?? []).map(toSkill), ...currentSkills]);
      return;
    }

    setSkills((currentSkills) => {
      const existingNames = new Set(currentSkills.map((skill) => skill.name));
      const skillsToAdd = STARTER_SKILLS.filter(
        (skill) => !existingNames.has(skill.name)
      ).map(createSkill);
      const nextSkills = [...skillsToAdd, ...currentSkills];

      writeSkills(nextSkills);
      return nextSkills;
    });
  };

  const deleteSkill = async (skillId: string) => {
    if (isConfigured && user && supabase) {
      const { error: requestError } = await supabase.from("skills").delete().eq("id", skillId);
      if (requestError) {
        setError(requestError.message);
        return;
      }
    }

    setSkills((currentSkills) => {
      const nextSkills = currentSkills.filter((skill) => skill.id !== skillId);
      writeSkills(nextSkills);
      return nextSkills;
    });
  };

  const stats = useMemo(
    () => ({
      totalSkills: skills.length,
      recentSkills: skills.slice(0, 3)
    }),
    [skills]
  );

  return {
    addSkill,
    addStarterSkills,
    deleteSkill,
    error,
    isLoaded,
    skills,
    stats
  };
}
