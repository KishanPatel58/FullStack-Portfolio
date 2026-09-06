import {
  Briefcase,
  Pencil,
  PencilSparkles,
  Plus,
  Trash2,
  X,
  Upload,
  Loader2,
  RefreshCw,
  MapPin,
  Calendar,
} from "lucide-react";

import { useEffect, useState } from "react";
import { UseAdmin } from "../../context/AdminContext";
import api from "../../api/axios";

const initialFormData = {
  companyName: "",
  designation: "",
  joiningDate: "",
  endDate: "",
  companyLocation: "",
  currentlyWorkingHere: false,
  companyLogo: null,
  workPoints: [""],
};

const Experience = () => {
  const { admin } = UseAdmin();
  void admin;

  // =========================================================
  // EXPERIENCE STATE
  // =========================================================
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // MODAL STATE
  // =========================================================
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);

  // =========================================================
  // FORM STATE
  // =========================================================
  const [formData, setFormData] = useState(initialFormData);

  // =========================================================
  // RESET FORM
  // =========================================================
  const resetForm = () => {
    setFormData({
      ...initialFormData,
      workPoints: [""],
    });
  };

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE CURRENTLY WORKING CHECKBOX
  // =========================================================
  const handleCurrentlyWorkingChange = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      currentlyWorkingHere: checked,
      endDate: checked ? "" : prev.endDate,
    }));
  };

  // =========================================================
  // HANDLE LOGO CHANGE
  // =========================================================
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      companyLogo: file,
    }));
  };

  // =========================================================
  // HANDLE WORK POINTS (ARRAY)
  // =========================================================
  const handleWorkPointChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.workPoints];
      updated[index] = value;
      return { ...prev, workPoints: updated };
    });
  };

  const handleAddWorkPoint = () => {
    setFormData((prev) => ({
      ...prev,
      workPoints: [...prev.workPoints, ""],
    }));
  };

  const handleRemoveWorkPoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      workPoints: prev.workPoints.filter((_, i) => i !== index),
    }));
  };

  // =========================================================
  // FETCH EXPERIENCES
  // =========================================================
  const fetchExperiences = async () => {
    try {
      setFetchLoading(true);
      setError("");

      const { data } = await api.get("/api/admin/experience", {
        withCredentials: true,
      });

      if (data?.success) {
        setExperiences(
          Array.isArray(data?.experiences) ? data.experiences : []
        );
      } else {
        setExperiences([]);
      }
    } catch (err) {
      console.error("Fetch experience error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch experiences."
      );
      setExperiences([]);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  // =========================================================
  // OPEN & CLOSE MODALS
  // =========================================================
  const handleOpenAddForm = () => {
    resetForm();
    setSelectedExperience(null);
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

  const handleOpenEditForm = (exp) => {
    if (!exp?._id) {
      setError("Experience ID not found.");
      return;
    }

    const points =
      exp?.work?.points && exp.work.points.length > 0
        ? exp.work.points
        : [""];

    setFormData({
      companyName: exp?.companyName || "",
      designation: exp?.designation || "",
      joiningDate: exp?.joiningDate ? exp.joiningDate.slice(0, 10) : "",
      endDate:
        exp?.currentlyWorkingHere || !exp?.endDate
          ? ""
          : exp.endDate.slice(0, 10),
      companyLocation: exp?.companyLocation || "",
      currentlyWorkingHere: Boolean(exp?.currentlyWorkingHere),
      companyLogo: null,
      workPoints: points,
    });

    setSelectedExperience(exp);
    setShowAddForm(false);
    setShowUpdateForm(true);
    setError("");
  };

  const handleCloseUpdateForm = () => {
    if (loading) return;
    setShowUpdateForm(false);
    setSelectedExperience(null);
    resetForm();
    setError("");
  };

  // =========================================================
  // ADD EXPERIENCE
  // =========================================================
  const handleAddExperience = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!formData.companyName.trim()) throw new Error("Company name is required.");
      if (!formData.designation.trim()) throw new Error("Designation is required.");
      if (!formData.joiningDate) throw new Error("Joining date is required.");
      if (!formData.currentlyWorkingHere && !formData.endDate) {
        throw new Error("End date is required.");
      }
      if (!formData.companyLocation.trim()) throw new Error("Company location is required.");

      const validPoints = formData.workPoints
        .map((p) => p.trim())
        .filter(Boolean);

      const data = new FormData();
      data.append("companyName", formData.companyName.trim());
      data.append("designation", formData.designation.trim());
      data.append("joiningDate", formData.joiningDate);
      data.append("currentlyWorkingHere", String(formData.currentlyWorkingHere));
      if (!formData.currentlyWorkingHere && formData.endDate) {
        data.append("endDate", formData.endDate);
      }
      data.append("companyLocation", formData.companyLocation.trim());
      data.append("work", JSON.stringify({ points: validPoints }));

      if (formData.companyLogo) {
        data.append("companyLogo", formData.companyLogo);
      }

      const response = await api.post("/api/admin/experience/add", data, {
        withCredentials: true,
      });

      const result = response.data;
      if (!result?.success) {
        throw new Error(result?.message || "Failed to add experience.");
      }

      if (result?.experience) {
        setExperiences((prev) => [result.experience, ...prev]);
      } else {
        await fetchExperiences();
      }

      setShowAddForm(false);
      resetForm();
    } catch (err) {
      console.error("Add experience error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add experience."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UPDATE EXPERIENCE
  // =========================================================
  const handleUpdateExperience = async (e) => {
    e.preventDefault();

    if (!selectedExperience?._id) {
      setError("Experience ID not found.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (!formData.companyName.trim()) throw new Error("Company name is required.");
      if (!formData.designation.trim()) throw new Error("Designation is required.");
      if (!formData.joiningDate) throw new Error("Joining date is required.");
      if (!formData.currentlyWorkingHere && !formData.endDate) {
        throw new Error("End date is required.");
      }
      if (!formData.companyLocation.trim()) throw new Error("Company location is required.");

      const validPoints = formData.workPoints
        .map((p) => p.trim())
        .filter(Boolean);

      const data = new FormData();
      data.append("companyName", formData.companyName.trim());
      data.append("designation", formData.designation.trim());
      data.append("joiningDate", formData.joiningDate);
      data.append("currentlyWorkingHere", String(formData.currentlyWorkingHere));
      if (!formData.currentlyWorkingHere && formData.endDate) {
        data.append("endDate", formData.endDate);
      }
      data.append("companyLocation", formData.companyLocation.trim());
      data.append("work", JSON.stringify({ points: validPoints }));

      if (formData.companyLogo) {
        data.append("companyLogo", formData.companyLogo);
      }

      const response = await api.put(
        `/api/admin/experience/${selectedExperience._id}/update`,
        data,
        { withCredentials: true }
      );

      const result = response.data;
      if (!result?.success) {
        throw new Error(result?.message || "Failed to update experience.");
      }

      if (result?.experience) {
        setExperiences((prev) =>
          prev.map((item) =>
            item._id === result.experience._id ? result.experience : item
          )
        );
      } else {
        await fetchExperiences();
      }

      setShowUpdateForm(false);
      setSelectedExperience(null);
      resetForm();
    } catch (err) {
      console.error("Update experience error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update experience."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DELETE EXPERIENCE
  // =========================================================
  const handleDeleteExperience = async (experience) => {
    if (!experience?._id) {
      setError("Experience ID not found.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${experience.companyName}" experience record?`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.delete(
        `/api/admin/experience/${experience._id}/delete`,
        { withCredentials: true }
      );

      const result = response.data;
      if (!result?.success) {
        throw new Error(result?.message || "Failed to delete experience.");
      }

      setExperiences((prev) =>
        prev.filter((item) => item._id !== experience._id)
      );

      if (selectedExperience?._id === experience._id) {
        setShowUpdateForm(false);
        setSelectedExperience(null);
        resetForm();
      }
    } catch (err) {
      console.error("Delete experience error:", err);
      setError(err?.message || "Failed to delete experience.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORMAT DATE UTILS -> DD-MM-YYYY
  // =========================================================
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";

    // Handle "DD-MM-YYYY" already formatted
    if (typeof dateStr === "string" && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      return dateStr;
    }

    // Handle standard "YYYY-MM-DD" or ISO strings
    const dateObj = new Date(dateStr);
    if (!Number.isNaN(dateObj.getTime())) {
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      return `${day}-${month}-${year}`;
    }

    // Fallback manual hyphen split
    const parts = String(dateStr).split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD -> DD-MM-YYYY
        return `${parts[2].padStart(2, "0")}-${parts[1].padStart(2, "0")}-${parts[0]}`;
      }
      return `${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}-${parts[2]}`;
    }

    return dateStr;
  };

  const list = experiences;
  const hasExperience = list.length > 0;

  // Responsive Table Header Class
  const tableHeaderClass =
    "px-3 2xl:px-5 py-3.5 text-[10.5px] 2xl:text-[11px] font-semibold uppercase tracking-[0.06em] text-black/50 select-none";

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#dadada] text-black antialiased">
      {/* =====================================================
          TOP BAR
      ====================================================== */}
      <div className="w-full min-h-[56px] py-3 border-b border-black/50 bg-[#dadada] flex items-center justify-between px-6 sm:px-8">
        {/* TITLE */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
            <Briefcase size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">Experience</h1>
            <p className="text-[11px] text-black/40 mt-1">
              {list.length} record{list.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchExperiences}
            disabled={fetchLoading || loading}
            title="Refresh"
            className="w-9 h-9 rounded-lg border border-black/20 bg-[#dadada] flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw
              size={15}
              className={fetchLoading ? "animate-spin" : ""}
            />
          </button>

          <button
            type="button"
            onClick={handleOpenAddForm}
            disabled={loading}
            className="h-9 px-4 rounded-lg bg-black text-white text-sm font-medium flex items-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Plus size={16} />
            Add Experience
          </button>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="w-full p-4 sm:p-6 2xl:p-8">
        {/* ERROR */}
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

        {/* LOADING STATE */}
        {fetchLoading ? (
          <div className="min-h-[280px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-black/40">
              <Loader2 size={25} className="animate-spin" />
              <p className="text-sm">Loading experience...</p>
            </div>
          </div>
        ) : !hasExperience ? (
          /* EMPTY STATE */
          <div className="min-h-[280px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl border border-dashed border-black/20 flex items-center justify-center text-black/30">
                <PencilSparkles size={22} />
              </div>
              <p className="text-sm font-medium text-black/50">
                No experience found
              </p>
              <p className="text-xs text-black/35">
                Add your first experience record to get started
              </p>
              <button
                type="button"
                onClick={handleOpenAddForm}
                className="mt-1 h-9 px-4 rounded-lg bg-black text-white text-xs font-medium flex items-center gap-2 hover:bg-zinc-800 cursor-pointer"
              >
                <Plus size={14} />
                Add Experience
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ==================================================
                DESKTOP RESPONSIVE TABLE (>= 1280px)
            ================================================== */}
            <div className="hidden xl:block bg-[#dadada] overflow-hidden border border-black/30 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-full border-collapse table-fixed text-left">
                  <colgroup>
                    <col className="w-[18%] 2xl:w-[20%]" />
                    <col className="w-[13%] 2xl:w-[14%]" />
                    <col className="w-[11%] 2xl:w-[12%]" />
                    <col className="w-[11%] 2xl:w-[12%]" />
                    <col className="w-[8%] 2xl:w-[9%]" />
                    <col className="w-[13%] 2xl:w-[12%]" />
                    <col className="w-[18%] 2xl:w-[15%]" />
                    <col className="w-[8%] 2xl:w-[6%]" />
                  </colgroup>

                  <thead>
                    <tr className="border-b-2 border-black bg-[#dadada]">
                      <th className={tableHeaderClass}>Company</th>
                      <th className={tableHeaderClass}>Designation</th>
                      <th className={tableHeaderClass}>Joining Date</th>
                      <th className={tableHeaderClass}>End Date</th>
                      <th className={`${tableHeaderClass} text-center`}>Status</th>
                      <th className={tableHeaderClass}>Location</th>
                      <th className={tableHeaderClass}>Work Highlights</th>
                      <th className={`${tableHeaderClass} text-right pr-4 2xl:pr-5`}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {list.map((exp, idx) => {
                      const hasLogo = Boolean(exp?.companyLogo?.url);
                      const points = exp?.work?.points || [];

                      return (
                        <tr
                          key={exp._id || idx}
                          className="border-b border-black/15 last:border-b-0 hover:bg-black/[0.02] transition-colors"
                        >
                          {/* COMPANY */}
                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <div className="flex items-center gap-2.5 2xl:gap-3 min-w-0">
                              {hasLogo ? (
                                <div className="w-9 h-9 2xl:w-10 2xl:h-10 rounded-lg border border-black/60 bg-[#dadada] overflow-hidden shrink-0">
                                  <img
                                    src={exp.companyLogo.url}
                                    alt={exp.companyName}
                                    className="w-full h-full object-contain p-1"
                                  />
                                </div>
                              ) : (
                                <div className="w-9 h-9 2xl:w-10 2xl:h-10 rounded-lg border border-black/60 bg-[#dadada] flex items-center justify-center text-[11px] font-semibold text-black/40 shrink-0">
                                  {(exp?.companyName || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="text-xs 2xl:text-sm font-medium text-black truncate">
                                  {exp?.companyName}
                                </p>
                                <p className="text-[10px] 2xl:text-[11px] text-black/35 mt-0.5">
                                  Record {String(idx + 1).padStart(2, "0")}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* DESIGNATION */}
                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <span className="inline-block max-w-full truncate rounded-full border border-black/20 bg-[#dadada] px-2 py-0.5 text-[11px] 2xl:text-xs text-black/80 font-medium">
                              {exp?.designation || "—"}
                            </span>
                          </td>

                          {/* JOINING DATE (DD-MM-YYYY) */}
                          <td className="px-3 2xl:px-5 py-4 align-top text-[11px] 2xl:text-xs text-black/70 tabular-nums whitespace-nowrap">
                            {formatDate(exp?.joiningDate)}
                          </td>

                          {/* END DATE (DD-MM-YYYY) */}
                          <td className="px-3 2xl:px-5 py-4 align-top text-[11px] 2xl:text-xs text-black/70 tabular-nums whitespace-nowrap">
                            {exp?.currentlyWorkingHere ? (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-black">
                                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                                Present
                              </span>
                            ) : (
                              formatDate(exp?.endDate)
                            )}
                          </td>

                          {/* STATUS */}
                          <td className="px-3 2xl:px-5 py-4 align-top text-center">
                            {exp?.currentlyWorkingHere ? (
                              <span className="inline-flex items-center justify-center h-5 2xl:h-6 px-2 2xl:px-2.5 rounded-full text-[9.5px] 2xl:text-[10px] font-medium border border-black bg-black text-white">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center h-5 2xl:h-6 px-2 2xl:px-2.5 rounded-full text-[10px] 2xl:text-[11px] font-medium border border-black/20 bg-[#dadada] text-black/70">
                                Past
                              </span>
                            )}
                          </td>

                          {/* LOCATION */}
                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <div className="flex items-center gap-1.5 text-[11px] 2xl:text-xs text-black/70 min-w-0">
                              <MapPin size={13} className="shrink-0 text-black/50" />
                              <span className="truncate">
                                {exp?.companyLocation || "—"}
                              </span>
                            </div>
                          </td>

                          {/* WORK HIGHLIGHTS */}
                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <div className="w-full min-w-0">
                              {points.length > 0 ? (
                                <ul className="space-y-1">
                                  {points.slice(0, 2).map((pt, pIdx) => (
                                    <li
                                      key={pIdx}
                                      className="text-[11px] 2xl:text-xs text-black/70 flex items-start gap-1.5"
                                    >
                                      <span className="mt-1.5 w-1 h-1 rounded-full bg-black/50 shrink-0" />
                                      <span className="line-clamp-2 break-words">{pt}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-xs text-black/40">—</span>
                              )}
                              {points.length > 2 && (
                                <span className="block text-[10px] font-medium text-black/40 mt-1 pl-2.5">
                                  +{points.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-3 2xl:px-5 py-4 align-top text-right pr-4 2xl:pr-5">
                            <div className="flex items-center justify-end gap-1.5 2xl:gap-2">
                              <button
                                type="button"
                                title="Edit"
                                disabled={loading}
                                onClick={() => handleOpenEditForm(exp)}
                                className="w-7 h-7 2xl:w-8 2xl:h-8 rounded-lg border border-black/60 bg-[#dadada] text-black/70 flex items-center justify-center hover:bg-green-400 hover:text-white hover:border-transparent disabled:opacity-40 transition-all cursor-pointer"
                              >
                                <Pencil size={13} />
                              </button>

                              <button
                                type="button"
                                title="Delete"
                                disabled={loading}
                                onClick={() => handleDeleteExperience(exp)}
                                className="w-7 h-7 2xl:w-8 2xl:h-8 rounded-lg border border-black/60 bg-[#dadada] text-black/70 flex items-center justify-center hover:bg-[#E7000B] hover:text-white hover:border-transparent disabled:opacity-40 transition-all cursor-pointer"
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
              {list.map((exp, idx) => {
                const hasLogo = Boolean(exp?.companyLogo?.url);
                const points = exp?.work?.points || [];

                return (
                  <div
                    key={exp._id || idx}
                    className="w-full border border-black/25 bg-[#dadada] p-5 rounded-xl shadow-xs"
                  >
                    {/* CARD HEADER */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {hasLogo ? (
                          <div className="w-11 h-11 rounded-lg border border-black/60 bg-[#dadada] overflow-hidden shrink-0">
                            <img
                              src={exp.companyLogo.url}
                              alt={exp.companyName}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-lg border border-black/60 bg-[#dadada] flex items-center justify-center text-sm font-semibold text-black/40 shrink-0">
                            {(exp?.companyName || "?").charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-black truncate leading-snug">
                            {exp?.companyName}
                          </h3>
                          <p className="text-xs text-black/60 truncate mt-0.5">
                            {exp?.designation || "—"} · Record{" "}
                            {String(idx + 1).padStart(2, "0")}
                          </p>
                        </div>
                      </div>

                      {/* CARD ACTIONS */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          title="Edit"
                          disabled={loading}
                          onClick={() => handleOpenEditForm(exp)}
                          className="w-8 h-8 rounded-lg border border-black/60 bg-[#dadada] text-black/70 flex items-center justify-center hover:bg-green-400 hover:text-white hover:border-transparent disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          disabled={loading}
                          onClick={() => handleDeleteExperience(exp)}
                          className="w-8 h-8 rounded-lg border border-black/60 bg-[#dadada] text-black/70 flex items-center justify-center hover:bg-[#E7000B] hover:text-white hover:border-transparent disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* STATUS & META */}
                    <div className="mt-3.5 flex items-center gap-2 flex-wrap text-xs text-black/70">
                      {exp?.currentlyWorkingHere ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-black bg-black text-white">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-black/20 bg-[#dadada] text-black/70">
                          Past
                        </span>
                      )}

                      <span className="text-black/30">•</span>

                      <span className="inline-flex items-center gap-1">
                        <Calendar size={13} className="text-black/50" />
                        {formatDate(exp?.joiningDate)} –{" "}
                        {exp?.currentlyWorkingHere
                          ? "Present"
                          : formatDate(exp?.endDate)}
                      </span>

                      <span className="text-black/30">•</span>

                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} className="text-black/50" />
                        {exp?.companyLocation || "—"}
                      </span>
                    </div>

                    {/* WORK HIGHLIGHTS */}
                    <div className="w-full h-px bg-black/15 my-3.5" />
                    <div className="space-y-1.5">
                      {points.length > 0 ? (
                        <ul className="space-y-1">
                          {points.slice(0, 2).map((pt, pIdx) => (
                            <li
                              key={pIdx}
                              className="text-xs text-black/70 flex items-start gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-black/50 shrink-0 mt-1" />
                              <span className="line-clamp-2">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-black/40">—</span>
                      )}

                      {points.length > 2 && (
                        <span className="inline-block text-[11px] font-medium text-black/50 pl-3.5">
                          +{points.length - 2} more points
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          ADD EXPERIENCE MODAL
      ====================================================== */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={handleCloseAddForm}
        >
          <form
            onSubmit={handleAddExperience}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-black/10 p-6"
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Add Experience</h2>
                <p className="text-xs text-black/40 mt-1">
                  Add a new professional work experience record.
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

            {/* COMPANY NAME */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Microsoft"
                required
                className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
              />
            </div>

            {/* DESIGNATION + LOCATION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Software Developer"
                  required
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="companyLocation"
                  value={formData.companyLocation}
                  onChange={handleInputChange}
                  placeholder="Gurgaon, Delhi"
                  required
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
                />
              </div>
            </div>

            {/* CURRENTLY WORKING CHECKBOX */}
            <div className="mb-4 p-4 rounded-xl border border-black/10 bg-black/[0.02]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.currentlyWorkingHere}
                  onChange={handleCurrentlyWorkingChange}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <span className="text-sm font-medium">Currently Working Here</span>
              </label>
              <p className="text-[11px] text-black/40 mt-1 ml-7">
                Check this if you are actively working in this role.
              </p>
            </div>

            {/* DATES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Joining Date
                </label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm bg-white"
                />
              </div>

              {!formData.currentlyWorkingHere && (
                <div>
                  <label className="block text-xs font-semibold mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required={!formData.currentlyWorkingHere}
                    className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm bg-white"
                  />
                </div>
              )}
            </div>

            {/* WORK POINTS */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold">
                  Responsibilities & Achievements
                </label>
                <button
                  type="button"
                  onClick={handleAddWorkPoint}
                  className="text-xs font-medium text-black flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus size={12} /> Add Point
                </button>
              </div>

              <div className="space-y-2">
                {formData.workPoints.map((point, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) =>
                        handleWorkPointChange(pIdx, e.target.value)
                      }
                      placeholder={`Key contribution or duty #${pIdx + 1}`}
                      className="flex-1 h-10 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
                    />
                    {formData.workPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveWorkPoint(pIdx)}
                        className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* LOGO */}
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-2">
                Company Logo
              </label>
              <label className="w-full min-h-[90px] rounded-xl border border-dashed border-black/20 bg-black/[0.02] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/[0.04] transition">
                <Upload size={20} className="text-black/40" />
                <span className="text-xs text-black/50">
                  {formData.companyLogo
                    ? formData.companyLogo.name
                    : "Click to upload company logo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>

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
                    <Loader2 size={15} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    Add Experience
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          UPDATE EXPERIENCE MODAL
      ====================================================== */}
      {showUpdateForm && selectedExperience && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={handleCloseUpdateForm}
        >
          <form
            onSubmit={handleUpdateExperience}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-black/10 p-6"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Update Experience</h2>
                <p className="text-xs text-black/40 mt-1">
                  Update{" "}
                  <span className="font-medium">
                    {selectedExperience?.companyName}
                  </span>
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

            {/* CURRENT LOGO PREVIEW */}
            {selectedExperience?.companyLogo?.url && (
              <div className="mb-5 p-3 rounded-xl border border-black/10 bg-black/[0.02] flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-black/10 bg-white overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={selectedExperience.companyLogo.url}
                    alt={selectedExperience.companyName}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold">Current Logo</p>
                  <p className="text-[11px] text-black/40">
                    Upload a new file below to replace it.
                  </p>
                </div>
              </div>
            )}

            {/* COMPANY NAME */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
              />
            </div>

            {/* DESIGNATION + LOCATION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="companyLocation"
                  value={formData.companyLocation}
                  onChange={handleInputChange}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
                />
              </div>
            </div>

            {/* CURRENTLY WORKING CHECKBOX */}
            <div className="mb-4 p-4 rounded-xl border border-black/10 bg-black/[0.02]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.currentlyWorkingHere}
                  onChange={handleCurrentlyWorkingChange}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <span className="text-sm font-medium">Currently Working Here</span>
              </label>
              <p className="text-[11px] text-black/40 mt-1 ml-7">
                Check this if you are actively working in this role.
              </p>
            </div>

            {/* DATES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Joining Date
                </label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm bg-white"
                />
              </div>

              {!formData.currentlyWorkingHere && (
                <div>
                  <label className="block text-xs font-semibold mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required={!formData.currentlyWorkingHere}
                    className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm bg-white"
                  />
                </div>
              )}
            </div>

            {/* WORK POINTS */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold">
                  Responsibilities & Achievements
                </label>
                <button
                  type="button"
                  onClick={handleAddWorkPoint}
                  className="text-xs font-medium text-black flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus size={12} /> Add Point
                </button>
              </div>

              <div className="space-y-2">
                {formData.workPoints.map((point, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) =>
                        handleWorkPointChange(pIdx, e.target.value)
                      }
                      placeholder={`Key contribution or duty #${pIdx + 1}`}
                      className="flex-1 h-10 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
                    />
                    {formData.workPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveWorkPoint(pIdx)}
                        className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* LOGO REPLACE */}
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-2">
                Replace Company Logo
              </label>
              <label className="w-full min-h-[90px] rounded-xl border border-dashed border-black/20 bg-black/[0.02] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/[0.04] transition">
                <Upload size={20} className="text-black/40" />
                <span className="text-xs text-black/50">
                  {formData.companyLogo
                    ? formData.companyLogo.name
                    : "Click to replace logo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-black/35 mt-2">
                Leave empty to keep the current logo.
              </p>
            </div>

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
                    <Loader2 size={15} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Pencil size={15} />
                    Update Experience
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

export default Experience;