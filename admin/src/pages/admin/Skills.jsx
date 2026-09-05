import { GraduationCap, Pencil, PencilSparkles, Plus, Trash2, X } from "lucide-react";
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

  // Form state
  const [skillName, setSkillName] = useState("");
  const [levelOfKnowledge, setLevelOfKnowledge] = useState("");
  const [category, setCategory] = useState("");
  const [skillImage, setSkillImage] = useState(null); // new File only
  const [skillImagePreview, setSkillImagePreview] = useState("");

  // null = add mode, skill object = edit mode
  const [editingSkill, setEditingSkill] = useState(null);

  // Category form
  const [categoryName, setCategoryName] = useState("");

  // UI
  const [skillFormShow, setSkillFormShow] = useState(false);
  const [categoryAddFormShow, setCategoryAddFormShow] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryDeleteLoading, setCategoryDeleteLoading] = useState(false);
  const [skillLoading, setSkillLoading] = useState(false);
  const [skillDeleteLoading, setSkillDeleteLoading] = useState(false);

  // Data
  const [skillsList, setSkillsList] = useState([]);
  const [Categories, setCategories] = useState([]);

  const isEditMode = Boolean(editingSkill);

  // Dirty check for edit mode
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

  const canSubmitSkill =
    Boolean(skillName.trim()) &&
    Boolean(levelOfKnowledge) &&
    Boolean(category) &&
    (!isEditMode || isSkillFormDirty);

  // ---------- Reset / open / close form ----------
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
    if (input) input.value = "";
  };

  const openAddSkillForm = () => {
    resetSkillForm();
    setSkillFormShow(true);
  };

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
    if (input) input.value = "";
  };

  const closeSkillForm = () => {
    resetSkillForm();
    setSkillFormShow(false);
  };

  // ---------- Categories ----------
  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/api/admin/categories", {
        withCredentials: true,
      });
      if (data.success) setCategories(data.categories || []);
    } catch (error) {
      console.log(`Error to Fetch Categories: ${error}`);
    }
  };

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
        { name: categoryName.trim() },
        { withCredentials: true }
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

  // ---------- Skills ----------
  const fetchSkills = async () => {
    try {
      const { data } = await api.get("/api/admin/skills", {
        withCredentials: true,
      });
      if (data.success) setSkillsList(data.skills || []);
    } catch (error) {
      console.log(`Failed to Get Skills: ${error}`);
    }
  };

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
            headers: { "Content-Type": "multipart/form-data" },
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
          headers: { "Content-Type": "multipart/form-data" },
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

  const deleteSkill = async (id) => {
    if (!window.confirm("Do you want to delete this skill?")) return;

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

  const handleSkillImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (skillImage && skillImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(skillImagePreview);
    }

    if (!file) {
      setSkillImage(null);
      // keep existing server preview in edit mode
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

  const removeSkillImage = () => {
    if (skillImage && skillImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(skillImagePreview);
    }
    setSkillImage(null);

    // In edit mode, restore original image preview if any
    if (isEditMode && editingSkill?.technology?.url) {
      setSkillImagePreview(editingSkill.technology.url);
    } else {
      setSkillImagePreview("");
    }

    const input = document.getElementById("SkillImg");
    if (input) input.value = "";
  };

  useEffect(() => {
    fetchCategories();
    fetchSkills();
  }, []);

  useEffect(() => {
    return () => {
      if (skillImage && skillImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(skillImagePreview);
      }
    };
  }, [skillImage, skillImagePreview]);

  return (
    <>
      <div className="relative w-full h-screen flex flex-col justify-center items-center">
        <div className="TopBar w-full h-[8%] border-b border-[#0000009b] flex items-center justify-between px-[28px]">
          <span className="flex items-center justify-center gap-2 text-xl font-semibold">
            <GraduationCap size={30} /> Skills
          </span>
          <button
            type="button"
            onClick={openAddSkillForm}
            className="bg-black text-white p-[5px_20px] rounded-lg flex items-center justify-center gap-2 font-semibold cursor-pointer"
          >
            Add <Plus color="#ffffff" size={18} />
          </button>
        </div>

        <div className="MainContent w-full h-[92%] flex flex-col justify-center items-center relative">
          {/* Skills */}
          <div className="w-full h-[50%] border-b border-[#0000009b] p-4 overflow-auto">
            <h1 className="text-2xl">
              Skills<span className="animate-pulse">_</span>
            </h1>
            <div className="w-full h-auto flex flex-wrap gap-2 px-2 mt-5">
              {skillsList.length > 0 ? (
                skillsList.map((skill) => (
                  <div
                    className="h-30 w-30 relative flex justify-center items-center flex-col group shrink-0 mt-4"
                    key={skill._id}
                  >
                    <div className="absolute top-0 right-0 w-auto h-auto flex items-center justify-between gap-2 z-20 bg-[#dadada] p-[5px] opacity-0 pointer-events-none group-hover:!pointer-events-auto group-hover:opacity-100 transition-all duration-300 border rounded-lg">
                      <button
                        type="button"
                        onClick={() => openEditSkillForm(skill)}
                        className="p-1 bg-green-400 text-white rounded-lg edit-icon"
                        title="Edit skill"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSkill(skill._id)}
                        disabled={skillDeleteLoading}
                        className="p-1 bg-red-400 text-white rounded-lg disabled:opacity-50"
                        title="Delete skill"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <ChangingProgressProvider values={[0, skill.level || 0]}>
                      {() => (
                        <CircularProgressbarWithChildren
                          value={skill.level || 0}
                          styles={buildStyles({
                            pathTransition: !skill.level
                              ? "none"
                              : "stroke-dashoffset 0.5s ease 0s",
                            pathColor: "#000",
                            trailColor: "#dadada",
                          })}
                        >
                          {skill?.technology?.url ? (
                            <img
                              style={{
                                height: 30,
                                marginTop: -5,
                                marginBottom: 5,
                              }}
                              src={skill.technology.url}
                              alt={skill.name}
                            />
                          ) : null}
                          <div style={{ fontSize: 12, marginTop: -5 }}>
                            <strong>{skill.level || 0}%</strong>
                          </div>
                        </CircularProgressbarWithChildren>
                      )}
                    </ChangingProgressProvider>
                    <p className="text-center text-sm mt-1">{skill.name}</p>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex justify-center items-center">
                  <span className="flex items-center justify-center gap-2 text-xl font-semibold text-black/20 italic relative border border-dashed border-black/20 p-[9px_24px] w-fit">
                    No Skills Found{" "}
                    <PencilSparkles className="text-black/20" />
                    <div className="absolute w-3 h-3 bg-black/25 -top-1.5 -left-1.5" />
                    <div className="absolute w-3 h-3 bg-black/25 -top-1.5 -right-1.5" />
                    <div className="absolute w-3 h-3 bg-black/25 -bottom-1.5 -left-1.5" />
                    <div className="absolute w-3 h-3 bg-black/25 -bottom-1.5 -right-1.5" />
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="w-full h-[50%] p-4">
            <div className="flex w-full h-[10%] justify-between items-center">
              <h1 className="text-2xl">
                Category<span className="animate-pulse">_</span>
              </h1>
              <button
                type="button"
                onClick={() => setCategoryAddFormShow(true)}
                className="bg-black text-white p-[5px_20px] rounded-lg flex items-center justify-center gap-2 font-semibold cursor-pointer"
              >
                Add <Plus color="#ffffff" size={18} />
              </button>
            </div>

            <div
              className={`w-full h-[90%] flex gap-2 px-2 mt-5 ${
                Categories.length > 0
                  ? "flex-wrap content-start"
                  : "justify-center items-center"
              }`}
            >
              {Categories.length > 0 ? (
                Categories.map((cat) => (
                  <span
                    key={cat._id}
                    className="w-auto shrink-0 flex items-center justify-between border border-[#0000009b] p-[5px] gap-3 rounded-lg font-semibold h-fit"
                  >
                    {cat.name?.toUpperCase()}
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat._id)}
                      disabled={categoryDeleteLoading}
                      className="p-1 bg-[#E7000B] text-white rounded-lg disabled:opacity-50"
                    >
                      {categoryDeleteLoading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <Trash2 />
                      )}
                    </button>
                  </span>
                ))
              ) : (
                <div className="w-full h-full flex justify-center items-center">
                  <span className="flex items-center justify-center gap-2 text-xl font-semibold text-black/20 italic relative border border-dashed border-black/20 p-[9px_24px] w-fit">
                    No Categories Found{" "}
                    <PencilSparkles className="text-black/20" />
                    <div className="absolute w-3 h-3 bg-black/25 -top-1.5 -left-1.5" />
                    <div className="absolute w-3 h-3 bg-black/25 -top-1.5 -right-1.5" />
                    <div className="absolute w-3 h-3 bg-black/25 -bottom-1.5 -left-1.5" />
                    <div className="absolute w-3 h-3 bg-black/25 -bottom-1.5 -right-1.5" />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Skill Form */}
      {skillFormShow && (
        <div
          onClick={closeSkillForm}
          className="min-w-screen min-h-screen flex items-center justify-center fixed top-0 right-0 bg-black/20 z-[3000]"
        >
          <form
            onSubmit={handleSkillSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-[90%] sm:w-[30%] h-auto flex flex-col justify-center items-center bg-white rounded-lg p-3 gap-3 relative"
          >
            <button
              type="button"
              onClick={closeSkillForm}
              className="absolute top-3 right-3 text-black/50 hover:text-black"
            >
              <X size={20} />
            </button>

            <h1 className="text-2xl font-semibold">
              {isEditMode ? "Update Skill" : "Add Skill"}
            </h1>

            <div className="w-full flex justify-start items-start flex-col gap-2">
              <label htmlFor="skill">Skill</label>
              <input
                type="text"
                id="skill"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="HTML"
                className="w-full border outline-4 outline-transparent focus:border-transparent focus:outline-black text-lg transition-all duration-300 p-[5px_20px] rounded-lg"
                required
              />
            </div>

            <div className="w-full flex justify-start items-start flex-col gap-2">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border outline-4 outline-transparent focus:border-transparent focus:outline-black text-lg transition-all duration-300 p-[5px_20px] rounded-lg"
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

            <div className="w-full flex justify-start items-start flex-col gap-2">
              <label htmlFor="level">Level of knowledge</label>
              <select
                id="level"
                value={levelOfKnowledge}
                onChange={(e) => setLevelOfKnowledge(e.target.value)}
                className="w-full border outline-4 outline-transparent focus:border-transparent focus:outline-black text-lg transition-all duration-300 p-[5px_20px] rounded-lg"
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

            <div className="w-full flex justify-start items-start flex-col gap-2">
              <span className="text-sm font-medium">Skill Image</span>

              {!skillImagePreview ? (
                <label
                  htmlFor="SkillImg"
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-black/30 p-3 rounded-lg cursor-pointer hover:bg-black/5 transition-colors"
                >
                  Click to Upload Image
                </label>
              ) : (
                <div className="w-full relative border border-black/20 rounded-lg p-2 flex items-center justify-center">
                  <img
                    src={skillImagePreview}
                    alt="Skill preview"
                    className="max-h-40 object-contain rounded-md"
                  />
                  {(skillImage || !isEditMode) && (
                    <button
                      type="button"
                      onClick={removeSkillImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      title="Remove image"
                    >
                      ×
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
                  className="text-xs text-black/60 underline cursor-pointer"
                >
                  {skillImage ? "Change selected image" : "Change image"}
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={skillLoading || !canSubmitSkill}
              className="w-full bg-black text-white text-xl py-2 rounded-lg font-semibold flex items-center justify-center gap-3 disabled:bg-black/40 disabled:cursor-not-allowed"
            >
              {skillLoading && (
                <span className="h-5 w-5 border-2 border-t-transparent animate-spin border-white rounded-full" />
              )}
              {skillLoading
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                  ? isSkillFormDirty
                    ? "Update"
                    : "No changes"
                  : "Add"}
            </button>
          </form>
        </div>
      )}

      {/* Category Add Form */}
      {categoryAddFormShow && (
        <div
          onClick={() => setCategoryAddFormShow(false)}
          className="min-w-screen min-h-screen flex items-center justify-center fixed top-0 right-0 bg-black/20 z-[3000]"
        >
          <form
            onSubmit={handleCategory}
            onClick={(e) => e.stopPropagation()}
            className="w-[90%] sm:w-[30%] h-auto flex flex-col justify-center items-center bg-white rounded-lg p-3 gap-3"
          >
            <h1 className="text-2xl font-semibold">Add Category</h1>
            <div className="w-full flex justify-start items-start flex-col gap-2">
              <label htmlFor="categoryName">Category</label>
              <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Frontend"
                className="w-full border outline-4 outline-transparent focus:border-transparent focus:outline-black text-lg transition-all duration-300 p-[5px_20px] rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={categoryLoading}
              className="w-full bg-black text-white text-xl py-2 rounded-lg font-semibold flex items-center justify-center gap-3 disabled:bg-black/50"
            >
              {categoryLoading && (
                <span className="h-5 w-5 border-2 border-t-transparent animate-spin border-white rounded-full" />
              )}
              {categoryLoading ? "Adding..." : "Add"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Skills;