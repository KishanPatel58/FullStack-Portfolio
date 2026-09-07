import {
  GraduationCap,
  Pencil,
  PencilSparkles,
  Plus,
  Trash2,
  X,
  XIcon,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { UseAdmin } from "../../context/AdminContext";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import ChangingProgressProvider from "../../components/ChangingProgressProvider";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const knowledgeLevels = [
  "Beginner",
  "Elementary",
  "Intermediate",
  "Upper-Intermediate",
  "Advanced",
  "Expert",
  "Specialist",
];

const Skills = () => {
  const { admin } = UseAdmin();

  // =========================================================
  // FORM STATE
  // =========================================================

  const [skillName, setSkillName] = useState("");
  const [levelOfKnowledge, setLevelOfKnowledge] = useState("");
  const [category, setCategory] = useState("");
  const [skillImage, setSkillImage] = useState(null);
  const [skillImagePreview, setSkillImagePreview] = useState("");

  // null = add mode, skill object = edit mode
  const [editingSkill, setEditingSkill] = useState(null);

  // =========================================================
  // CATEGORY FORM
  // =========================================================

  const [categoryName, setCategoryName] = useState("");

  // =========================================================
  // UI STATE
  // =========================================================

  const [skillFormShow, setSkillFormShow] = useState(false);
  const [categoryAddFormShow, setCategoryAddFormShow] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryDeleteLoading, setCategoryDeleteLoading] = useState(false);
  const [skillLoading, setSkillLoading] = useState(false);
  const [skillDeleteLoading, setSkillDeleteLoading] = useState(false);

  // =========================================================
  // DATA
  // =========================================================

  const [skillsList, setSkillsList] = useState([]);
  const [Categories, setCategories] = useState([]);

  const isEditMode = Boolean(editingSkill);

  // =========================================================
  // DIRTY CHECK
  // =========================================================

  const isSkillFormDirty = useMemo(() => {
    if (!isEditMode) return true;

    const originalName = (editingSkill?.name || "").trim();
    const originalLevel = editingSkill?.levelOfKnowledge || "";
    const originalCategory = String(
      editingSkill?.category?._id || editingSkill?.category || ""
    );

    const nameChanged = skillName.trim() !== originalName;
    const levelChanged = levelOfKnowledge !== originalLevel;
    const categoryChanged = String(category) !== originalCategory;
    const imageChanged = skillImage !== null;

    return nameChanged || levelChanged || categoryChanged || imageChanged;
  }, [
    isEditMode,
    editingSkill,
    skillName,
    levelOfKnowledge,
    category,
    skillImage,
  ]);

  // =========================================================
  // CAN SUBMIT SKILL
  // =========================================================

  const canSubmitSkill =
    Boolean(skillName.trim()) &&
    Boolean(levelOfKnowledge) &&
    Boolean(category) &&
    (!isEditMode || isSkillFormDirty);

  // =========================================================
  // RESET SKILL FORM
  // =========================================================

  const resetSkillForm = () => {
    if (skillImage && skillImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(skillImagePreview);
    }

    setSkillName("");
    setLevelOfKnowledge("");
    setCategory("");
    setSkillImage(null);
    setSkillImagePreview("");
    setEditingSkill(null);

    const input = document.getElementById("SkillImg");
    if (input) {
      input.value = "";
    }
  };

  // =========================================================
  // OPEN ADD SKILL FORM
  // =========================================================

  const openAddSkillForm = () => {
    resetSkillForm();
    setSkillFormShow(true);
  };

  // =========================================================
  // OPEN EDIT SKILL FORM
  // =========================================================

  const openEditSkillForm = (skill) => {
    if (skillImage && skillImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(skillImagePreview);
    }

    setEditingSkill(skill);
    setSkillName(skill.name || "");
    setLevelOfKnowledge(skill.levelOfKnowledge || "");
    setCategory(
      skill.category?._id
        ? String(skill.category._id)
        : skill.category
        ? String(skill.category)
        : ""
    );
    setSkillImage(null);
    setSkillImagePreview(skill.technology?.url || "");
    setSkillFormShow(true);

    const input = document.getElementById("SkillImg");
    if (input) {
      input.value = "";
    }
  };

  // =========================================================
  // CLOSE SKILL FORM
  // =========================================================

  const closeSkillForm = () => {
    resetSkillForm();
    setSkillFormShow(false);
  };

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/api/admin/categories", {
        withCredentials: true,
      });

      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.log(`Error to Fetch Categories: ${error}`);
    }
  };

  // =========================================================
  // ADD CATEGORY
  // =========================================================

  const handleCategory = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setCategoryLoading(true);
    const toasts = toast.loading("Adding Category...");

    try {
      const { data } = await api.post(
        "/api/admin/categories/add",
        {
          name: categoryName.trim(),
        },
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setCategories((prev) => [...prev, data.category]);
        setCategoryName("");
        setCategoryAddFormShow(false);
        toast.success(data.message || "Category added.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to Add Category..."
      );
    } finally {
      toast.dismiss(toasts);
      setCategoryLoading(false);
    }
  };

  // =========================================================
  // DELETE CATEGORY
  // =========================================================

  const deleteCategory = async (id) => {
    if (
      !window.confirm(
        "Do you want to delete this category? Related skills will also be deleted."
      )
    ) {
      return;
    }

    setCategoryDeleteLoading(true);
    const toasts = toast.loading("Deleting Category...");

    try {
      await api.delete(`/api/admin/categories/${id}/delete`, {
        withCredentials: true,
      });

      toast.success("Category deleted.");
      setCategories((prev) => prev.filter((c) => c._id !== id));
      fetchSkills();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete category..."
      );
    } finally {
      setCategoryDeleteLoading(false);
      toast.dismiss(toasts);
    }
  };

  // =========================================================
  // FETCH SKILLS
  // =========================================================

  const fetchSkills = async () => {
    try {
      const { data } = await api.get("/api/admin/skills", {
        withCredentials: true,
      });

      if (data.success) {
        setSkillsList(data.skills || []);
      }
    } catch (error) {
      console.log(`Failed to Get Skills: ${error}`);
    }
  };

  // =========================================================
  // ADD / UPDATE SKILL
  // =========================================================

  const handleSkillSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmitSkill) return;

    setSkillLoading(true);
    const toasts = toast.loading(
      isEditMode ? "Updating Skill..." : "Adding Skill..."
    );

    try {
      const formData = new FormData();
      formData.append("name", skillName.trim());
      formData.append("levelOfKnowledge", levelOfKnowledge);
      formData.append("category", category);

      if (skillImage) {
        formData.append("skill", skillImage);
      }

      let data;

      if (isEditMode) {
        const res = await api.put(
          `/api/admin/skills/${editingSkill._id}/update`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        data = res.data;

        if (data.success) {
          setSkillsList((prev) =>
            prev.map((s) => (s._id === editingSkill._id ? data.skill : s))
          );
          toast.success(data.message || "Skill updated.");
        }
      } else {
        const res = await api.post("/api/admin/skills/add", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });

        data = res.data;

        if (data.success) {
          setSkillsList((prev) => [...prev, data.skill]);
          toast.success(data.message || "Skill added.");
        }
      }

      if (data?.success) {
        closeSkillForm();
      }
    } catch (error) {
      console.log(`Failed to save skill: ${error}`);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save skill."
      );
    } finally {
      toast.dismiss(toasts);
      setSkillLoading(false);
    }
  };

  // =========================================================
  // DELETE SKILL
  // =========================================================

  const deleteSkill = async (id) => {
    if (!window.confirm("Do you want to delete this skill?")) {
      return;
    }

    setSkillDeleteLoading(true);
    const toasts = toast.loading("Deleting Skill...");

    try {
      const { data } = await api.delete(`/api/admin/skills/${id}/delete`, {
        withCredentials: true,
      });

      if (data.success) {
        setSkillsList((prev) => prev.filter((s) => s._id !== id));
        toast.success(data.message || "Skill deleted.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete skill."
      );
    } finally {
      setSkillDeleteLoading(false);
      toast.dismiss(toasts);
    }
  };

  // =========================================================
  // SKILL IMAGE CHANGE
  // =========================================================

  const handleSkillImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (skillImage && skillImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(skillImagePreview);
    }

    if (!file) {
      setSkillImage(null);
      if (isEditMode && editingSkill?.technology?.url) {
        setSkillImagePreview(editingSkill.technology.url);
      } else {
        setSkillImagePreview("");
      }
      return;
    }

    setSkillImage(file);
    setSkillImagePreview(URL.createObjectURL(file));
  };

  // =========================================================
  // REMOVE SKILL IMAGE
  // =========================================================

  const removeSkillImage = () => {
    if (skillImage && skillImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(skillImagePreview);
    }

    setSkillImage(null);
    if (isEditMode && editingSkill?.technology?.url) {
      setSkillImagePreview(editingSkill.technology.url);
    } else {
      setSkillImagePreview("");
    }

    const input = document.getElementById("SkillImg");
    if (input) {
      input.value = "";
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchCategories();
    fetchSkills();
  }, []);

  // =========================================================
  // CLEANUP IMAGE PREVIEW
  // =========================================================

  useEffect(() => {
    return () => {
      if (skillImage && skillImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(skillImagePreview);
      }
    };
  }, [skillImage, skillImagePreview]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <div className="relative w-full h-screen flex flex-col bg-[#dadada] text-black antialiased overflow-hidden">
        {/* =====================================================
            TOP BAR
        ====================================================== */}
        <div className="TopBar w-full h-16 border-b border-[#0000009b] bg-[#dadada] flex items-center justify-between px-6 sm:px-8 shrink-0">
          {/* TITLE */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
              <GraduationCap size={18} />
            </div>

            <div>
              <h1 className="text-base font-semibold leading-none">Skills</h1>
              <p className="text-[11px] text-black/40 mt-1">
                {skillsList.length} record{skillsList.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* ADD BUTTON */}
          <button
            type="button"
            onClick={openAddSkillForm}
            className="bg-black text-white h-9 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
          >
            Add Skill
            <Plus size={16} />
          </button>
        </div>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}
        <div className="MainContent w-full flex-1 flex flex-col justify-start items-center relative overflow-hidden">
          {/* ===================================================
              SKILLS SECTION (GRID CONTAINER)
          ==================================================== */}
          <div className="w-full h-1/2 border-b border-[#0000009b] p-4 sm:p-5 overflow-y-auto">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Skills<span className="animate-pulse">_</span>
            </h1>

            {skillsList.length > 0 ? (
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 mt-4 pb-2">
                {skillsList.map((skill) => (
                  <div
                    className="relative flex flex-col items-center justify-center p-3 rounded-2xl border border-black/15 bg-white/50 hover:bg-white/80 transition-all duration-300 group shadow-2xs"
                    key={skill._id}
                  >
                    {/* ACTIONS */}
                    <div className="absolute top-2 right-2 w-auto h-auto flex items-center justify-between gap-1 z-20 bg-[#dadada] p-1 opacity-0 pointer-events-none group-hover:!pointer-events-auto group-hover:opacity-100 transition-all duration-200 border border-black/30 rounded-lg shadow-xs">
                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() => openEditSkillForm(skill)}
                        className="p-1 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors cursor-pointer"
                        title="Edit skill"
                      >
                        <Pencil size={12} />
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => deleteSkill(skill._id)}
                        disabled={skillDeleteLoading}
                        className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-md disabled:opacity-50 transition-colors cursor-pointer"
                        title="Delete skill"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* CIRCULAR PROGRESS */}
                    <div className="w-24 h-24 my-2">
                      <ChangingProgressProvider values={[0, skill.level || 0]}>
                        {() => (
                          <CircularProgressbarWithChildren
                            value={skill.level || 0}
                            styles={buildStyles({
                              pathTransition: !skill.level
                                ? "none"
                                : "stroke-dashoffset 0.5s ease 0s",
                              pathColor: "#000",
                              trailColor: "#c2c2c2",
                            })}
                          >
                            {skill?.technology?.url ? (
                              <img
                                style={{
                                  height: 28,
                                  width: 28,
                                  objectFit: "contain",
                                  marginTop: -4,
                                  marginBottom: 4,
                                }}
                                src={skill.technology.url}
                                alt={skill.name}
                              />
                            ) : null}

                            <div
                              style={{
                                fontSize: 11,
                                marginTop: -2,
                              }}
                            >
                              <strong>{skill.level || 0}%</strong>
                            </div>
                          </CircularProgressbarWithChildren>
                        )}
                      </ChangingProgressProvider>
                    </div>

                    {/* SKILL NAME CHIP */}
                    <p className="w-full text-center text-xs mt-1 flex items-center justify-center gap-1.5 border border-black/20 bg-white/80 rounded-md py-1 px-2 font-semibold truncate shadow-2xs">
                      <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse shrink-0" />
                      <span className="truncate">{skill.name}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-[80%] min-h-[140px] flex justify-center items-center">
                <span className="flex items-center justify-center gap-2 text-lg font-semibold text-black/30 italic relative border border-dashed border-black/25 px-6 py-2 rounded-lg">
                  No Skills Found
                  <PencilSparkles size={18} className="text-black/30" />
                </span>
              </div>
            )}
          </div>

          {/* ===================================================
              CATEGORIES SECTION
          ==================================================== */}
          <div className="w-full h-1/2 p-4 sm:p-5 overflow-y-auto">
            <div className="flex w-full justify-between items-center mb-3">
              <h1 className="text-xl sm:text-2xl font-semibold">
                Category<span className="animate-pulse">_</span>
              </h1>

              <button
                type="button"
                onClick={() => setCategoryAddFormShow(true)}
                className="bg-black text-white h-8 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
              >
                Add Category
                <Plus size={15} />
              </button>
            </div>

            <div
              className={`w-full flex gap-2 pt-1 ${
                Categories.length > 0
                  ? "flex-wrap content-start"
                  : "justify-center items-center min-h-[120px]"
              }`}
            >
              {Categories.length > 0 ? (
                Categories.map((cat) => (
                  <span
                    key={cat._id}
                    className="w-auto shrink-0 flex items-center justify-between border border-black/30 bg-white/70 px-3 py-1.5 gap-2.5 rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    {cat.name?.toUpperCase()}

                    <button
                      type="button"
                      onClick={() => deleteCategory(cat._id)}
                      disabled={categoryDeleteLoading}
                      className="p-1 bg-[#E7000B] hover:bg-red-700 text-white rounded-md disabled:opacity-50 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      {categoryDeleteLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </span>
                ))
              ) : (
                <div className="w-full h-full flex justify-center items-center">
                  <span className="flex items-center justify-center gap-2 text-lg font-semibold text-black/30 italic relative border border-dashed border-black/25 px-6 py-2 rounded-lg">
                    No Categories Found
                    <PencilSparkles size={18} className="text-black/30" />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================
          ADD / EDIT SKILL MODAL FORM
      ======================================================== */}
      {skillFormShow && (
        <div
          onClick={closeSkillForm}
          className="fixed inset-0 z-[3000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSkillSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-black/10 flex flex-col gap-4 relative"
          >
            {/* CLOSE */}
            <button
              type="button"
              onClick={closeSkillForm}
              className="absolute top-4 right-4 text-black/50 hover:text-black transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* TITLE */}
            <div>
              <h2 className="text-lg font-bold text-black">
                {isEditMode ? "Update Skill" : "Add Skill"}
              </h2>
              <p className="text-[11px] text-black/40 mt-0.5">
                Configure your proficiency rating and icon badge
              </p>
            </div>

            {/* SKILL NAME */}
            <div className="w-full flex flex-col gap-1.5">
              <label htmlFor="skill" className="text-xs font-semibold">
                Skill Name
              </label>
              <input
                type="text"
                id="skill"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. React, TypeScript, Docker"
                className="w-full h-10 px-3 rounded-lg border border-black/20 text-xs outline-none focus:border-black"
                required
              />
            </div>

            {/* CATEGORY */}
            <div className="w-full flex flex-col gap-1.5">
              <label htmlFor="category" className="text-xs font-semibold">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-black/20 text-xs outline-none focus:border-black bg-white"
                required
              >
                <option value="">Select category</option>
                {Categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* LEVEL */}
            <div className="w-full flex flex-col gap-1.5">
              <label htmlFor="level" className="text-xs font-semibold">
                Level of Knowledge
              </label>
              <select
                id="level"
                value={levelOfKnowledge}
                onChange={(e) => setLevelOfKnowledge(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-black/20 text-xs outline-none focus:border-black bg-white"
                required
              >
                <option value="">Select level</option>
                {knowledgeLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* SKILL IMAGE */}
            <div className="w-full flex flex-col gap-1.5">
              <span className="text-xs font-semibold">Skill Icon</span>

              {!skillImagePreview ? (
                <label
                  htmlFor="SkillImg"
                  className="w-full h-20 border border-dashed border-black/25 bg-black/[0.02] hover:bg-black/[0.04] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="text-xs text-black/50">Click to upload icon</span>
                </label>
              ) : (
                <div className="w-full h-24 relative border border-black/20 rounded-xl p-2 flex items-center justify-center bg-black/[0.02]">
                  <img
                    src={skillImagePreview}
                    alt="Skill preview"
                    className="max-h-full object-contain"
                  />
                  {(skillImage || !isEditMode) && (
                    <button
                      type="button"
                      onClick={removeSkillImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer shadow-sm"
                      title="Remove image"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}

              <input
                type="file"
                id="SkillImg"
                accept="image/*"
                hidden
                onChange={handleSkillImageChange}
              />

              {isEditMode && (
                <label
                  htmlFor="SkillImg"
                  className="text-[11px] text-black/60 underline cursor-pointer hover:text-black"
                >
                  {skillImage ? "Change selected file" : "Replace current image"}
                </label>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={skillLoading || !canSubmitSkill}
              className="w-full h-10 bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors cursor-pointer mt-2"
            >
              {skillLoading && (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {skillLoading
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                ? isSkillFormDirty
                  ? "Update Skill"
                  : "No Changes"
                : "Add Skill"}
            </button>
          </form>
        </div>
      )}

      {/* =======================================================
          ADD CATEGORY MODAL FORM
      ======================================================== */}
      {categoryAddFormShow && (
        <div
          onClick={() => setCategoryAddFormShow(false)}
          className="fixed inset-0 z-[3000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleCategory}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-black/10 flex flex-col gap-4 relative"
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <h2 className="text-base font-bold text-black">Add Category</h2>
              <button
                type="button"
                onClick={() => setCategoryAddFormShow(false)}
                className="text-black/40 hover:text-black cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <label htmlFor="categoryName" className="text-xs font-semibold">
                Category Name
              </label>
              <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Frontend, Backend, DevOps"
                className="w-full h-10 px-3 rounded-lg border border-black/20 text-xs outline-none focus:border-black"
                required
              />
            </div>

            <button
              type="submit"
              disabled={categoryLoading}
              className="w-full h-10 bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {categoryLoading && (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {categoryLoading ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Skills;