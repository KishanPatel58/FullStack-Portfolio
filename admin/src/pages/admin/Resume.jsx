import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Save,
  UploadCloud,
  Loader2,
  MapPin,
  Mail,
  Phone,
  Plus,
  Trash2,
  ExternalLink,
  CodeXml,
} from "lucide-react";
import { toJpeg } from "html-to-image";
import api from "../../api/axios";

const Resume = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [theme, setTheme] = useState("modern");

  const [profile, setProfile] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: [],
    experiences: [],
    educations: [],
    projects: [],
  });

  const resumeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/admin/me", {
          withCredentials: true,
        });

        if (isMounted && data?.admin) {
          const adm = data.admin;
          const about = adm.about || {};

          // Extract plain text string for bio/summary
          const resolvedBio =
            typeof about.aboutDesc === "string" && about.aboutDesc.trim()
              ? about.aboutDesc
              : typeof about.shortDescription === "string" && about.shortDescription.trim()
              ? about.shortDescription
              : "Experienced developer focused on designing and scaling performant web applications.";

          // Keep skill objects intact with image icons
          const resolvedSkills = Array.isArray(about.skills)
            ? about.skills.map((s) => {
                if (typeof s === "object" && s !== null) {
                  return {
                    _id: s._id || Math.random().toString(),
                    name: s.name || s.title || "Skill",
                    iconUrl:
                      s.technology?.url ||
                      s.icon?.url ||
                      (typeof s.icon === "string" ? s.icon : "") ||
                      "",
                  };
                }
                return { _id: String(s), name: String(s), iconUrl: "" };
              })
            : [];

          setProfile({
            name: adm.name || "Your Name",
            title: about.shortDescription || "Full Stack Developer",
            email: adm.email || "admin@example.com",
            phone: about.mobileNo || "",
            location: about.address || "",
            bio: resolvedBio,
            skills:
              resolvedSkills.length > 0
                ? resolvedSkills
                : [
                    { _id: "1", name: "React.js", iconUrl: "" },
                    { _id: "2", name: "Node.js", iconUrl: "" },
                    { _id: "3", name: "MongoDB", iconUrl: "" },
                    { _id: "4", name: "Express", iconUrl: "" },
                  ],
            experiences: Array.isArray(about.experience) ? about.experience : [],
            educations: Array.isArray(about.education) ? about.education : [],
            projects: Array.isArray(about.projects) ? about.projects : [],
          });
        }
      } catch (err) {
        console.error("Failed to load admin profile for resume:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFieldChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...profile.projects];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value,
    };
    setProfile((prev) => ({ ...prev, projects: updatedProjects }));
  };

  const handleSkillChange = (idx, newName) => {
    const updated = [...profile.skills];
    updated[idx] = { ...updated[idx], name: newName };
    setProfile((prev) => ({ ...prev, skills: updated }));
  };

  const addSkill = () => {
    setProfile((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        { _id: Date.now().toString(), name: "New Skill", iconUrl: "" },
      ],
    }));
  };

  const removeSkill = (idx) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      await api.put("/api/admin/resume/details", profile, {
        withCredentials: true,
      });
      alert("Resume details updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishResume = async () => {
    if (!resumeRef.current) return;
    try {
      setPublishing(true);

      // Snapshot with fallbacks to avoid 404/CORS network errors on dead ImageKit URLs
      const base64Image = await toJpeg(resumeRef.current, {
        quality: 0.85,
        pixelRatio: 1.5,
        backgroundColor: "#ffffff",
        cacheBust: true,
        filter: (node) => {
          if (node.tagName === "IMG") {
            // Drop elements that failed to load or are marked as broken
            if (!node.src || node.dataset.failed === "true" || node.style.display === "none") {
              return false;
            }
          }
          return true;
        },
        // 1x1 transparent fallback pixel if an image fails fetching midway
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      });

      const { data } = await api.post(
        "/api/admin/resume/publish",
        { imageBase64: base64Image },
        { withCredentials: true }
      );

      if (data?.success) {
        alert("Resume snapshot published to ImageKit and saved!");
      }
    } catch (err) {
      console.error("Publish error:", err);
      alert(
        "Failed to publish resume snapshot: " +
          (err?.response?.data?.message || err.message)
      );
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#dadada]">
        <div className="flex flex-col items-center gap-2.5 text-black/50">
          <Loader2 size={26} className="animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider">
            Loading Resume...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-[#dadada] text-black antialiased">
      {/* Top Header / Controls */}
      <div className="w-full h-16 border-b border-[#0000009b] bg-[#dadada] flex items-center justify-between px-6 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">
              Interactive Resume Editor
            </h1>
            <p className="text-[11px] text-black/40 mt-1">
              Click elements to edit inline, then save or publish
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/40 p-1 rounded-lg border border-black/15">
            <button
              type="button"
              onClick={() => setTheme("modern")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                theme === "modern"
                  ? "bg-black text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              Modern
            </button>
            <button
              type="button"
              onClick={() => setTheme("classic")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                theme === "classic"
                  ? "bg-black text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              Classic
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={saving || publishing}
            className="h-9 px-3 rounded-lg border border-black/20 bg-white/60 hover:bg-black hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>

          <button
            type="button"
            onClick={handlePublishResume}
            disabled={saving || publishing}
            className="h-9 px-3.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-40"
          >
            {publishing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <UploadCloud size={14} />
            )}
            <span>{publishing ? "Publishing..." : "Publish Resume"}</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        <div
          ref={resumeRef}
          className={`w-full max-w-3xl min-h-[1050px] bg-white text-black shadow-xl rounded-sm p-8 sm:p-12 transition-all ${
            theme === "classic"
              ? "font-serif border-t-8 border-neutral-800"
              : "font-sans"
          }`}
        >
          {/* Header Block */}
          <div
            className={`flex flex-col gap-2 pb-6 border-b ${
              theme === "classic"
                ? "border-neutral-400 text-center"
                : "border-black/10 text-left"
            }`}
          >
            <InlineInput
              value={profile.name}
              onChange={(val) => handleFieldChange("name", val)}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-black"
            />
            <InlineInput
              value={profile.title}
              onChange={(val) => handleFieldChange("title", val)}
              className="text-sm sm:text-base font-medium text-black/60 uppercase tracking-widest"
            />

            {/* Contact Details */}
            <div
              className={`flex flex-wrap gap-4 pt-2 text-xs text-black/70 ${
                theme === "classic" ? "justify-center" : "justify-start"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Mail size={12} className="text-black/40 shrink-0" />
                <InlineInput
                  value={profile.email}
                  onChange={(val) => handleFieldChange("email", val)}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={12} className="text-black/40 shrink-0" />
                <InlineInput
                  value={profile.phone}
                  onChange={(val) => handleFieldChange("phone", val)}
                  placeholder="Add phone..."
                />
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-black/40 shrink-0" />
                <InlineInput
                  value={profile.location}
                  onChange={(val) => handleFieldChange("location", val)}
                  placeholder="Add address..."
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="mt-6">
            <h2
              className={`text-xs font-bold uppercase tracking-wider text-black pb-1 mb-2 ${
                theme === "classic"
                  ? "border-b border-black/20 text-center"
                  : "border-b border-black/10"
              }`}
            >
              Professional Summary
            </h2>
            <InlineTextarea
              value={profile.bio}
              onChange={(val) => handleFieldChange("bio", val)}
              className="text-xs leading-relaxed text-black/80"
            />
          </div>

          {/* Skills Section with Image Icons */}
          <div className="mt-6">
            <div className="flex items-center justify-between border-b border-black/10 pb-1 mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                Core Competencies & Skills
              </h2>
              <button
                type="button"
                onClick={addSkill}
                className="text-[11px] text-black/50 hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} /> Add Skill
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {profile.skills.map((skill, idx) => {
                const skillName = typeof skill === "object" ? skill.name : skill;
                const iconUrl = typeof skill === "object" ? skill.iconUrl : "";

                return (
                  <div
                    key={skill._id || idx}
                    className="group flex items-center gap-1.5 bg-black/[0.04] hover:bg-black/[0.08] px-2 py-1 rounded-md text-xs text-black border border-black/10 transition-colors"
                  >
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={skillName}
                        crossOrigin="anonymous"
                        className="w-3.5 h-3.5 object-contain rounded-xs shrink-0"
                        onError={(e) => {
                          e.currentTarget.dataset.failed = "true";
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}

                    <InlineInput
                      value={skillName}
                      onChange={(val) => handleSkillChange(idx, val)}
                      className="font-medium leading-none"
                    />

                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 ml-0.5 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Work Experience Section */}
          {profile.experiences.length > 0 && (
            <div className="mt-6">
              <h2
                className={`text-xs font-bold uppercase tracking-wider text-black pb-1 mb-3 ${
                  theme === "classic"
                    ? "border-b border-black/20 text-center"
                    : "border-b border-black/10"
                }`}
              >
                Work Experience
              </h2>
              <div className="space-y-4">
                {profile.experiences.map((exp, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-baseline flex-wrap">
                      <span className="text-xs font-bold text-black">
                        {exp.designation || exp.role} @ {exp.companyName || exp.company}
                      </span>
                      <span className="text-[10px] text-black/50 font-medium">
                        {exp.joiningDate || "—"} -{" "}
                        {exp.currentlyWorkingHere
                          ? "Present"
                          : exp.endDate || "—"}
                      </span>
                    </div>
                    {exp.work?.points && (
                      <ul className="list-disc pl-4 mt-1 space-y-1 text-[11px] text-black/80">
                        {(Array.isArray(exp.work.points)
                          ? exp.work.points
                          : [exp.work.points]
                        ).map((pt, ptIdx) => (
                          <li key={ptIdx}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Projects (Short description + Tech Stack Badges & Icons) */}
          {profile.projects.length > 0 && (
            <div className="mt-6">
              <h2
                className={`text-xs font-bold uppercase tracking-wider text-black pb-1 mb-3 ${
                  theme === "classic"
                    ? "border-b border-black/20 text-center"
                    : "border-b border-black/10"
                }`}
              >
                Featured Projects
              </h2>
              <div className="space-y-4">
                {profile.projects.map((proj, idx) => {
                  const techList = Array.isArray(proj.techStack)
                    ? proj.techStack
                    : [];

                  return (
                    <div
                      key={proj._id || idx}
                      className="flex flex-col gap-1 pb-3 last:pb-0 border-b border-black/5 last:border-b-0"
                    >
                      <div className="flex justify-between items-baseline flex-wrap gap-2">
                        <InlineInput
                          value={proj.name}
                          onChange={(val) => handleProjectChange(idx, "name", val)}
                          className="text-xs font-bold text-black"
                        />

                        <div className="flex items-center gap-3 text-[10px] text-black/50">
                          {proj.githubLink && proj.githubLink !== "#" && (
                            <span className="flex items-center gap-1 hover:text-black">
                              <CodeXml size={11} /> Code
                            </span>
                          )}
                          {proj.publicLink && proj.publicLink !== "#" && (
                            <span className="flex items-center gap-1 hover:text-black">
                              <ExternalLink size={11} /> Live Demo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Project Short Description */}
                      <InlineTextarea
                        value={proj.shortdesc || proj.desc}
                        onChange={(val) => handleProjectChange(idx, "shortdesc", val)}
                        className="text-[11px] leading-relaxed text-black/80"
                      />

                      {/* Tech Stack Badges with Logo Images */}
                      {techList.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {techList.map((stack, sIdx) => {
                            const iconUrl =
                              stack?.icon?.url ||
                              (typeof stack?.icon === "string" ? stack.icon : "") ||
                              stack?.imageUrl ||
                              "";
                            const stackName = stack?.name || stack;

                            return (
                              <div
                                key={stack._id || sIdx}
                                className="flex items-center gap-1 bg-black/[0.04] border border-black/10 px-1.5 py-0.5 rounded-full text-[10px] text-black/85"
                              >
                                {iconUrl ? (
                                  <img
                                    src={iconUrl}
                                    alt={stackName}
                                    crossOrigin="anonymous"
                                    className="w-3 h-3 rounded-full object-contain shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.dataset.failed = "true";
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : null}
                                <span className="font-medium leading-none">
                                  {stackName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Education Section */}
          {profile.educations.length > 0 && (
            <div className="mt-6">
              <h2
                className={`text-xs font-bold uppercase tracking-wider text-black pb-1 mb-3 ${
                  theme === "classic"
                    ? "border-b border-black/20 text-center"
                    : "border-b border-black/10"
                }`}
              >
                Education
              </h2>
              <div className="space-y-3">
                {profile.educations.map((edu, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-baseline flex-wrap"
                  >
                    <div>
                      <span className="text-xs font-bold text-black">
                        {edu.study || edu.std}
                      </span>
                      <p className="text-[11px] text-black/70">
                        {edu.instituteName || edu.schoolOrCollege}
                      </p>
                    </div>
                    <span className="text-[10px] text-black/50 font-medium">
                      {edu.passedYear
                        ? new Date(edu.passedYear).getFullYear()
                        : edu.currentlyStudying
                        ? "Present"
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Inline Editable Single-Line Input
const InlineInput = ({
  value,
  onChange,
  placeholder = "Click to edit...",
  className = "",
}) => {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value || "");

  useEffect(() => {
    setTemp(value || "");
  }, [value]);

  if (editing) {
    return (
      <input
        type="text"
        autoFocus
        value={temp}
        onChange={(e) => setTemp(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onChange(temp);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            onChange(temp);
          }
        }}
        className={`bg-blue-50 border border-blue-400 rounded px-1 text-black outline-none ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      className={`cursor-pointer hover:bg-black/5 rounded px-0.5 transition-colors ${className}`}
    >
      {value || placeholder}
    </span>
  );
};

// Inline Editable Multi-Line Textarea
const InlineTextarea = ({ value, onChange, className = "" }) => {
  const displayValue =
    typeof value === "object" ? value?.aboutDesc || "" : String(value || "");

  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(displayValue);

  useEffect(() => {
    setTemp(displayValue);
  }, [displayValue]);

  if (editing) {
    return (
      <textarea
        autoFocus
        rows={2}
        value={temp}
        onChange={(e) => setTemp(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onChange(temp);
        }}
        className={`w-full bg-blue-50 border border-blue-400 rounded p-1 text-black outline-none ${className}`}
      />
    );
  }

  return (
    <p
      onClick={() => setEditing(true)}
      title="Click to edit"
      className={`cursor-pointer hover:bg-black/5 rounded p-0.5 transition-colors whitespace-pre-wrap ${className}`}
    >
      {displayValue || "Click to add description..."}
    </p>
  );
};

export default Resume;