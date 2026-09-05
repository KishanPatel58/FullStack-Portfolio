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
  {
    value: "percentage",
    label: "Percentage",
  },
  {
    value: "cgpa",
    label: "CGPA",
  },
  {
    value: "gpa",
    label: "GPA",
  },
  {
    value: "spi",
    label: "SPI",
  },
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

  // =========================================================
  // EDUCATION STATE
  // =========================================================

  const [educations, setEducations] = useState([]);

  const [loading, setLoading] = useState(false);

  const [fetchLoading, setFetchLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // MODAL STATE
  // =========================================================

  const [showAddForm, setShowAddForm] = useState(false);

  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const [selectedEducation, setSelectedEducation] =
    useState(null);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] =
    useState(initialFormData);

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      ...initialFormData,
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
  // HANDLE CURRENTLY STUDYING CHECKBOX
  // =========================================================

  const handleCurrentlyStudyingChange = (e) => {
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      currentlyStudying: checked,

      // Clear year when currently studying
      // is enabled.
      passedYear: checked
        ? ""
        : prev.passedYear,
    }));
  };

  // =========================================================
  // HANDLE LOGO CHANGE
  // =========================================================

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      instituteLogo: file,
    }));
  };

  // =========================================================
  // FETCH EDUCATIONS
  // =========================================================

  const fetchEducations = async () => {
    try {
      setFetchLoading(true);

      setError("");

      const { data } = await api.get(
        "/api/admin/education",
        {
          withCredentials: true,
        }
      );

      if (data?.success) {
        setEducations(
          Array.isArray(data?.educations)
            ? data.educations
            : []
        );
      } else {
        setEducations([]);
      }
    } catch (error) {
      console.error(
        "Fetch education error:",
        error
      );

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

  // =========================================================
  // FETCH WHEN COMPONENT LOADS
  // =========================================================

  useEffect(() => {
    fetchEducations();
  }, []);

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const handleOpenAddForm = () => {
    resetForm();

    setSelectedEducation(null);

    setShowUpdateForm(false);

    setShowAddForm(true);

    setError("");
  };

  // =========================================================
  // CLOSE ADD FORM
  // =========================================================

  const handleCloseAddForm = () => {
    if (loading) return;

    setShowAddForm(false);

    resetForm();

    setError("");
  };

  // =========================================================
  // HANDLE ADD EDUCATION
  // =========================================================

  const handleAddEducation = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      setError("");

      // -------------------------------------------------------
      // VALIDATION
      // -------------------------------------------------------

      if (!formData.instituteName.trim()) {
        throw new Error(
          "Institute name is required."
        );
      }

      if (!formData.study) {
        throw new Error(
          "Please select study."
        );
      }

      if (
        formData.gradeValue === "" ||
        formData.gradeValue === null
      ) {
        throw new Error(
          "Grade value is required."
        );
      }

      if (!formData.address.trim()) {
        throw new Error(
          "Address is required."
        );
      }

      // Passed year is required only when
      // currently studying is false.
      if (!formData.currentlyStudying) {
        const year = Number(formData.passedYear);
        const currentYear = new Date().getFullYear();

        if (!formData.passedYear) {
          throw new Error("Passed year is required.");
        }

        if (
          !Number.isInteger(year) ||
          year < 1900 ||
          year > currentYear
        ) {
          throw new Error(
            `Please enter a valid year between 1900 and ${currentYear}.`
          );
        }
      }

      // -------------------------------------------------------
      // FORM DATA
      // -------------------------------------------------------

      const data = new FormData();

      data.append(
        "instituteName",
        formData.instituteName.trim()
      );

      // IMPORTANT:
      // study contains actual study.
      // Example: IT / AIML / CSE
      //
      // NEVER send "Active".
      data.append(
        "study",
        formData.study
      );

      data.append(
        "grade",
        JSON.stringify({
          title: formData.gradeTitle,
          value: Number(formData.gradeValue),
        })
      );

      // -------------------------------------------------------
      // CURRENTLY STUDYING
      // -------------------------------------------------------

      data.append(
        "currentlyStudying",
        String(formData.currentlyStudying)
      );

      // -------------------------------------------------------
      // PASSED YEAR
      // -------------------------------------------------------

      if (
        !formData.currentlyStudying &&
        formData.passedYear
      ) {
        data.append(
          "passedYear",
          formData.passedYear
        );
      }

      // -------------------------------------------------------
      // ADDRESS
      // -------------------------------------------------------

      data.append(
        "address",
        formData.address.trim()
      );

      // -------------------------------------------------------
      // LOGO
      // -------------------------------------------------------

      if (formData.instituteLogo) {
        data.append(
          "educationLogo",
          formData.instituteLogo
        );
      }

      // -------------------------------------------------------
      // API REQUEST
      // -------------------------------------------------------

      const response = await api.post(
        "/api/admin/education/add",
        data,
        {
          withCredentials: true,
        }
      );

      const result = response.data;

      // -------------------------------------------------------
      // CHECK RESPONSE
      // -------------------------------------------------------

      if (!result?.success) {
        throw new Error(
          result?.message ||
          "Failed to add education."
        );
      }

      // -------------------------------------------------------
      // UPDATE UI
      // -------------------------------------------------------

      if (result?.education) {
        setEducations((prev) => [
          result.education,
          ...prev,
        ]);
      } else {
        await fetchEducations();
      }

      // -------------------------------------------------------
      // CLOSE FORM
      // -------------------------------------------------------

      setShowAddForm(false);

      resetForm();
    } catch (error) {
      console.error(
        "Add education error:",
        error
      );

      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add education."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // OPEN UPDATE FORM
  // =========================================================

  const handleEditEducation = (education) => {
    if (!education?._id) {
      setError(
        "Education ID not found."
      );

      return;
    }

    // -------------------------------------------------------
    // CONVERT MONGODB DATE -> YYYY-MM-DD
    // -------------------------------------------------------

    let passedYear = "";

    if (education?.passedYear) {
      // New database format: 2025
      if (typeof education.passedYear === "number") {
        passedYear = String(education.passedYear);
      } else {
        // Backward compatibility for old Date values
        const date = new Date(education.passedYear);

        if (!Number.isNaN(date.getTime())) {
          passedYear = String(date.getFullYear());
        }
      }
    }

    // -------------------------------------------------------
    // DETERMINE CURRENTLY STUDYING
    // -------------------------------------------------------
    //
    // New system:
    //
    // currentlyStudying === true
    //       OR
    // no passedYear
    //
    // means currently studying.
    //
    // Old "Active" records are also handled here
    // as currently studying, but the user MUST select
    // the actual study before updating.
    // -------------------------------------------------------

    const currentlyStudying =
      education?.currentlyStudying === true ||
      !education?.passedYear ||
      education?.study === "Active";

    // -------------------------------------------------------
    // OLD ACTIVE DATA
    // -------------------------------------------------------
    //
    // If old database record contains:
    //
    // study: "Active"
    //
    // there is no way for frontend to know whether it
    // was IT / AIML / CSE etc.
    //
    // Therefore we leave study empty so user selects
    // the real study while updating.
    // -------------------------------------------------------

    const actualStudy =
      education?.study === "Active"
        ? ""
        : education?.study || "";

    // -------------------------------------------------------
    // POPULATE FORM
    // -------------------------------------------------------

    setFormData({
      instituteName:
        education?.instituteName || "",

      study: actualStudy,

      gradeTitle:
        education?.grade?.title?.toLowerCase() ||
        "percentage",

      gradeValue:
        education?.grade?.value ?? "",

      passedYear: currentlyStudying
        ? ""
        : passedYear,

      address:
        education?.address || "",

      instituteLogo: null,

      currentlyStudying,
    });

    // -------------------------------------------------------
    // SELECT EDUCATION
    // -------------------------------------------------------

    setSelectedEducation(education);

    setShowAddForm(false);

    setShowUpdateForm(true);

    setError("");
  };

  // =========================================================
  // CLOSE UPDATE FORM
  // =========================================================

  const handleCloseUpdateForm = () => {
    if (loading) return;

    setShowUpdateForm(false);

    setSelectedEducation(null);

    resetForm();

    setError("");
  };

  // =========================================================
  // HANDLE UPDATE EDUCATION
  // =========================================================

  const handleUpdateEducation = async (e) => {
    e.preventDefault();

    if (!selectedEducation?._id) {
      setError(
        "Education ID not found."
      );

      return;
    }

    try {
      setLoading(true);

      setError("");

      // -------------------------------------------------------
      // VALIDATION
      // -------------------------------------------------------

      if (!formData.instituteName.trim()) {
        throw new Error(
          "Institute name is required."
        );
      }

      if (!formData.study) {
        throw new Error(
          "Please select study."
        );
      }

      if (
        formData.gradeValue === "" ||
        formData.gradeValue === null
      ) {
        throw new Error(
          "Grade value is required."
        );
      }

      if (!formData.address.trim()) {
        throw new Error(
          "Address is required."
        );
      }

      if (!formData.currentlyStudying) {
        const year = Number(formData.passedYear);
        const currentYear = new Date().getFullYear();

        if (!formData.passedYear) {
          throw new Error("Passed year is required.");
        }

        if (
          !Number.isInteger(year) ||
          year < 1900 ||
          year > currentYear
        ) {
          throw new Error(
            `Please enter a valid year between 1900 and ${currentYear}.`
          );
        }
      }

      // -------------------------------------------------------
      // FORM DATA
      // -------------------------------------------------------

      const data = new FormData();

      data.append(
        "instituteName",
        formData.instituteName.trim()
      );

      // Actual study.
      // Example:
      // IT
      // AIML
      // CSE
      data.append(
        "study",
        formData.study
      );

      data.append(
        "grade",
        JSON.stringify({
          title: formData.gradeTitle,
          value: Number(formData.gradeValue),
        })
      );

      // -------------------------------------------------------
      // CURRENTLY STUDYING
      // -------------------------------------------------------

      data.append(
        "currentlyStudying",
        String(formData.currentlyStudying)
      );

      // -------------------------------------------------------
      // PASSED YEAR
      // -------------------------------------------------------

      if (
        !formData.currentlyStudying &&
        formData.passedYear
      ) {
        data.append(
          "passedYear",
          formData.passedYear
        );
      }

      // -------------------------------------------------------
      // ADDRESS
      // -------------------------------------------------------

      data.append(
        "address",
        formData.address.trim()
      );

      // -------------------------------------------------------
      // NEW LOGO
      // -------------------------------------------------------

      if (formData.instituteLogo) {
        data.append(
          "educationLogo",
          formData.instituteLogo
        );
      }

      // -------------------------------------------------------
      // API REQUEST
      // -------------------------------------------------------
      //
      // IMPORTANT:
      // Use Axios api.put().
      //
      // Do NOT use:
      // fetch(url, data, {...})
      //
      // Do NOT use:
      // response.data with fetch().
      // -------------------------------------------------------

      const response = await api.put(
        `/api/admin/education/${selectedEducation._id}/update`,
        data,
        {
          withCredentials: true,
        }
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
          "Failed to update education."
        );
      }

      // -------------------------------------------------------
      // UPDATE TABLE WITHOUT REFRESH
      // -------------------------------------------------------

      if (result?.education) {
        setEducations((prev) =>
          prev.map((education) =>
            education._id ===
              result.education._id
              ? result.education
              : education
          )
        );
      } else {
        await fetchEducations();
      }

      // -------------------------------------------------------
      // CLOSE FORM
      // -------------------------------------------------------

      setShowUpdateForm(false);

      setSelectedEducation(null);

      resetForm();
    } catch (error) {
      console.error(
        "Update education error:",
        error
      );

      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update education."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HANDLE DELETE EDUCATION
  // =========================================================

  const handleDeleteEducation = async (
    education
  ) => {
    if (!education?._id) {
      setError(
        "Education ID not found."
      );

      return;
    }

    // -------------------------------------------------------
    // CONFIRM DELETE
    // -------------------------------------------------------

    const confirmed = window.confirm(
      `Are you sure you want to delete "${education.instituteName}" education record?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      setError("");

      // -------------------------------------------------------
      // API REQUEST
      // -------------------------------------------------------

      const response = await fetch(
        `/api/admin/education/${education._id}/delete`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to delete education."
        );
      }

      // -------------------------------------------------------
      // REMOVE FROM UI
      // -------------------------------------------------------

      setEducations((prev) =>
        prev.filter(
          (item) =>
            item._id !== education._id
        )
      );

      // -------------------------------------------------------
      // CLOSE UPDATE FORM IF SAME ITEM
      // -------------------------------------------------------

      if (
        selectedEducation?._id ===
        education._id
      ) {
        setShowUpdateForm(false);

        setSelectedEducation(null);

        resetForm();
      }
    } catch (error) {
      console.error(
        "Delete education error:",
        error
      );

      setError(
        error?.message ||
        "Failed to delete education."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORMAT PASSED YEAR
  // =========================================================

  const formatPassedYear = (
    education
  ) => {
    // Currently studying
    if (
      education?.currentlyStudying === true ||
      !education?.passedYear
    ) {
      return "Present";
    }

    const date = new Date(
      education.passedYear
    );

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.getFullYear();
  };

  // =========================================================
  // FORMAT GRADE TITLE
  // =========================================================

  const formatGradeTitle = (title) => {
    if (!title) return "—";

    return title.toUpperCase();
  };

  // =========================================================
  // LIST
  // =========================================================

  const list = educations;

  const hasEducation =
    list.length > 0;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="relative w-full h-screen flex flex-col bg-[#dadada] text-black">

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <div
        className="
          w-full
          h-[8%]
          min-h-[56px]
          border-b
          border-black/50
          bg-[#dadada]
          flex
          items-center
          justify-between
          px-8
        "
      >
        {/* TITLE */}

        <div className="flex items-center gap-3">

          <div
            className="
              w-9
              h-9
              rounded-lg
              bg-black
              text-white
              flex
              items-center
              justify-center
            "
          >
            <BookOpen size={18} />
          </div>

          <div>
            <h1
              className="
                text-base
                font-semibold
                leading-none
              "
            >
              Education
            </h1>

            <p
              className="
                text-[11px]
                text-black/40
                mt-1
              "
            >
              {list.length}{" "}
              record
              {list.length !== 1
                ? "s"
                : ""}
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-2">

          {/* REFRESH */}

          <button
            type="button"
            onClick={fetchEducations}
            disabled={
              fetchLoading ||
              loading
            }
            title="Refresh"
            className="
              w-9
              h-9
              rounded-lg
              border
              border-black/20
              bg-[#dadada]
              flex
              items-center
              justify-center
              hover:bg-black
              hover:text-white
              transition-all
              disabled:opacity-40
            "
          >
            <RefreshCw
              size={15}
              className={
                fetchLoading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

          {/* ADD */}

          <button
            type="button"
            onClick={
              handleOpenAddForm
            }
            disabled={loading}
            className="
              h-9
              px-4
              rounded-lg
              bg-black
              text-white
              text-sm
              font-medium
              flex
              items-center
              gap-2
              hover:bg-zinc-800
              transition-colors
              disabled:opacity-40
            "
          >
            <Plus size={16} />
            Add Education
          </button>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          flex-1
          overflow-auto
          p-8
        "
      >

        {/* ERROR */}

        {error && (
          <div
            className="
              mb-5
              flex
              items-center
              justify-between
              gap-4
              px-4
              py-3
              rounded-xl
              border
              border-red-500/20
              bg-red-500/5
              text-red-600
              text-sm
            "
          >
            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="
                text-red-500
                hover:text-red-700
              "
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* FETCH LOADING */}

        {fetchLoading ? (
          <div
            className="
              h-full
              min-h-[280px]
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                flex
                flex-col
                items-center
                gap-3
                text-black/40
              "
            >
              <Loader2
                size={25}
                className="animate-spin"
              />

              <p className="text-sm">
                Loading education...
              </p>
            </div>
          </div>
        ) : !hasEducation ? (

          /* EMPTY STATE */

          <div
            className="
              h-full
              min-h-[280px]
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                flex
                flex-col
                items-center
                gap-3
                text-center
              "
            >
              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  border
                  border-dashed
                  border-black/20
                  flex
                  items-center
                  justify-center
                  text-black/30
                "
              >
                <PencilSparkles
                  size={22}
                />
              </div>

              <p
                className="
                  text-sm
                  font-medium
                  text-black/50
                "
              >
                No education found
              </p>

              <p
                className="
                  text-xs
                  text-black/35
                "
              >
                Add your first education
                record to get started
              </p>

              <button
                type="button"
                onClick={
                  handleOpenAddForm
                }
                className="
                  mt-1
                  h-9
                  px-4
                  rounded-lg
                  bg-black
                  text-white
                  text-xs
                  font-medium
                  flex
                  items-center
                  gap-2
                  hover:bg-zinc-800
                "
              >
                <Plus size={14} />
                Add Education
              </button>
            </div>
          </div>

        ) : (

          /* TABLE */

          <div
            className="
              bg-[#dadada]
              overflow-hidden
              shadow-[0_1px_2px_rgba(0,0,0,0.04)]
            "
          >
            <div className="overflow-x-auto">

              <table
                className="
                  w-full
                  min-w-[980px]
                  text-left
                  border-collapse
                "
              >

                {/* TABLE HEADER */}

                <thead>
                  <tr
                    className="
                      border-b-2
                      border-black
                      bg-[#dadada]
                    "
                  >
                    <th
                      className="
                        px-5
                        py-3.5
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        text-black/50
                      "
                    >
                      Institute
                    </th>

                    <th
                      className="
                        px-5
                        py-3.5
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        text-black/50
                      "
                    >
                      Study
                    </th>

                    <th
                      className="
                        px-5
                        py-3.5
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        text-black/50
                      "
                    >
                      Grade
                    </th>

                    <th
                      className="
                        px-5
                        py-3.5
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        text-black/50
                      "
                    >
                      Year
                    </th>

                    <th
                      className="
                        px-5
                        py-3.5
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        text-black/50
                      "
                    >
                      Address
                    </th>

                    <th
                      className="
                        px-5
                        py-3.5
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        text-black/50
                        text-right
                      "
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}

                <tbody>
                  {list.map(
                    (
                      education,
                      idx
                    ) => {

                      const hasLogo =
                        Boolean(
                          education
                            ?.instituteLogo
                            ?.url
                        );

                      const isCurrentlyStudying =
                        education?.currentlyStudying ===
                        true ||
                        !education?.passedYear;

                      return (
                        <tr
                          key={
                            education._id ||
                            idx
                          }
                          className="
                            border-b
                            border-black/15
                            last:border-b-0
                            hover:bg-black/[0.02]
                            transition-colors
                          "
                        >

                          {/* INSTITUTE */}

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                gap-3
                                min-w-[220px]
                              "
                            >
                              {hasLogo ? (
                                <div
                                  className="
                                    w-10
                                    h-10
                                    rounded-lg
                                    border
                                    border-black/60
                                    bg-[#dadada]
                                    overflow-hidden
                                    shrink-0
                                  "
                                >
                                  <img
                                    src={
                                      education
                                        .instituteLogo
                                        .url
                                    }
                                    alt={
                                      education
                                        .instituteName
                                    }
                                    className="
                                      w-full
                                      h-full
                                      object-contain
                                      p-1
                                    "
                                  />
                                </div>
                              ) : (
                                <div
                                  className="
                                    w-10
                                    h-10
                                    rounded-lg
                                    border
                                    border-black/60
                                    bg-[#dadada]
                                    flex
                                    items-center
                                    justify-center
                                    text-[11px]
                                    font-semibold
                                    text-black/40
                                    shrink-0
                                  "
                                >
                                  {(
                                    education
                                      ?.instituteName ||
                                    "?"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <p
                                  className="
                                    text-sm
                                    font-medium
                                    text-black
                                    truncate
                                  "
                                >
                                  {
                                    education?.instituteName
                                  }
                                </p>

                                <p
                                  className="
                                    text-[11px]
                                    text-black/35
                                    mt-0.5
                                  "
                                >
                                  Record{" "}
                                  {String(
                                    idx + 1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* STUDY */}

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <span
                              className="
                                inline-flex
                                items-center
                                h-6
                                px-2.5
                                rounded-full
                                text-[11px]
                                font-medium
                                border
                                bg-[#dadada]
                                text-black/70
                                border-black/20
                              "
                            >
                              {education?.study ||
                                "—"}
                            </span>

                            {isCurrentlyStudying && (
                              <span
                                className="
                                  ml-2
                                  inline-flex
                                  items-center
                                  h-6
                                  px-2.5
                                  rounded-full
                                  text-[10px]
                                  font-medium
                                  border
                                  border-black
                                  bg-black
                                  text-white
                                "
                              >
                                Current
                              </span>
                            )}
                          </td>

                          {/* GRADE */}

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <div
                              className="
                                flex
                                flex-col
                              "
                            >
                              <span
                                className="
                                  text-sm
                                  font-semibold
                                  tabular-nums
                                  text-black
                                "
                              >
                                {
                                  education
                                    ?.grade
                                    ?.value
                                }

                                {education
                                  ?.grade
                                  ?.title
                                  ?.toLowerCase() ===
                                  "percentage" &&
                                  "%"}
                              </span>

                              <span
                                className="
                                  text-[11px]
                                  text-black/40
                                  uppercase
                                  tracking-wide
                                  mt-0.5
                                "
                              >
                                {formatGradeTitle(
                                  education
                                    ?.grade
                                    ?.title
                                )}
                              </span>
                            </div>
                          </td>

                          {/* YEAR */}

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <span
                              className="
                                text-sm
                                text-black/70
                                tabular-nums
                              "
                            >
                              {formatPassedYear(
                                education
                              )}
                            </span>
                          </td>

                          {/* ADDRESS */}

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <span
                              className="
                                text-sm
                                text-black/55
                                line-clamp-2
                                max-w-[220px]
                              "
                            >
                              {education?.address ||
                                "—"}
                            </span>
                          </td>

                          {/* ACTIONS */}

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                justify-end
                                gap-2
                              "
                            >
                              {/* EDIT */}

                              <button
                                type="button"
                                title="Edit"
                                disabled={
                                  loading
                                }
                                onClick={() =>
                                  handleEditEducation(
                                    education
                                  )
                                }
                                className="
                                  w-8
                                  h-8
                                  rounded-lg
                                  border
                                  border-black/60
                                  bg-[#dadada]
                                  text-black/70
                                  flex
                                  items-center
                                  justify-center
                                  hover:bg-green-400
                                  hover:text-white
                                  hover:border-transparent
                                  disabled:opacity-40
                                  transition-all
                                "
                              >
                                <Pencil
                                  size={14}
                                />
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                title="Delete"
                                disabled={
                                  loading
                                }
                                onClick={() =>
                                  handleDeleteEducation(
                                    education
                                  )
                                }
                                className="
                                  w-8
                                  h-8
                                  rounded-lg
                                  border
                                  border-black/60
                                  bg-[#dadada]
                                  text-black/70
                                  flex
                                  items-center
                                  justify-center
                                  hover:bg-[#E7000B]
                                  hover:text-white
                                  hover:border-transparent
                                  disabled:opacity-40
                                  transition-all
                                "
                              >
                                <Trash2
                                  size={14}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          ADD EDUCATION MODAL
      ====================================================== */}

      {showAddForm && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/40
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-5
          "
          onClick={
            handleCloseAddForm
          }
        >
          <form
            onSubmit={
              handleAddEducation
            }
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              w-full
              max-w-2xl
              max-h-[90vh]
              overflow-y-auto
              bg-white
              rounded-2xl
              shadow-2xl
              border
              border-black/10
              p-6
            "
          >

            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                mb-6
              "
            >
              <div>
                <h2
                  className="
                    text-lg
                    font-bold
                  "
                >
                  Add Education
                </h2>

                <p
                  className="
                    text-xs
                    text-black/40
                    mt-1
                  "
                >
                  Add a new education
                  record.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseAddForm
                }
                className="
                  w-8
                  h-8
                  rounded-lg
                  border
                  border-black/10
                  flex
                  items-center
                  justify-center
                  hover:bg-black
                  hover:text-white
                  transition
                "
              >
                <X size={16} />
              </button>
            </div>

            {/* INSTITUTE NAME */}

            <div className="mb-4">
              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mb-2
                "
              >
                Institute Name
              </label>

              <input
                type="text"
                name="instituteName"
                value={
                  formData.instituteName
                }
                onChange={
                  handleInputChange
                }
                placeholder="L.J. University"
                required
                className="
                  w-full
                  h-11
                  px-3
                  rounded-lg
                  border
                  border-black/15
                  outline-none
                  focus:border-black
                  text-sm
                "
              />
            </div>

            {/* STUDY + GRADE TYPE */}

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
                mb-4
              "
            >

              {/* STUDY */}

              <div>
                <label
                  className="
                    block
                    text-xs
                    font-semibold
                    mb-2
                  "
                >
                  Study
                </label>

                <select
                  name="study"
                  value={
                    formData.study
                  }
                  onChange={
                    handleInputChange
                  }
                  required
                  className="
                    w-full
                    h-11
                    px-3
                    rounded-lg
                    border
                    border-black/15
                    outline-none
                    focus:border-black
                    text-sm
                    bg-white
                  "
                >
                  <option value="">
                    Select Study
                  </option>

                  {STUDY_OPTIONS.map(
                    (study) => (
                      <option
                        key={study}
                        value={study}
                      >
                        {study}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* GRADE TYPE */}

              <div>
                <label
                  className="
                    block
                    text-xs
                    font-semibold
                    mb-2
                  "
                >
                  Grade Type
                </label>

                <select
                  name="gradeTitle"
                  value={
                    formData.gradeTitle
                  }
                  onChange={
                    handleInputChange
                  }
                  required
                  className="
                    w-full
                    h-11
                    px-3
                    rounded-lg
                    border
                    border-black/15
                    outline-none
                    focus:border-black
                    text-sm
                    bg-white
                  "
                >
                  {GRADE_OPTIONS.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* GRADE VALUE */}

            <div className="mb-4">
              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mb-2
                "
              >
                Grade Value
              </label>

              <input
                type="number"
                name="gradeValue"
                step="0.01"
                min="0"
                value={
                  formData.gradeValue
                }
                onChange={
                  handleInputChange
                }
                placeholder="88.66"
                required
                className="
                  w-full
                  h-11
                  px-3
                  rounded-lg
                  border
                  border-black/15
                  outline-none
                  focus:border-black
                  text-sm
                "
              />
            </div>

            {/* CURRENTLY STUDYING CHECKBOX */}

            <div
              className="
                mb-4
                p-4
                rounded-xl
                border
                border-black/10
                bg-black/[0.02]
              "
            >
              <label
                className="
                  flex
                  items-center
                  gap-3
                  cursor-pointer
                "
              >
                <input
                  type="checkbox"
                  checked={
                    formData.currentlyStudying
                  }
                  onChange={
                    handleCurrentlyStudyingChange
                  }
                  className="
                    w-4
                    h-4
                    accent-black
                    cursor-pointer
                  "
                />

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Currently Studying
                </span>
              </label>

              <p
                className="
                  text-[11px]
                  text-black/40
                  mt-1
                  ml-7
                "
              >
                Check this if you are
                currently studying this
                course/program.
              </p>
            </div>

            {/* PASSED YEAR */}

            {!formData.currentlyStudying && (
              <div className="mb-4">
                <label
                  className="
                    block
                    text-xs
                    font-semibold
                    mb-2
                  "
                >
                  Passed Year
                </label>

                <input
                  type="number"
                  name="passedYear"
                  value={formData.passedYear}
                  onChange={handleInputChange}
                  placeholder="2025"
                  min="1900"
                  max={new Date().getFullYear()}
                  required={!formData.currentlyStudying}
                  className="
    w-full
    h-11
    px-3
    rounded-lg
    border
    border-black/15
    outline-none
    focus:border-black
    text-sm
  "
                />
              </div>
            )}

            {/* ADDRESS */}

            <div className="mb-4">
              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mb-2
                "
              >
                Address
              </label>

              <textarea
                name="address"
                value={
                  formData.address
                }
                onChange={
                  handleInputChange
                }
                placeholder="Ahmedabad, Gujarat"
                required
                rows={3}
                className="
                  w-full
                  px-3
                  py-3
                  rounded-lg
                  border
                  border-black/15
                  outline-none
                  focus:border-black
                  text-sm
                  resize-none
                "
              />
            </div>

            {/* LOGO */}

            <div className="mb-6">
              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mb-2
                "
              >
                Institute Logo
              </label>

              <label
                className="
                  w-full
                  min-h-[90px]
                  rounded-xl
                  border
                  border-dashed
                  border-black/20
                  bg-black/[0.02]
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-2
                  cursor-pointer
                  hover:bg-black/[0.04]
                  transition
                "
              >
                <Upload
                  size={20}
                  className="text-black/40"
                />

                <span
                  className="
                    text-xs
                    text-black/50
                  "
                >
                  {formData.instituteLogo
                    ? formData
                      .instituteLogo
                      .name
                    : "Click to upload logo"}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleLogoChange
                  }
                  className="hidden"
                />
              </label>
            </div>

            {/* BUTTONS */}

            <div
              className="
                flex
                justify-end
                gap-3
              "
            >
              <button
                type="button"
                onClick={
                  handleCloseAddForm
                }
                disabled={loading}
                className="
                  h-10
                  px-5
                  rounded-lg
                  border
                  border-black/15
                  text-sm
                  font-medium
                  hover:bg-black/5
                  disabled:opacity-40
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  h-10
                  px-5
                  rounded-lg
                  bg-black
                  text-white
                  text-sm
                  font-medium
                  flex
                  items-center
                  gap-2
                  disabled:opacity-50
                "
              >
                {loading ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
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

      {showUpdateForm &&
        selectedEducation && (
          <div
            className="
              fixed
              inset-0
              z-50
              bg-black/40
              backdrop-blur-sm
              flex
              items-center
              justify-center
              p-5
            "
            onClick={
              handleCloseUpdateForm
            }
          >
            <form
              onSubmit={
                handleUpdateEducation
              }
              onClick={(e) =>
                e.stopPropagation()
              }
              className="
                w-full
                max-w-2xl
                max-h-[90vh]
                overflow-y-auto
                bg-white
                rounded-2xl
                shadow-2xl
                border
                border-black/10
                p-6
              "
            >

              {/* HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-6
                "
              >
                <div>
                  <h2
                    className="
                      text-lg
                      font-bold
                    "
                  >
                    Update Education
                  </h2>

                  <p
                    className="
                      text-xs
                      text-black/40
                      mt-1
                    "
                  >
                    Update{" "}
                    <span className="font-medium">
                      {
                        selectedEducation?.instituteName
                      }
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseUpdateForm
                  }
                  className="
                    w-8
                    h-8
                    rounded-lg
                    border
                    border-black/10
                    flex
                    items-center
                    justify-center
                    hover:bg-black
                    hover:text-white
                    transition
                  "
                >
                  <X size={16} />
                </button>
              </div>

              {/* CURRENT LOGO */}

              {selectedEducation
                ?.instituteLogo
                ?.url && (
                  <div
                    className="
                    mb-5
                    p-3
                    rounded-xl
                    border
                    border-black/10
                    bg-black/[0.02]
                    flex
                    items-center
                    gap-3
                  "
                  >
                    <div
                      className="
                      w-12
                      h-12
                      rounded-lg
                      border
                      border-black/10
                      bg-white
                      overflow-hidden
                      flex
                      items-center
                      justify-center
                    "
                    >
                      <img
                        src={
                          selectedEducation
                            .instituteLogo
                            .url
                        }
                        alt={
                          selectedEducation
                            .instituteName
                        }
                        className="
                        w-full
                        h-full
                        object-contain
                        p-1
                      "
                      />
                    </div>

                    <div>
                      <p
                        className="
                        text-xs
                        font-semibold
                      "
                      >
                        Current Logo
                      </p>

                      <p
                        className="
                        text-[11px]
                        text-black/40
                      "
                      >
                        Upload a new file
                        below to replace it.
                      </p>
                    </div>
                  </div>
                )}

              {/* INSTITUTE NAME */}

              <div className="mb-4">
                <label
                  className="
                    block
                    text-xs
                    font-semibold
                    mb-2
                  "
                >
                  Institute Name
                </label>

                <input
                  type="text"
                  name="instituteName"
                  value={
                    formData.instituteName
                  }
                  onChange={
                    handleInputChange
                  }
                  required
                  className="
                    w-full
                    h-11
                    px-3
                    rounded-lg
                    border
                    border-black/15
                    outline-none
                    focus:border-black
                    text-sm
                  "
                />
              </div>

              {/* STUDY + GRADE TYPE */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-4
                  mb-4
                "
              >

                {/* STUDY */}

                <div>
                  <label
                    className="
                      block
                      text-xs
                      font-semibold
                      mb-2
                    "
                  >
                    Study
                  </label>

                  <select
                    name="study"
                    value={
                      formData.study
                    }
                    onChange={
                      handleInputChange
                    }
                    required
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-lg
                      border
                      border-black/15
                      outline-none
                      focus:border-black
                      text-sm
                      bg-white
                    "
                  >
                    <option value="">
                      Select Study
                    </option>

                    {STUDY_OPTIONS.map(
                      (study) => (
                        <option
                          key={study}
                          value={study}
                        >
                          {study}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* GRADE TYPE */}

                <div>
                  <label
                    className="
                      block
                      text-xs
                      font-semibold
                      mb-2
                    "
                  >
                    Grade Type
                  </label>

                  <select
                    name="gradeTitle"
                    value={
                      formData.gradeTitle
                    }
                    onChange={
                      handleInputChange
                    }
                    required
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-lg
                      border
                      border-black/15
                      outline-none
                      focus:border-black
                      text-sm
                      bg-white
                    "
                  >
                    {GRADE_OPTIONS.map(
                      (option) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* GRADE VALUE */}

              <div className="mb-4">
                <label
                  className="
                    block
                    text-xs
                    font-semibold
                    mb-2
                  "
                >
                  Grade Value
                </label>

                <input
                  type="number"
                  name="gradeValue"
                  step="0.01"
                  min="0"
                  value={
                    formData.gradeValue
                  }
                  onChange={
                    handleInputChange
                  }
                  required
                  className="
                    w-full
                    h-11
                    px-3
                    rounded-lg
                    border
                    border-black/15
                    outline-none
                    focus:border-black
                    text-sm
                  "
                />
              </div>

              {/* CURRENTLY STUDYING CHECKBOX */}

              <div
                className="
                  mb-4
                  p-4
                  rounded-xl
                  border
                  border-black/10
                  bg-black/[0.02]
                "
              >
                <label
                  className="
                    flex
                    items-center
                    gap-3
                    cursor-pointer
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      formData.currentlyStudying
                    }
                    onChange={
                      handleCurrentlyStudyingChange
                    }
                    className="
                      w-4
                      h-4
                      accent-black
                      cursor-pointer
                    "
                  />

                  <span
                    className="
                      text-sm
                      font-medium
                    "
                  >
                    Currently Studying
                  </span>
                </label>

                <p
                  className="
                    text-[11px]
                    text-black/40
                    mt-1
                    ml-7
                  "
                >
                  Check this if you are
                  currently studying this
                  course/program.
                </p>
              </div>

              {/* PASSED YEAR */}

              {!formData.currentlyStudying && (
                <div className="mb-4">
                  <label
                    className="
                      block
                      text-xs
                      font-semibold
                      mb-2
                    "
                  >
                    Passed Year
                  </label>

                  <input
                    type="number"
                    name="passedYear"
                    value={formData.passedYear}
                    onChange={handleInputChange}
                    placeholder="2025"
                    min="1900"
                    max={new Date().getFullYear()}
                    required={!formData.currentlyStudying}
                    className="
    w-full
    h-11
    px-3
    rounded-lg
    border
    border-black/15
    outline-none
    focus:border-black
    text-sm
  "
                  />
                </div>
              )}

              {/* ADDRESS */}

              <div className="mb-4">
                <label
                  className="
                    block
                    text-xs
                    font-semibold
                    mb-2
                  "
                >
                  Address
                </label>

                <textarea
                  name="address"
                  value={
                    formData.address
                  }
                  onChange={
                    handleInputChange
                  }
                  required
                  rows={3}
                  className="
                    w-full
                    px-3
                    py-3
                    rounded-lg
                    border
                    border-black/15
                    outline-none
                    focus:border-black
                    text-sm
                    resize-none
                  "
                />
              </div>

              {/* NEW LOGO */}

              <div className="mb-6">
                <label
                  className="
                    block
                    text-xs
                    font-semibold
                    mb-2
                  "
                >
                  Replace Institute Logo
                </label>

                <label
                  className="
                    w-full
                    min-h-[90px]
                    rounded-xl
                    border
                    border-dashed
                    border-black/20
                    bg-black/[0.02]
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-2
                    cursor-pointer
                    hover:bg-black/[0.04]
                    transition
                  "
                >
                  <Upload
                    size={20}
                    className="text-black/40"
                  />

                  <span
                    className="
                      text-xs
                      text-black/50
                    "
                  >
                    {formData.instituteLogo
                      ? formData
                        .instituteLogo
                        .name
                      : "Click to replace logo"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleLogoChange
                    }
                    className="hidden"
                  />
                </label>

                <p
                  className="
                    text-[10px]
                    text-black/35
                    mt-2
                  "
                >
                  Leave empty to keep
                  the current logo.
                </p>
              </div>

              {/* BUTTONS */}

              <div
                className="
                  flex
                  justify-end
                  gap-3
                "
              >
                <button
                  type="button"
                  onClick={
                    handleCloseUpdateForm
                  }
                  disabled={loading}
                  className="
                    h-10
                    px-5
                    rounded-lg
                    border
                    border-black/15
                    text-sm
                    font-medium
                    hover:bg-black/5
                    disabled:opacity-40
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    h-10
                    px-5
                    rounded-lg
                    bg-black
                    text-white
                    text-sm
                    font-medium
                    flex
                    items-center
                    gap-2
                    disabled:opacity-50
                  "
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
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