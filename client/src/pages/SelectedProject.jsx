import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { CodeXml, ExternalLink } from "lucide-react";
import api from "../api/axios";

const SelectedProject = () => {
  const params = useParams();
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProjectDetails = async () => {
      if (!params?.id) {
        if (isMounted) setSelectedProject(null);
        return;
      }

      try {
        const { data } = await api.get(`/api/portfolio/projects/${params.id}`);

        const project =
          data?.project ||
          data?.data ||
          (data?.success && data?.project ? data.project : null);

        if (isMounted && project && Boolean(project.name?.trim())) {
          setSelectedProject(project);
        } else if (isMounted) {
          setSelectedProject(null);
        }
      } catch (error) {
        console.error("Failed to fetch project details:", error);
        if (isMounted) setSelectedProject(null);
      }
    };

    fetchProjectDetails();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (!selectedProject) {
    return null;
  }

  const projectImage =
    selectedProject.image?.url ||
    (typeof selectedProject.image === "string" ? selectedProject.image : "");
  const techList = Array.isArray(selectedProject.techStack)
    ? selectedProject.techStack
    : [];
  const coreFeatures = Array.isArray(selectedProject.coreFeatures)
    ? selectedProject.coreFeatures
    : [];

  return (
    <div className="w-full h-auto mt-15 flex items-center justify-center flex-col pb-16 antialiased">
      {/* Project Image */}
      {projectImage && (
        <motion.img
          src={projectImage}
          alt={selectedProject.name}
          className="mx-auto w-[90%] object-cover rounded-lg"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      {/* Project Title */}
      <motion.h1
        className="w-[90%] text-left text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl mt-3 font-semibold"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {selectedProject.name}_
      </motion.h1>

      {/* Tech Stack */}
      {techList.length > 0 && (
        <>
          <motion.h1
            className="w-[90%] text-left text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl mt-5 font-semibold"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Tech Stack_
          </motion.h1>

          <div className="w-[90%] flex flex-wrap justify-start items-start gap-2 mt-3">
            {techList.map((stack, idx) => {
              const iconUrl = stack?.icon?.url || stack?.icon;
              const stackName = stack?.name || stack;

              return (
                <motion.span
                  key={stack._id || idx}
                  className="flex items-center justify-center gap-1.5 border relative w-auto h-auto rounded-full px-2.5 py-1.5"
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                >
                  {iconUrl && (
                    <img
                      src={iconUrl}
                      alt={stackName}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-contain"
                    />
                  )}
                  <p className="text-xs sm:text-sm md:text-base">{stackName}</p>
                </motion.span>
              );
            })}
          </div>
        </>
      )}

      {/* Description */}
      {selectedProject.desc && (
        <>
          <motion.h1
            className="w-[90%] text-left text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl mt-6 font-semibold"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            Description_
          </motion.h1>

          <motion.p
            className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl mt-3 text-justify w-[90%] leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {selectedProject.desc}
          </motion.p>
        </>
      )}

      {/* Core Features */}
      {coreFeatures.length > 0 && (
        <>
          <motion.h1
            className="w-[90%] text-left text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl mt-6 font-semibold"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            Core Features_
          </motion.h1>

          <div className="w-[90%] mt-3">
            {coreFeatures.map((feature, idx) => {
              const descriptions = Array.isArray(feature?.description)
                ? feature.description
                : [];

              return (
                <motion.div
                  key={`${feature.title}-${idx}`}
                  className="mt-5"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                >
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-black">
                    {feature.title}_
                  </h2>

                  {/* Primary Feature Description Block */}
                  <div className="w-full mt-2.5 space-y-3 pl-2 sm:pl-3">
                    {descriptions.map((descItem, index) => (
                      <div key={index} className="flex flex-col gap-1.5">
                        {descItem?.desc && (
                          <div className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-2" />
                            <span className="text-xs sm:text-sm md:text-base leading-relaxed text-black">
                              {descItem.desc}
                            </span>
                          </div>
                        )}

                        {/* Nested Points List */}
                        {Array.isArray(descItem?.points) &&
                          descItem.points.length > 0 && (
                            <div className="w-full pl-5 sm:pl-6 space-y-1.5 mt-0.5">
                              {descItem.points.map((point, ind) => (
                                <div
                                  key={ind}
                                  className="flex items-start gap-2"
                                >
                                  <span className="w-1 h-1 rounded-full bg-black/70 shrink-0 mt-2" />
                                  <span className="text-xs sm:text-sm md:text-base leading-relaxed text-black/90">
                                    {point}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Links */}
      {(selectedProject.githubLink || selectedProject.publicLink) && (
        <>
          <motion.h1
            className="w-[90%] text-left text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl mt-8 font-semibold"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            Links_
          </motion.h1>

          <motion.div
            className="w-[90%] flex justify-start items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-full left-0 bottom-0 flex items-center justify-start mt-3 gap-3 mb-6 sm:w-[50vh]">
              {selectedProject.githubLink &&
                selectedProject.githubLink !== "#" && (
                  <a
                    href={selectedProject.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-1/2 h-auto py-2 sm:py-2.5 bg-black text-white flex items-center justify-center gap-2 border border-black rounded-lg text-xs sm:text-sm md:text-base hover:bg-zinc-800 transition-colors"
                  >
                    Code <CodeXml size={18} />
                  </a>
                )}
              {selectedProject.publicLink &&
                selectedProject.publicLink !== "#" && (
                  <a
                    href={selectedProject.publicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-1/2 h-auto py-2 sm:py-2.5 flex items-center justify-center gap-2 border border-black rounded-lg text-xs sm:text-sm md:text-base hover:bg-black hover:text-white transition-colors"
                  >
                    Live Demo <ExternalLink size={18} />
                  </a>
                )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default SelectedProject;