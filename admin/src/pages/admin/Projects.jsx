import {
  FolderGit2,
  Pencil,
  PencilSparkles,
  Plus,
  Trash2,
  X,
  Upload,
  Loader2,
  RefreshCw,
  ExternalLink,
  Eye,
  Link as LinkIcon,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UseAdmin } from "../../context/AdminContext";
import api from "../../api/axios";

const initialFormData = {
  name: "",
  shortdesc: "",
  desc: "",
  githubLink: "#",
  publicLink: "#",
  image: null,
  techStack: [], // Array of TechStack ObjectIds
  coreFeatures: [
    {
      title: "",
      description: [{ desc: "", points: [] }],
    },
  ],
};

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

const Projects = () => {
  const { admin } = UseAdmin();
  void admin;
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================
  const [projects, setProjects] = useState([]);
  const [availableTechs, setAvailableTechs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  // Standalone Tech Form State
  const [newTechName, setNewTechName] = useState("");
  const [techMode, setTechMode] = useState("file");
  const [newTechFile, setNewTechFile] = useState(null);
  const [newTechUrl, setNewTechUrl] = useState("");
  const [techActionLoading, setTechActionLoading] = useState(false);

  // Modals
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Form State
  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  // =========================================================
  // TECH STACK SELECTION
  // =========================================================
  const handleToggleTechSelection = (techId) => {
    setFormData((prev) => {
      const exists = prev.techStack.includes(techId);
      const updated = exists
        ? prev.techStack.filter((id) => id !== techId)
        : [...prev.techStack, techId];
      return { ...prev, techStack: updated };
    });
  };

  // =========================================================
  // CORE FEATURES (DEEP NESTED HANDLERS)
  // =========================================================
  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      coreFeatures: [
        ...prev.coreFeatures,
        { title: "", description: [{ desc: "", points: [] }] },
      ],
    }));
  };

  const handleRemoveFeature = (fIdx) => {
    setFormData((prev) => ({
      ...prev,
      coreFeatures: prev.coreFeatures.filter((_, i) => i !== fIdx),
    }));
  };

  const handleFeatureTitleChange = (fIdx, value) => {
    setFormData((prev) => {
      const updated = [...prev.coreFeatures];
      updated[fIdx].title = value;
      return { ...prev, coreFeatures: updated };
    });
  };

  const handleAddDescriptionBlock = (fIdx) => {
    setFormData((prev) => {
      const updated = [...prev.coreFeatures];
      updated[fIdx].description.push({ desc: "", points: [] });
      return { ...prev, coreFeatures: updated };
    });
  };

  const handleRemoveDescriptionBlock = (fIdx, dIdx) => {
    setFormData((prev) => {
      const updated = [...prev.coreFeatures];
      updated[fIdx].description = updated[fIdx].description.filter(
        (_, i) => i !== dIdx
      );
      return { ...prev, coreFeatures: updated };
    });
  };

  const handleDescriptionTextChange = (fIdx, dIdx, value) => {
    setFormData((prev) => {
      const updated = [...prev.coreFeatures];
      updated[fIdx].description[dIdx].desc = value;
      return { ...prev, coreFeatures: updated };
    });
  };

  const handleAddPointToDesc = (fIdx, dIdx) => {
    setFormData((prev) => {
      const updated = [...prev.coreFeatures];
      if (!Array.isArray(updated[fIdx].description[dIdx].points)) {
        updated[fIdx].description[dIdx].points = [];
      }
      updated[fIdx].description[dIdx].points.push("");
      return { ...prev, coreFeatures: updated };
    });
  };

  const handleRemovePointFromDesc = (fIdx, dIdx, pIdx) => {
    setFormData((prev) => {
      const updated = [...prev.coreFeatures];
      updated[fIdx].description[dIdx].points = updated[fIdx].description[
        dIdx
      ].points.filter((_, i) => i !== pIdx);
      return { ...prev, coreFeatures: updated };
    });
  };

  const handlePointTextChange = (fIdx, dIdx, pIdx, value) => {
    setFormData((prev) => {
      const updated = [...prev.coreFeatures];
      updated[fIdx].description[dIdx].points[pIdx] = value;
      return { ...prev, coreFeatures: updated };
    });
  };

  // =========================================================
  // FETCH
  // =========================================================
  const fetchAllData = async () => {
    try {
      setFetchLoading(true);
      setError("");

      const [projRes, techRes] = await Promise.all([
        api.get("/api/admin/projects", { withCredentials: true }),
        api.get("/api/admin/techstack", { withCredentials: true }),
      ]);

      if (projRes.data?.success) {
        setProjects(Array.isArray(projRes.data?.projects) ? projRes.data.projects : []);
      }
      if (techRes.data?.success) {
        setAvailableTechs(Array.isArray(techRes.data?.techStacks) ? techRes.data.techStacks : []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load projects.");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // =========================================================
  // TECH ACTIONS
  // =========================================================
  const handleCreateTech = async (e) => {
    e.preventDefault();
    if (!newTechName.trim()) return;

    try {
      setTechActionLoading(true);
      const body = new FormData();
      body.append("name", newTechName.trim());

      if (techMode === "file" && newTechFile) {
        body.append("icon", newTechFile);
      } else if (techMode === "url" && newTechUrl.trim()) {
        body.append("iconUrl", newTechUrl.trim());
      }

      const { data } = await api.post("/api/admin/techstack/add", body, {
        withCredentials: true,
      });

      if (data?.success) {
        setAvailableTechs((prev) => [...prev, data.techStack]);
        setNewTechName("");
        setNewTechFile(null);
        setNewTechUrl("");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add tech stack");
    } finally {
      setTechActionLoading(false);
    }
  };

  const handleDeleteTech = async (techId) => {
    if (!window.confirm("Removing this tech stack will remove it from all linked projects. Continue?")) {
      return;
    }

    try {
      const { data } = await api.delete(`/api/admin/techstack/${techId}/delete`, {
        withCredentials: true,
      });
      if (data?.success) {
        setAvailableTechs((prev) => prev.filter((t) => t._id !== techId));
        const projRes = await api.get("/api/admin/projects", { withCredentials: true });
        if (projRes.data?.success) {
          setProjects(projRes.data.projects || []);
        }
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete tech stack");
    }
  };

  // =========================================================
  // MODAL CONTROLS
  // =========================================================
  const handleOpenAddForm = () => {
    resetForm();
    setSelectedProject(null);
    setShowUpdateForm(false);
    setShowAddForm(true);
    setError("");
  };

  const handleCloseAddForm = () => {
    if (loading) return;
    setShowAddForm(false);
    resetForm();
    setError("");
  };

  const handleOpenEditForm = (proj) => {
    if (!proj?._id) {
      setError("Project ID not found.");
      return;
    }

    const currentTechIds = Array.isArray(proj.techStack)
      ? proj.techStack.map((item) => (typeof item === "object" ? item._id : item))
      : [];

    const formattedFeatures =
      proj?.coreFeatures?.length > 0
        ? proj.coreFeatures.map((f) => ({
            title: f.title || "",
            description: Array.isArray(f.description)
              ? f.description.map((d) => ({
                  desc: d.desc || "",
                  points: Array.isArray(d.points) ? d.points : [],
                }))
              : [{ desc: "", points: [] }],
          }))
        : [{ title: "", description: [{ desc: "", points: [] }] }];

    setFormData({
      name: proj?.name || "",
      shortdesc: proj?.shortdesc || "",
      desc: proj?.desc || "",
      githubLink: proj?.githubLink || "#",
      publicLink: proj?.publicLink || "#",
      image: null,
      techStack: currentTechIds,
      coreFeatures: formattedFeatures,
    });

    setSelectedProject(proj);
    setShowAddForm(false);
    setShowUpdateForm(true);
    setError("");
  };

  const handleCloseUpdateForm = () => {
    if (loading) return;
    setShowUpdateForm(false);
    setSelectedProject(null);
    resetForm();
    setError("");
  };

  const sanitizeCoreFeatures = (features) => {
    return features
      .filter((f) => f.title.trim() !== "")
      .map((f) => ({
        title: f.title.trim(),
        description: f.description
          .map((d) => ({
            desc: d.desc.trim(),
            points: Array.isArray(d.points)
              ? d.points.map((p) => p.trim()).filter(Boolean)
              : [],
          }))
          .filter((d) => d.desc !== "" || d.points.length > 0),
      }));
  };

  // =========================================================
  // SUBMIT ADD PROJECT
  // =========================================================
  const handleAddProject = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!formData.name.trim()) throw new Error("Project name is required.");
      if (!formData.shortdesc.trim()) throw new Error("Short description is required.");
      if (!formData.desc.trim()) throw new Error("Full description is required.");

      const cleanFeatures = sanitizeCoreFeatures(formData.coreFeatures);

      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("shortdesc", formData.shortdesc.trim());
      data.append("desc", formData.desc.trim());
      data.append("githubLink", formData.githubLink.trim());
      data.append("publicLink", formData.publicLink.trim());
      data.append("techStack", JSON.stringify(formData.techStack));
      data.append("coreFeatures", JSON.stringify(cleanFeatures));

      if (formData.image) {
        data.append("image", formData.image);
      }

      const response = await api.post("/api/admin/projects/add", data, {
        withCredentials: true,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to add project.");
      }

      const projRes = await api.get("/api/admin/projects", { withCredentials: true });
      if (projRes.data?.success) {
        setProjects(projRes.data.projects || []);
      }

      setShowAddForm(false);
      resetForm();
    } catch (err) {
      console.error("Add project error:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to add project.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SUBMIT UPDATE PROJECT
  // =========================================================
  const handleUpdateProject = async (e) => {
    e.preventDefault();

    if (!selectedProject?._id) {
      setError("Project ID not found.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (!formData.name.trim()) throw new Error("Project name is required.");
      if (!formData.shortdesc.trim()) throw new Error("Short description is required.");
      if (!formData.desc.trim()) throw new Error("Full description is required.");

      const cleanFeatures = sanitizeCoreFeatures(formData.coreFeatures);

      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("shortdesc", formData.shortdesc.trim());
      data.append("desc", formData.desc.trim());
      data.append("githubLink", formData.githubLink.trim());
      data.append("publicLink", formData.publicLink.trim());
      data.append("techStack", JSON.stringify(formData.techStack));
      data.append("coreFeatures", JSON.stringify(cleanFeatures));

      if (formData.image) {
        data.append("image", formData.image);
      }

      const response = await api.put(
        `/api/admin/projects/${selectedProject._id}/update`,
        data,
        { withCredentials: true }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to update project.");
      }

      const projRes = await api.get("/api/admin/projects", { withCredentials: true });
      if (projRes.data?.success) {
        setProjects(projRes.data.projects || []);
      }

      setShowUpdateForm(false);
      setSelectedProject(null);
      resetForm();
    } catch (err) {
      console.error("Update project error:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to update project.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DELETE PROJECT
  // =========================================================
  const handleDeleteProject = async (project) => {
    if (!project?._id) {
      setError("Project ID not found.");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${project.name}"?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.delete(`/api/admin/projects/${project._id}/delete`, {
        withCredentials: true,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to delete project.");
      }

      setProjects((prev) => prev.filter((item) => item._id !== project._id));

      if (selectedProject?._id === project._id) {
        setShowUpdateForm(false);
        setSelectedProject(null);
        resetForm();
      }
    } catch (err) {
      console.error("Delete project error:", err);
      setError(err?.message || "Failed to delete project.");
    } finally {
      setLoading(false);
    }
  };

  const renderProjectFormFields = () => (
    <>
      {/* NAME */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-2">Project Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Social-Media Automation"
          required
          className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm bg-white"
        />
      </div>

      {/* SHORT DESC */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-2">
          Short Description (1-2 lines)
        </label>
        <textarea
          name="shortdesc"
          value={formData.shortdesc}
          onChange={handleInputChange}
          placeholder="A brief summary shown on tables and preview cards..."
          rows={2}
          required
          className="w-full px-3 py-2 rounded-lg border border-black/15 outline-none focus:border-black text-sm resize-none bg-white"
        />
      </div>

      {/* FULL DESC */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-2">
          Full Detailed Description
        </label>
        <textarea
          name="desc"
          value={formData.desc}
          onChange={handleInputChange}
          placeholder="Comprehensive project overview..."
          rows={4}
          required
          className="w-full px-3 py-2 rounded-lg border border-black/15 outline-none focus:border-black text-sm resize-none bg-white"
        />
      </div>

      {/* LINKS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold mb-2">GitHub Link</label>
          <input
            type="text"
            name="githubLink"
            value={formData.githubLink}
            onChange={handleInputChange}
            placeholder="https://github.com/..."
            className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-2">Live Demo Link</label>
          <input
            type="text"
            name="publicLink"
            value={formData.publicLink}
            onChange={handleInputChange}
            placeholder="https://mysite.com"
            className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm bg-white"
          />
        </div>
      </div>

      {/* IMAGE UPLOAD */}
      <div className="mb-6">
        <label className="block text-xs font-semibold mb-2">Thumbnail / Cover</label>
        <label className="w-full min-h-[90px] rounded-xl border border-dashed border-black/20 bg-black/[0.02] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/[0.04] transition">
          <Upload size={20} className="text-black/40" />
          <span className="text-xs text-black/50">
            {formData.image ? formData.image.name : "Click to select a project image"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      {/* TECH STACK MULTI-SELECT CHIPS */}
      <div className="mb-6 p-4 rounded-xl border border-black/15 bg-black/[0.01]">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold">
            Assign Tech Stack (Click to select/deselect)
          </label>
          <span className="text-[11px] text-black/40">
            {formData.techStack.length} selected
          </span>
        </div>

        {availableTechs.length === 0 ? (
          <p className="text-xs text-black/40 italic">
            No technologies in library. Add some in the top library section first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1">
            {availableTechs.map((tech) => {
              const isSelected = formData.techStack.includes(tech._id);
              return (
                <button
                  key={tech._id}
                  type="button"
                  onClick={() => handleToggleTechSelection(tech._id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "border-black bg-black text-white shadow-xs"
                      : "border-black/20 bg-white text-black/70 hover:border-black/40"
                  }`}
                >
                  {tech.icon?.url ? (
                    <img src={tech.icon.url} alt="" className="w-3.5 h-3.5 object-contain" />
                  ) : (
                    <Layers size={12} className={isSelected ? "text-white" : "text-black/40"} />
                  )}
                  <span>{tech.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CORE FEATURES BUILDER */}
      <div className="mb-6 p-4 rounded-xl border border-black/15 bg-black/[0.01]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-xs font-semibold">
              Core Architecture & Features
            </label>
            <p className="text-[11px] text-black/40">
              Add multiple feature titles, paragraphs, and list points.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddFeature}
            className="text-xs font-semibold text-black flex items-center gap-1 hover:underline cursor-pointer bg-black/5 px-2.5 py-1 rounded-md"
          >
            <Plus size={13} /> Add Feature Title
          </button>
        </div>

        <div className="space-y-4">
          {formData.coreFeatures.map((feat, fIdx) => (
            <div
              key={fIdx}
              className="p-4 bg-white border border-black/20 rounded-xl space-y-4 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Feature Title (e.g. 🔐 Secure User Authentication)"
                  value={feat.title}
                  onChange={(e) => handleFeatureTitleChange(fIdx, e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg border border-black/20 text-xs font-bold outline-none focus:border-black bg-neutral-50/50"
                />
                {formData.coreFeatures.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(fIdx)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer"
                    title="Remove Feature"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="space-y-3 pl-3 border-l-2 border-black/20">
                <span className="text-[10.5px] uppercase font-bold tracking-wider text-black/40 block">
                  Paragraphs & Nested Points:
                </span>

                {feat.description.map((descObj, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-3 rounded-lg border border-black/10 bg-neutral-50/60 space-y-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <textarea
                        placeholder={`Paragraph description #${dIdx + 1}...`}
                        value={descObj.desc}
                        onChange={(e) =>
                          handleDescriptionTextChange(fIdx, dIdx, e.target.value)
                        }
                        rows={2}
                        className="flex-1 px-2.5 py-1.5 rounded-md border border-black/15 text-xs outline-none focus:border-black resize-none bg-white"
                      />
                      {feat.description.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDescriptionBlock(fIdx, dIdx)}
                          className="text-red-400 hover:text-red-600 p-1.5 cursor-pointer mt-1"
                          title="Remove paragraph"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="pl-3 space-y-1.5 border-l border-black/15">
                      {descObj.points?.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-black/40 shrink-0" />
                          <input
                            type="text"
                            placeholder={`Nested bullet point #${pIdx + 1}`}
                            value={pt}
                            onChange={(e) =>
                              handlePointTextChange(fIdx, dIdx, pIdx, e.target.value)
                            }
                            className="flex-1 h-7 px-2 rounded-md border border-black/15 text-[11px] outline-none focus:border-black bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePointFromDesc(fIdx, dIdx, pIdx)}
                            className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddPointToDesc(fIdx, dIdx)}
                        className="text-[10.5px] font-semibold text-black/60 hover:text-black flex items-center gap-1 cursor-pointer pt-0.5"
                      >
                        <Plus size={11} /> Add nested bullet point
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddDescriptionBlock(fIdx)}
                  className="text-xs font-semibold text-black/70 hover:text-black flex items-center gap-1 cursor-pointer pt-1"
                >
                  <Plus size={12} /> Add another paragraph to this feature
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const tableHeaderClass =
    "px-3 2xl:px-5 py-3.5 text-[10.5px] 2xl:text-[11px] font-semibold uppercase tracking-[0.06em] text-black/50 select-none";

  return (
    <div className="relative w-full h-screen flex flex-col bg-[#dadada] text-black antialiased overflow-hidden">
      {/* =====================================================
          TOP BAR (Locked to h-16 to perfectly match Sidebar & Dashboard)
      ====================================================== */}
      <div className="TopBar w-full h-16 border-b border-[#0000009b] bg-[#dadada] flex items-center justify-between px-6 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
            <FolderGit2 size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">Projects</h1>
            <p className="text-[11px] text-black/40 mt-1">
              {projects.length} record{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAllData}
            disabled={fetchLoading || loading}
            title="Refresh"
            className="w-9 h-9 rounded-lg border border-black/20 bg-[#dadada] flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw size={15} className={fetchLoading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={handleOpenAddForm}
            disabled={loading}
            className="h-9 px-4 rounded-lg bg-black text-white text-xs font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Plus size={16} />
            Add Project
          </button>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT AREA
      ====================================================== */}
      <div className="w-full flex-1 overflow-y-auto p-4 sm:p-6 2xl:p-8">
        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 text-sm">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =====================================================
            TECH STACK LIBRARY (STANDALONE SECTION)
        ====================================================== */}
        <div className="mb-6 p-4 sm:p-5 rounded-xl border border-black/25 bg-[#dadada] shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <Layers size={16} /> Tech Stack Library
              </h2>
              <p className="text-[11px] text-black/50 mt-0.5">
                Add technologies using file upload or image URL. Deleting removes it from connected projects.
              </p>
            </div>

            <form onSubmit={handleCreateTech} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Tech Name (e.g. Docker)"
                value={newTechName}
                onChange={(e) => setNewTechName(e.target.value)}
                className="h-9 px-3 rounded-lg border border-black/20 bg-white text-xs outline-none focus:border-black min-w-[130px]"
                required
              />

              <div className="flex items-center h-9 p-0.5 rounded-lg border border-black/20 bg-black/5">
                <button
                  type="button"
                  onClick={() => setTechMode("file")}
                  className={`h-full px-2.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    techMode === "file" ? "bg-black text-white" : "text-black/60 hover:text-black"
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setTechMode("url")}
                  className={`h-full px-2.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    techMode === "url" ? "bg-black text-white" : "text-black/60 hover:text-black"
                  }`}
                >
                  URL
                </button>
              </div>

              {techMode === "file" ? (
                <label className="h-9 px-3 rounded-lg border border-black/20 bg-white text-xs flex items-center gap-1.5 cursor-pointer hover:bg-black/5 min-w-[120px] max-w-[160px]">
                  <Upload size={13} className="text-black/50 shrink-0" />
                  <span className="truncate text-black/70">
                    {newTechFile ? newTechFile.name : "Select icon"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setNewTechFile(e.target.files?.[0] || null)}
                  />
                </label>
              ) : (
                <div className="relative flex items-center min-w-[160px]">
                  <LinkIcon size={12} className="absolute left-2.5 text-black/40" />
                  <input
                    type="url"
                    placeholder="https://.../icon.png"
                    value={newTechUrl}
                    onChange={(e) => setNewTechUrl(e.target.value)}
                    className="h-9 pl-7 pr-2.5 w-full rounded-lg border border-black/20 bg-white text-xs outline-none focus:border-black"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={techActionLoading}
                className="h-9 px-4 rounded-lg bg-black text-white text-xs font-medium flex items-center gap-1.5 hover:bg-zinc-800 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {techActionLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Add Tech
              </button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-black/10">
            {availableTechs.map((tech) => (
              <span
                key={tech._id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-black/20 bg-white/80 text-xs font-medium text-black shadow-2xs"
              >
                {tech.icon?.url ? (
                  <img
                    src={tech.icon.url}
                    alt={tech.name}
                    className="w-4 h-4 object-contain rounded-xs"
                  />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-black/10 text-[9px] flex items-center justify-center font-bold">
                    {tech.name.charAt(0)}
                  </span>
                )}
                <span>{tech.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteTech(tech._id)}
                  className="text-black/40 hover:text-red-600 transition-colors p-0.5 cursor-pointer ml-0.5"
                  title="Delete tech item"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {availableTechs.length === 0 && (
              <p className="text-xs text-black/40 italic">No tech stacks added yet.</p>
            )}
          </div>
        </div>

        {fetchLoading ? (
          <div className="min-h-[280px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-black/40">
              <Loader2 size={25} className="animate-spin" />
              <p className="text-sm">Loading projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="min-h-[280px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl border border-dashed border-black/20 flex items-center justify-center text-black/30">
                <PencilSparkles size={22} />
              </div>
              <p className="text-sm font-medium text-black/50">No projects found</p>
              <p className="text-xs text-black/35">
                Add your first project to display your portfolio work
              </p>
              <button
                type="button"
                onClick={handleOpenAddForm}
                className="mt-1 h-9 px-4 rounded-lg bg-black text-white text-xs font-medium flex items-center gap-2 hover:bg-zinc-800 cursor-pointer"
              >
                <Plus size={14} />
                Add Project
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ==================================================
                DESKTOP TABLE (>= 1280px)
            ================================================== */}
            <div className="hidden xl:block bg-[#dadada] overflow-hidden border border-black/30 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-full border-collapse table-fixed text-left">
                  <colgroup>
                    <col className="w-[20%]" />
                    <col className="w-[28%]" />
                    <col className="w-[18%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                  </colgroup>

                  <thead>
                    <tr className="border-b-2 border-black bg-[#dadada]">
                      <th className={tableHeaderClass}>Project</th>
                      <th className={tableHeaderClass}>Summary</th>
                      <th className={tableHeaderClass}>Tech Stack</th>
                      <th className={tableHeaderClass}>Links</th>
                      <th className={tableHeaderClass}>Details</th>
                      <th className={`${tableHeaderClass} text-right pr-4 2xl:pr-5`}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {projects.map((proj, idx) => {
                      const hasImage = Boolean(proj?.image?.url);

                      return (
                        <tr
                          key={proj._id || idx}
                          className="border-b border-black/15 last:border-b-0 hover:bg-black/[0.02] transition-colors"
                        >
                          {/* PROJECT INFO */}
                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <div className="flex items-center gap-2.5 2xl:gap-3 min-w-0">
                              {hasImage ? (
                                <div className="w-10 h-10 2xl:w-11 2xl:h-11 rounded-lg border border-black/60 bg-[#dadada] overflow-hidden shrink-0">
                                  <img
                                    src={proj.image.url}
                                    alt={proj.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 2xl:w-11 2xl:h-11 rounded-lg border border-black/60 bg-[#dadada] flex items-center justify-center text-xs font-semibold text-black/40 shrink-0">
                                  {(proj?.name || "?").charAt(0).toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="text-xs 2xl:text-sm font-semibold text-black truncate">
                                  {proj?.name}
                                </p>
                                <p className="text-[10px] 2xl:text-[11px] text-black/40 mt-0.5">
                                  Record {String(idx + 1).padStart(2, "0")}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SHORT DESC */}
                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <p className="text-xs text-black/70 line-clamp-2 leading-relaxed break-words">
                              {proj?.shortdesc || "—"}
                            </p>
                          </td>

                          {/* TECH STACK */}
                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <div className="flex flex-wrap gap-1">
                              {proj?.techStack?.slice(0, 3).map((t, tIdx) => {
                                const tName = typeof t === "object" ? t.name : "Tech";
                                const tIcon = typeof t === "object" ? t.icon?.url : null;
                                return (
                                  <span
                                    key={tIdx}
                                    className="inline-flex items-center gap-1 rounded-md border border-black/20 bg-[#dadada] px-1.5 py-0.5 text-[10px] font-medium text-black/80 truncate max-w-[100px]"
                                  >
                                    {tIcon && (
                                      <img src={tIcon} alt="" className="w-3 h-3 object-contain" />
                                    )}
                                    <span className="truncate">{tName}</span>
                                  </span>
                                );
                              })}
                              {proj?.techStack?.length > 3 && (
                                <span className="text-[10px] text-black/40 font-medium self-center">
                                  +{proj.techStack.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* LINKS */}
                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <div className="flex items-center gap-2">
                              {proj?.githubLink && proj.githubLink !== "#" && (
                                <a
                                  href={proj.githubLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="GitHub Repository"
                                  className="p-1 rounded-md border border-black/20 hover:bg-black hover:text-white transition-colors"
                                >
                                  <GithubIcon />
                                </a>
                              )}
                              {proj?.publicLink && proj.publicLink !== "#" && (
                                <a
                                  href={proj.publicLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Live Demo"
                                  className="p-1 rounded-md border border-black/20 hover:bg-black hover:text-white transition-colors"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              )}
                              {(!proj?.githubLink || proj.githubLink === "#") &&
                                (!proj?.publicLink || proj.publicLink === "#") && (
                                  <span className="text-xs text-black/40">—</span>
                                )}
                            </div>
                          </td>

                          {/* VIEW MORE LINK */}
                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <Link
                              to={`/admin/projects/${proj._id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-black underline hover:text-black/60 transition-colors"
                            >
                              <Eye size={12} /> View More
                            </Link>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-3 2xl:px-5 py-4 align-top text-right pr-4 2xl:pr-5">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                title="Edit"
                                disabled={loading}
                                onClick={() => handleOpenEditForm(proj)}
                                className="w-7 h-7 rounded-lg border border-black/60 bg-[#dadada] text-black/70 flex items-center justify-center hover:bg-green-400 hover:text-white hover:border-transparent disabled:opacity-40 transition-all cursor-pointer"
                              >
                                <Pencil size={13} />
                              </button>

                              <button
                                type="button"
                                title="Delete"
                                disabled={loading}
                                onClick={() => handleDeleteProject(proj)}
                                className="w-7 h-7 rounded-lg border border-black/60 bg-[#dadada] text-black/70 flex items-center justify-center hover:bg-[#E7000B] hover:text-white hover:border-transparent disabled:opacity-40 transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ==================================================
                MOBILE & TABLET CARDS (< 1280px)
            ================================================== */}
            <div className="block xl:hidden space-y-4">
              {projects.map((proj, idx) => {
                const hasImage = Boolean(proj?.image?.url);

                return (
                  <div
                    key={proj._id || idx}
                    className="w-full border border-black/25 bg-[#dadada] p-5 rounded-xl shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {hasImage ? (
                          <div className="w-12 h-12 rounded-lg border border-black/60 bg-[#dadada] overflow-hidden shrink-0">
                            <img
                              src={proj.image.url}
                              alt={proj.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-black/60 bg-[#dadada] flex items-center justify-center text-sm font-semibold text-black/40 shrink-0">
                            {(proj?.name || "?").charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-black truncate leading-snug">
                            {proj?.name}
                          </h3>
                          <p className="text-xs text-black/50 mt-0.5">
                            Record {String(idx + 1).padStart(2, "0")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          title="Edit"
                          disabled={loading}
                          onClick={() => handleOpenEditForm(proj)}
                          className="w-8 h-8 rounded-lg border border-black/60 bg-[#dadada] text-black/70 flex items-center justify-center hover:bg-green-400 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          disabled={loading}
                          onClick={() => handleDeleteProject(proj)}
                          className="w-8 h-8 rounded-lg border border-black/60 bg-[#dadada] text-black/70 flex items-center justify-center hover:bg-[#E7000B] hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-black/70 mt-3 line-clamp-2 leading-relaxed">
                      {proj?.shortdesc}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {proj?.techStack?.map((t, tIdx) => {
                        const tName = typeof t === "object" ? t.name : "Tech";
                        const tIcon = typeof t === "object" ? t.icon?.url : null;
                        return (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 rounded-md border border-black/20 bg-[#dadada] px-2 py-0.5 text-[10px] font-medium text-black/80"
                          >
                            {tIcon && <img src={tIcon} alt="" className="w-3 h-3 object-contain" />}
                            <span>{tName}</span>
                          </span>
                        );
                      })}
                    </div>

                    <div className="w-full h-px bg-black/15 my-3.5" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {proj?.githubLink && proj.githubLink !== "#" && (
                          <a
                            href={proj.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-black/30 hover:bg-black hover:text-white transition-colors"
                          >
                            <GithubIcon />
                          </a>
                        )}
                        {proj?.publicLink && proj.publicLink !== "#" && (
                          <a
                            href={proj.publicLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-black/30 hover:bg-black hover:text-white transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/admin/projects/${proj._id}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-black underline hover:opacity-70 cursor-pointer"
                      >
                        <Eye size={13} /> View Full Project
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          ADD PROJECT MODAL
      ====================================================== */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={handleCloseAddForm}
        >
          <form
            onSubmit={handleAddProject}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-black/10 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Add Project</h2>
                <p className="text-xs text-black/40 mt-1">
                  Create a new portfolio project record with nested features and stack.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseAddForm}
                className="w-8 h-8 rounded-lg border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {renderProjectFormFields()}

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseAddForm}
                disabled={loading}
                className="h-10 px-5 rounded-lg border border-black/15 text-sm font-medium hover:bg-black/5 disabled:opacity-40 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-10 px-5 rounded-lg bg-black text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <Plus size={15} /> Add Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          UPDATE PROJECT MODAL
      ====================================================== */}
      {showUpdateForm && selectedProject && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={handleCloseUpdateForm}
        >
          <form
            onSubmit={handleUpdateProject}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-black/10 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Update Project</h2>
                <p className="text-xs text-black/40 mt-1">
                  Modify <span className="font-semibold">{selectedProject.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseUpdateForm}
                className="w-8 h-8 rounded-lg border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {selectedProject?.image?.url && (
              <div className="mb-4 p-3 rounded-xl border border-black/10 bg-black/[0.02] flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg border border-black/20 overflow-hidden shrink-0 bg-white">
                  <img
                    src={selectedProject.image.url}
                    alt={selectedProject.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold">Current Cover</p>
                  <p className="text-[11px] text-black/40">
                    Upload a new file below to replace it.
                  </p>
                </div>
              </div>
            )}

            {renderProjectFormFields()}

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseUpdateForm}
                disabled={loading}
                className="h-10 px-5 rounded-lg border border-black/15 text-sm font-medium hover:bg-black/5 disabled:opacity-40 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-10 px-5 rounded-lg bg-black text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Pencil size={15} /> Update Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Projects;