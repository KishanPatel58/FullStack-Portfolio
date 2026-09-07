import {
  BookOpen,
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

const STUDY_OPTIONS = [
  "10th",
  "12th",
  "CSE",
  "CS",
  "IT",
  "AIML",
  "Cyber Security",
];

const GRADE_OPTIONS = [
  { value: "percentage", label: "Percentage" },
  { value: "cgpa", label: "CGPA" },
  { value: "gpa", label: "GPA" },
  { value: "spi", label: "SPI" },
];

const initialFormData = {
  instituteName: "",
  study: "",
  gradeTitle: "percentage",
  gradeValue: "",
  passedYear: "",
  address: "",
  instituteLogo: null,
  currentlyStudying: false,
};

const Education = () => {
  const { admin } = UseAdmin();
  void admin;

  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setFormData({ ...initialFormData });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrentlyStudyingChange = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      currentlyStudying: checked,
      passedYear: checked ? "" : prev.passedYear,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, instituteLogo: file }));
  };

  const fetchEducations = async () => {
    try {
      setFetchLoading(true);
      setError("");

      const { data } = await api.get("/api/admin/education", {
        withCredentials: true,
      });

      if (data?.success) {
        setEducations(Array.isArray(data?.educations) ? data.educations : []);
      } else {
        setEducations([]);
      }
    } catch (error) {
      console.error("Fetch education error:", error);
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch education."
      );
      setEducations([]);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchEducations();
  }, []);

  const handleOpenAddForm = () => {
    resetForm();
    setSelectedEducation(null);
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

  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      if (!formData.instituteName.trim()) throw new Error("Institute name is required.");
      if (!formData.study) throw new Error("Please select study.");
      if (formData.gradeValue === "" || formData.gradeValue === null) {
        throw new Error("Grade value is required.");
      }
      if (!formData.address.trim()) throw new Error("Address is required.");

      if (!formData.currentlyStudying) {
        const year = Number(formData.passedYear);
        const currentYear = new Date().getFullYear();
        if (!formData.passedYear) throw new Error("Passed year is required.");
        if (!Number.isInteger(year) || year < 1900 || year > currentYear) {
          throw new Error(`Please enter a valid year between 1900 and ${currentYear}.`);
        }
      }

      const data = new FormData();
      data.append("instituteName", formData.instituteName.trim());
      data.append("study", formData.study);
      data.append(
        "grade",
        JSON.stringify({
          title: formData.gradeTitle,
          value: Number(formData.gradeValue),
        })
      );
      data.append("currentlyStudying", String(formData.currentlyStudying));

      if (!formData.currentlyStudying && formData.passedYear) {
        data.append("passedYear", formData.passedYear);
      }
      data.append("address", formData.address.trim());

      if (formData.instituteLogo) {
        data.append("educationLogo", formData.instituteLogo);
      }

      const response = await api.post("/api/admin/education/add", data, {
        withCredentials: true,
      });

      const result = response.data;
      if (!result?.success) {
        throw new Error(result?.message || "Failed to add education.");
      }

      if (result?.education) {
        setEducations((prev) => [result.education, ...prev]);
      } else {
        await fetchEducations();
      }

      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error("Add education error:", error);
      setError(error?.response?.data?.message || error?.message || "Failed to add education.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEducation = (education) => {
    if (!education?._id) {
      setError("Education ID not found.");
      return;
    }

    let passedYear = "";
    if (education?.passedYear) {
      if (typeof education.passedYear === "number") {
        passedYear = String(education.passedYear);
      } else {
        const date = new Date(education.passedYear);
        if (!Number.isNaN(date.getTime())) {
          passedYear = String(date.getFullYear());
        }
      }
    }

    const currentlyStudying =
      education?.currentlyStudying === true ||
      !education?.passedYear ||
      education?.study === "Active";

    const actualStudy = education?.study === "Active" ? "" : education?.study || "";

    setFormData({
      instituteName: education?.instituteName || "",
      study: actualStudy,
      gradeTitle: education?.grade?.title?.toLowerCase() || "percentage",
      gradeValue: education?.grade?.value ?? "",
      passedYear: currentlyStudying ? "" : passedYear,
      address: education?.address || "",
      instituteLogo: null,
      currentlyStudying,
    });

    setSelectedEducation(education);
    setShowAddForm(false);
    setShowUpdateForm(true);
    setError("");
  };

  const handleCloseUpdateForm = () => {
    if (loading) return;
    setShowUpdateForm(false);
    setSelectedEducation(null);
    resetForm();
    setError("");
  };

  const handleUpdateEducation = async (e) => {
    e.preventDefault();
    if (!selectedEducation?._id) {
      setError("Education ID not found.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (!formData.instituteName.trim()) throw new Error("Institute name is required.");
      if (!formData.study) throw new Error("Please select study.");
      if (formData.gradeValue === "" || formData.gradeValue === null) {
        throw new Error("Grade value is required.");
      }
      if (!formData.address.trim()) throw new Error("Address is required.");

      if (!formData.currentlyStudying) {
        const year = Number(formData.passedYear);
        const currentYear = new Date().getFullYear();
        if (!formData.passedYear) throw new Error("Passed year is required.");
        if (!Number.isInteger(year) || year < 1900 || year > currentYear) {
          throw new Error(`Please enter a valid year between 1900 and ${currentYear}.`);
        }
      }

      const data = new FormData();
      data.append("instituteName", formData.instituteName.trim());
      data.append("study", formData.study);
      data.append(
        "grade",
        JSON.stringify({
          title: formData.gradeTitle,
          value: Number(formData.gradeValue),
        })
      );
      data.append("currentlyStudying", String(formData.currentlyStudying));

      if (!formData.currentlyStudying && formData.passedYear) {
        data.append("passedYear", formData.passedYear);
      }
      data.append("address", formData.address.trim());

      if (formData.instituteLogo) {
        data.append("educationLogo", formData.instituteLogo);
      }

      const response = await api.put(
        `/api/admin/education/${selectedEducation._id}/update`,
        data,
        { withCredentials: true }
      );

      const result = response.data;
      if (!result?.success) {
        throw new Error(result?.message || "Failed to update education.");
      }

      if (result?.education) {
        setEducations((prev) =>
          prev.map((education) =>
            education._id === result.education._id ? result.education : education
          )
        );
      } else {
        await fetchEducations();
      }

      setShowUpdateForm(false);
      setSelectedEducation(null);
      resetForm();
    } catch (error) {
      console.error("Update education error:", error);
      setError(error?.response?.data?.message || error?.message || "Failed to update education.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEducation = async (education) => {
    if (!education?._id) {
      setError("Education ID not found.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${education.instituteName}" education record?`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.delete(
        `/api/admin/education/${education._id}/delete`,
        { withCredentials: true }
      );

      const result = response.data;
      if (!result.success) {
        throw new Error(result?.message || "Failed to delete education.");
      }

      setEducations((prev) => prev.filter((item) => item._id !== education._id));

      if (selectedEducation?._id === education._id) {
        setShowUpdateForm(false);
        setSelectedEducation(null);
        resetForm();
      }
    } catch (error) {
      console.error("Delete education error:", error);
      setError(error?.message || "Failed to delete education.");
    } finally {
      setLoading(false);
    }
  };

  const formatPassedYear = (education) => {
    if (education?.currentlyStudying === true || !education?.passedYear) {
      return "Present";
    }
    const date = new Date(education.passedYear);
    if (Number.isNaN(date.getTime())) return "—";
    return date.getFullYear();
  };

  const formatGradeTitle = (title) => {
    if (!title) return "—";
    return title.toUpperCase();
  };

  const list = educations;
  const hasEducation = list.length > 0;
  const tableHeaderClass =
    "px-3 2xl:px-5 py-3.5 text-[10.5px] 2xl:text-[11px] font-semibold uppercase tracking-[0.06em] text-black/50 select-none";

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#dadada] text-black antialiased">
      {/* =====================================================
          TOP BAR (Locked to h-16 to perfectly match Sidebar & Dashboard)
      ====================================================== */}
      <div className="TopBar w-full h-16 border-b border-[#0000009b] bg-[#dadada] flex items-center justify-between px-6 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
            <BookOpen size={18} />
          </div>

          <div>
            <h1 className="text-base font-semibold leading-none">Education</h1>
            <p className="text-[11px] text-black/40 mt-1">
              {list.length} record{list.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchEducations}
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
            Add Education
          </button>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="w-full p-4 sm:p-6 2xl:p-8">
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

        {fetchLoading ? (
          <div className="min-h-[280px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-black/40">
              <Loader2 size={25} className="animate-spin" />
              <p className="text-sm">Loading education...</p>
            </div>
          </div>
        ) : !hasEducation ? (
          <div className="min-h-[280px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl border border-dashed border-black/20 flex items-center justify-center text-black/30">
                <PencilSparkles size={22} />
              </div>
              <p className="text-sm font-medium text-black/50">No education found</p>
              <p className="text-xs text-black/35">
                Add your first education record to get started
              </p>
              <button
                type="button"
                onClick={handleOpenAddForm}
                className="mt-1 h-9 px-4 rounded-lg bg-black text-white text-xs font-medium flex items-center gap-2 hover:bg-zinc-800 cursor-pointer"
              >
                <Plus size={14} />
                Add Education
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
                    <col className="w-[24%]" />
                    <col className="w-[18%]" />
                    <col className="w-[16%]" />
                    <col className="w-[14%]" />
                    <col className="w-[20%]" />
                    <col className="w-[8%]" />
                  </colgroup>

                  <thead>
                    <tr className="border-b-2 border-black bg-[#dadada]">
                      <th className={tableHeaderClass}>Institute</th>
                      <th className={tableHeaderClass}>Study</th>
                      <th className={tableHeaderClass}>Grade</th>
                      <th className={tableHeaderClass}>Year</th>
                      <th className={tableHeaderClass}>Address</th>
                      <th className={`${tableHeaderClass} text-right pr-4 2xl:pr-5`}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {list.map((education, idx) => {
                      const hasLogo = Boolean(education?.instituteLogo?.url);
                      const isCurrentlyStudying =
                        education?.currentlyStudying === true || !education?.passedYear;

                      return (
                        <tr
                          key={education._id || idx}
                          className="border-b border-black/15 last:border-b-0 hover:bg-black/[0.02] transition-colors"
                        >
                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <div className="flex items-center gap-2.5 2xl:gap-3 min-w-0">
                              {hasLogo ? (
                                <div className="w-9 h-9 2xl:w-10 2xl:h-10 rounded-lg border border-black/60 bg-[#dadada] overflow-hidden shrink-0">
                                  <img
                                    src={education.instituteLogo.url}
                                    alt={education.instituteName}
                                    className="w-full h-full object-contain p-1"
                                  />
                                </div>
                              ) : (
                                <div className="w-9 h-9 2xl:w-10 2xl:h-10 rounded-lg border border-black/60 bg-[#dadada] flex items-center justify-center text-[11px] font-semibold text-black/40 shrink-0">
                                  {(education?.instituteName || "?").charAt(0).toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="text-xs 2xl:text-sm font-medium text-black truncate">
                                  {education?.instituteName}
                                </p>
                                <p className="text-[10px] 2xl:text-[11px] text-black/35 mt-0.5">
                                  Record {String(idx + 1).padStart(2, "0")}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-medium border bg-[#dadada] text-black/70 border-black/20">
                                {education?.study || "—"}
                              </span>
                              {isCurrentlyStudying && (
                                <span className="inline-flex items-center h-5 px-2 rounded-full text-[9.5px] font-medium border border-black bg-black text-white">
                                  Current
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <div className="flex flex-col">
                              <span className="text-xs 2xl:text-sm font-semibold tabular-nums text-black">
                                {education?.grade?.value}
                                {education?.grade?.title?.toLowerCase() === "percentage" && "%"}
                              </span>
                              <span className="text-[10px] 2xl:text-[11px] text-black/40 uppercase tracking-wide mt-0.5">
                                {formatGradeTitle(education?.grade?.title)}
                              </span>
                            </div>
                          </td>

                          <td className="px-3 2xl:px-5 py-4 align-top text-xs 2xl:text-sm text-black/70 tabular-nums">
                            {formatPassedYear(education)}
                          </td>

                          <td className="px-3 2xl:px-5 py-4 align-top">
                            <span className="text-xs 2xl:text-sm text-black/55 line-clamp-2">
                              {education?.address || "—"}
                            </span>
                          </td>

                          <td className="px-3 2xl:px-5 py-4 align-top text-right pr-4 2xl:pr-5">
                            <div className="flex items-center justify-end gap-1.5 2xl:gap-2">
                              <button
                                type="button"
                                title="Edit"
                                disabled={loading}
                                onClick={() => handleEditEducation(education)}
                                className="w-7 h-7 2xl:w-8 2xl:h-8 rounded-lg border border-black/60 bg-[#dadada] text-black/70 flex items-center justify-center hover:bg-green-400 hover:text-white hover:border-transparent disabled:opacity-40 transition-all cursor-pointer"
                              >
                                <Pencil size={13} />
                              </button>

                              <button
                                type="button"
                                title="Delete"
                                disabled={loading}
                                onClick={() => handleDeleteEducation(education)}
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
              {list.map((education, idx) => {
                const hasLogo = Boolean(education?.instituteLogo?.url);
                const isCurrentlyStudying =
                  education?.currentlyStudying === true || !education?.passedYear;

                return (
                  <div
                    key={education._id || idx}
                    className="w-full border border-black/25 bg-[#dadada] p-5 rounded-xl shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {hasLogo ? (
                          <div className="w-11 h-11 rounded-lg border border-black/60 bg-[#dadada] overflow-hidden shrink-0">
                            <img
                              src={education.instituteLogo.url}
                              alt={education.instituteName}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-lg border border-black/60 bg-[#dadada] flex items-center justify-center text-sm font-semibold text-black/40 shrink-0">
                            {(education?.instituteName || "?").charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-black truncate leading-snug">
                            {education?.instituteName}
                          </h3>
                          <p className="text-xs text-black/50 mt-0.5">
                            {education?.study || "—"} · Record {String(idx + 1).padStart(2, "0")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          title="Edit"
                          disabled={loading}
                          onClick={() => handleEditEducation(education)}
                          className="w-8 h-8 rounded-lg border border-black/60 bg-[#dadada] text-black/70 flex items-center justify-center hover:bg-green-400 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          disabled={loading}
                          onClick={() => handleDeleteEducation(education)}
                          className="w-8 h-8 rounded-lg border border-black/60 bg-[#dadada] text-black/70 flex items-center justify-center hover:bg-[#E7000B] hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-center gap-2 flex-wrap text-xs text-black/70">
                      {isCurrentlyStudying ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-black bg-black text-white">
                          Current
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-black/20 bg-[#dadada] text-black/70">
                          Completed
                        </span>
                      )}

                      <span className="text-black/30">•</span>

                      <span className="inline-flex items-center gap-1">
                        <Calendar size={13} className="text-black/50" />
                        Year: {formatPassedYear(education)}
                      </span>
                    </div>

                    <div className="w-full h-px bg-black/15 my-3.5" />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-black/40">Grade</span>
                        <span className="font-semibold text-black">
                          {education?.grade?.value}
                          {education?.grade?.title?.toLowerCase() === "percentage" && "%"}{" "}
                          ({formatGradeTitle(education?.grade?.title)})
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-black/40">Location</span>
                        <span className="text-black/70 truncate block">{education?.address || "—"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          ADD EDUCATION MODAL
      ====================================================== */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={handleCloseAddForm}
        >
          <form
            onSubmit={handleAddEducation}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-black/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Add Education</h2>
                <p className="text-xs text-black/40 mt-1">
                  Add a new education record.
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

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2">
                Institute Name
              </label>
              <input
                type="text"
                name="instituteName"
                value={formData.instituteName}
                onChange={handleInputChange}
                placeholder="L.J. University"
                required
                className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-2">Study</label>
                <select
                  name="study"
                  value={formData.study}
                  onChange={handleInputChange}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm bg-white"
                >
                  <option value="">Select Study</option>
                  {STUDY_OPTIONS.map((study) => (
                    <option key={study} value={study}>
                      {study}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">Grade Type</label>
                <select
                  name="gradeTitle"
                  value={formData.gradeTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm bg-white"
                >
                  {GRADE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2">Grade Value</label>
              <input
                type="number"
                name="gradeValue"
                step="0.01"
                min="0"
                value={formData.gradeValue}
                onChange={handleInputChange}
                placeholder="88.66"
                required
                className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
              />
            </div>

            <div className="mb-4 p-4 rounded-xl border border-black/10 bg-black/[0.02]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.currentlyStudying}
                  onChange={handleCurrentlyStudyingChange}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <span className="text-sm font-medium">Currently Studying</span>
              </label>
              <p className="text-[11px] text-black/40 mt-1 ml-7">
                Check this if you are currently studying this course/program.
              </p>
            </div>

            {!formData.currentlyStudying && (
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2">Passed Year</label>
                <input
                  type="number"
                  name="passedYear"
                  value={formData.passedYear}
                  onChange={handleInputChange}
                  placeholder="2025"
                  min="1900"
                  max={new Date().getFullYear()}
                  required={!formData.currentlyStudying}
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ahmedabad, Gujarat"
                required
                rows={3}
                className="w-full px-3 py-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold mb-2">Institute Logo</label>
              <label className="w-full min-h-[90px] rounded-xl border border-dashed border-black/20 bg-black/[0.02] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/[0.04] transition">
                <Upload size={20} className="text-black/40" />
                <span className="text-xs text-black/50">
                  {formData.instituteLogo ? formData.instituteLogo.name : "Click to upload logo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>

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
                    Add Education
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          UPDATE EDUCATION MODAL
      ====================================================== */}
      {showUpdateForm && selectedEducation && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={handleCloseUpdateForm}
        >
          <form
            onSubmit={handleUpdateEducation}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-black/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Update Education</h2>
                <p className="text-xs text-black/40 mt-1">
                  Update <span className="font-medium">{selectedEducation?.instituteName}</span>
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

            {selectedEducation?.instituteLogo?.url && (
              <div className="mb-5 p-3 rounded-xl border border-black/10 bg-black/[0.02] flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-black/10 bg-white overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedEducation.instituteLogo.url}
                    alt={selectedEducation.instituteName}
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

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2">Institute Name</label>
              <input
                type="text"
                name="instituteName"
                value={formData.instituteName}
                onChange={handleInputChange}
                required
                className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-2">Study</label>
                <select
                  name="study"
                  value={formData.study}
                  onChange={handleInputChange}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm bg-white"
                >
                  <option value="">Select Study</option>
                  {STUDY_OPTIONS.map((study) => (
                    <option key={study} value={study}>
                      {study}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">Grade Type</label>
                <select
                  name="gradeTitle"
                  value={formData.gradeTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm bg-white"
                >
                  {GRADE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2">Grade Value</label>
              <input
                type="number"
                name="gradeValue"
                step="0.01"
                min="0"
                value={formData.gradeValue}
                onChange={handleInputChange}
                required
                className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
              />
            </div>

            <div className="mb-4 p-4 rounded-xl border border-black/10 bg-black/[0.02]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.currentlyStudying}
                  onChange={handleCurrentlyStudyingChange}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <span className="text-sm font-medium">Currently Studying</span>
              </label>
              <p className="text-[11px] text-black/40 mt-1 ml-7">
                Check this if you are currently studying this course/program.
              </p>
            </div>

            {!formData.currentlyStudying && (
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2">Passed Year</label>
                <input
                  type="number"
                  name="passedYear"
                  value={formData.passedYear}
                  onChange={handleInputChange}
                  placeholder="2025"
                  min="1900"
                  max={new Date().getFullYear()}
                  required={!formData.currentlyStudying}
                  className="w-full h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ahmedabad, Gujarat"
                required
                rows={3}
                className="w-full px-3 py-3 rounded-lg border border-black/15 outline-none focus:border-black text-sm resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold mb-2">Replace Institute Logo</label>
              <label className="w-full min-h-[90px] rounded-xl border border-dashed border-black/20 bg-black/[0.02] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/[0.04] transition">
                <Upload size={20} className="text-black/40" />
                <span className="text-xs text-black/50">
                  {formData.instituteLogo ? formData.instituteLogo.name : "Click to replace logo"}
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
                    Update Education
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

export default Education;