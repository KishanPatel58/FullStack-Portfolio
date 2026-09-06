import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";

const GithubIcon = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const SelectedProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/api/admin/projects/${id}`, {
          withCredentials: true,
        });

        if (data?.success && data?.project) {
          setProject(data.project);
        } else {
          setError("Project details not found.");
        }
      } catch (err) {
        console.error("Error fetching single project:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load project details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#dadada] flex flex-col items-center justify-center p-6 text-black">
        <Loader2 size={32} className="animate-spin text-black/50" />
        <p className="text-sm font-medium text-black/60 mt-3">
          Loading project details...
        </p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-full min-h-screen bg-[#dadada] flex flex-col items-center justify-center p-6 text-black">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-black/10 shadow-sm text-center">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-black mb-1">Error Occurred</h2>
          <p className="text-xs text-black/60 mb-6">{error || "Project not found"}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-black text-white text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#dadada] text-black antialiased">
      {/* TOP BAR NAVIGATION */}
      <div className="w-full min-h-[56px] py-3 border-b border-black/50 bg-[#dadada] flex items-center justify-between px-6 sm:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold hover:opacity-60 transition-opacity cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <div className="flex items-center gap-2">
          {project.githubLink && project.githubLink !== "#" && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-lg border border-black/30 bg-[#dadada] flex items-center gap-1.5 text-xs font-medium hover:bg-black hover:text-white transition-colors"
            >
              <GithubIcon size={13} /> Code
            </a>
          )}
          {project.publicLink && project.publicLink !== "#" && (
            <a
              href={project.publicLink}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-lg bg-black text-white flex items-center gap-1.5 text-xs font-medium hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink size={13} /> Live Preview
            </a>
          )}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto p-5 sm:p-8 space-y-6">
        {/* HERO CARD */}
        <div className="w-full bg-[#dadada] border border-black/25 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {project?.image?.url && (
              <div className="w-full md:w-64 h-48 rounded-xl border border-black/40 overflow-hidden bg-white shrink-0">
                <img
                  src={project.image.url}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                {project.name}
              </h1>
              <p className="text-sm font-medium text-black/70 mt-2 leading-relaxed">
                {project.shortdesc}
              </p>

              {/* TECH STACK CHIPS WITH IMAGES */}
              {project?.techStack?.length > 0 && (
                <div className="mt-5">
                  <span className="block text-[11px] uppercase tracking-wider font-semibold text-black/50 mb-2">
                    Technologies
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, i) => {
                      const techName = typeof tech === "object" ? tech.name : tech;
                      const techIcon = typeof tech === "object" ? tech.icon?.url : null;

                      return (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-black/25 bg-white/70 text-xs font-medium text-black shadow-2xs"
                        >
                          {techIcon ? (
                            <img
                              src={techIcon}
                              alt={techName}
                              className="w-4 h-4 object-contain rounded-xs"
                            />
                          ) : (
                            <Layers size={13} className="text-black/50 shrink-0" />
                          )}
                          <span>{techName}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FULL OVERVIEW */}
        <div className="w-full bg-[#dadada] border border-black/25 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold uppercase tracking-wider text-black mb-3">
            Project Overview
          </h2>
          <p className="text-sm text-black/80 leading-relaxed whitespace-pre-line">
            {project.desc}
          </p>
        </div>

        {/* CORE FEATURES DETAILED BREAKDOWN */}
        {project?.coreFeatures?.length > 0 && (
          <div className="w-full bg-[#dadada] border border-black/25 rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-bold uppercase tracking-wider text-black mb-6">
              Core Architecture & Features
            </h2>

            <div className="space-y-6">
              {project.coreFeatures.map((feat, fIdx) => (
                <div
                  key={fIdx}
                  className="p-5 rounded-xl border border-black/20 bg-black/[0.02]"
                >
                  <h3 className="text-base font-semibold text-black flex items-center gap-2">
                    {feat.title}
                  </h3>

                  <div className="mt-3 space-y-3">
                    {feat.description?.map((descObj, dIdx) => (
                      <div key={dIdx} className="space-y-2">
                        {descObj.desc && (
                          <p className="text-xs sm:text-sm text-black/75 leading-relaxed">
                            {descObj.desc}
                          </p>
                        )}

                        {descObj.points?.length > 0 && (
                          <ul className="pl-4 space-y-1.5">
                            {descObj.points.map((pt, pIdx) => (
                              <li
                                key={pIdx}
                                className="text-xs text-black/70 list-disc leading-relaxed"
                              >
                                {pt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedProjectPage;