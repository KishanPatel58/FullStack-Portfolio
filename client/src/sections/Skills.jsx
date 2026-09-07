import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Heading from "../components/ui/Heading";
import VanillaTilt from "vanilla-tilt";
import api from "../api/axios";

const Skills = () => {
  const [skills, setSkills] = useState(null);

  const fetchSkills = async () => {
    try {
      const { data } = await api.get("/api/portfolio/skills");
      if (data?.success) {
        setSkills(data.skills);
      }
    } catch (error) {
      console.error("Failed to Fetch Skills:", error);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Group flat array of skills by category
  const groupedSkills = useMemo(() => {
    if (!Array.isArray(skills)) return [];

    // If backend already returns grouped data [{ category, skills: [] }]
    if (skills.length > 0 && Array.isArray(skills[0]?.skills)) {
      return skills;
    }

    // Transform flat array into category groups
    const groups = {};
    skills.forEach((item) => {
      const catName =
        item?.category?.name ||
        (typeof item?.category === "string" ? item.category : "General");
      const catId = item?.category?._id || catName;

      if (!groups[catId]) {
        groups[catId] = {
          category: { name: catName, _id: catId },
          skills: [],
        };
      }

      groups[catId].skills.push({
        _id: item._id,
        name: item.name,
        icon: item?.technology?.url || item?.icon || "",
        level: item.level,
        levelOfKnowledge: item.levelOfKnowledge,
      });
    });

    return Object.values(groups);
  }, [skills]);

  // Initialize VanillaTilt only after cards exist in DOM
  useEffect(() => {
    if (groupedSkills.length > 0) {
      const cards = document.querySelectorAll(".card");
      if (cards.length > 0) {
        VanillaTilt.init(cards, {
          max: 7,
          speed: 10,
          glare: true,
          "max-glare": 0.5,
        });
      }
    }
  }, [groupedSkills]);
  
  return (
    <div className="relative flex flex-col justify-start items-start gap-2 w-[90%]">
      <motion.h1
        className="w-full text-start text-3xl mt-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Skills<span className="animate-pulse">_</span>
      </motion.h1>

      <div className="w-full flex flex-col justify-center items-center gap-5 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-3">
        {groupedSkills.map((group, idx) => (
          <motion.div
            key={group?.category?._id || idx}
            className="card bg-[#dadada] relative w-full h-auto border sm:h-full flex flex-col items-center justify-start gap-2 p-4 rounded-lg"
            initial={{
              opacity: 0,
              x: idx % 2 === 0 ? -80 : 80,
              scale: 0.95,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.55,
              delay: idx * 0.12,
              ease: "easeOut",
            }}
          >
            <div className="w-full text-center mb-4">
              <Heading title={group?.category?.name || "Skills"} />
            </div>

            <div className="w-full flex items-start justify-start flex-1">
              <div className="h-auto w-full flex flex-wrap gap-2">
                {group?.skills?.map((sk, skillIdx) => (
                  <motion.span
                    key={sk._id || skillIdx}
                    className="h-10 w-auto shrink-0 inline-flex items-center justify-center gap-2 p-2 border rounded-lg relative bg-[#dadada]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.3,
                      delay: skillIdx * 0.06,
                    }}
                  >
                    <p className="text-xs font-semibold">{sk.name}</p>
                    {sk.icon && (
                      <img
                        src={sk.icon}
                        className="w-5 h-5 object-contain rounded"
                        alt={sk.name}
                      />
                    )}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Skills;