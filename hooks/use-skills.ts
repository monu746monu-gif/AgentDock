"use client";

import { useEffect, useMemo, useState } from "react";
import { SKILLS_STORAGE_KEY, STARTER_SKILLS, Skill, SkillInput } from "@/lib/skills";

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
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSkills(readSkills());
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const addSkill = (input: SkillInput) => {
    const skill = createSkill(input);

    setSkills((currentSkills) => {
      const nextSkills = [skill, ...currentSkills];
      writeSkills(nextSkills);
      return nextSkills;
    });

    return skill;
  };

  const addStarterSkills = () => {
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

  const deleteSkill = (skillId: string) => {
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
    isLoaded,
    skills,
    stats
  };
}
