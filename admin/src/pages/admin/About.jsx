import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Trash2,
  Plus,
  Save,
  Loader2,
  RefreshCw,
  ExternalLink,
  Heart,
  Globe,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Code2,
  CheckCircle2,
  X,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { UseAdmin } from "../../context/AdminContext";
import api from "../../api/axios";

const About = () => {
  const { admin, setAdmin } = UseAdmin();

  // =========================================================
  // STATE MANAGEMENT
  // =========================================================
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Local Profile Image URL for immediate updates
  const [profileUrl, setProfileUrl] = useState("");

  // Form Fields
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    email: "",
    aboutDesc: "",
    address: "",
    mobileNo: "",
    shortDescription: ""
  });

  // Hobbies & Socials Sub-states
  const [hobbies, setHobbies] = useState([]);
  const [socialProfiles, setSocialProfiles] = useState([]);

  // New item inputs
  const [newHobby, setNewHobby] = useState("");

  // Dual-mode Social Profile inputs
  const [socialMode, setSocialMode] = useState("file"); // "file" | "url"
  const [socialFile, setSocialFile] = useState(null);
  const [newSocial, setNewSocial] = useState({
    name: "",
    link: "",
    platformImageUrl: "",
  });
  const [socialSubmitting, setSocialSubmitting] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);

  // Reference Counts
  const [counts, setCounts] = useState({
    skills: 0,
    projects: 0,
    experience: 0,
    education: 0,
  });

  // =========================================================
  // SYNC WITH ADMIN CONTEXT / DB
  // =========================================================
  const populateData = (adminData) => {
    if (!adminData) return;

    setBasicInfo({
      name: adminData.name || "",
      email: adminData.email || "",
      aboutDesc: adminData.about?.aboutDesc || "",
      address: adminData.about?.address || "",
      mobileNo: adminData.about?.mobileNo || "",
      shortDescription: adminData.about?.shortDescription || ""
    });

    setProfileUrl(adminData.about?.profile?.url || "");
    setHobbies(adminData.about?.hobbies || []);
    setSocialProfiles(adminData.about?.socialProfiles || []);

    setCounts({
      skills: adminData.about?.skills?.length || 0,
      projects: adminData.about?.projects?.length || 0,
      experience: adminData.about?.experience?.length || 0,
      education: adminData.about?.education?.length || 0,
    });
  };

  const fetchAdminDetails = async () => {
    try {
      setFetchLoading(true);
      const { data } = await api.get("/api/admin/me", {
        withCredentials: true,
      });

      if (data?.success && data?.admin) {
        if (setAdmin) setAdmin(data.admin);
        populateData(data.admin);
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      if (admin) populateData(admin);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDetails();
  }, []);

  // =========================================================
  // PROFILE IMAGE HANDLERS
  // =========================================================
  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile", file);

    try {
      setUploadingImage(true);
      const hasImage = Boolean(profileUrl);

      const endpoint = hasImage
        ? "/api/admin/profile/update"
        : "/api/admin/profile/upload";

      const method = hasImage ? api.put : api.post;

      const { data } = await method(endpoint, formData, {
        withCredentials: true,
      });

      if (data?.success) {
        toast.success("Profile image updated successfully!");
        if (data.profile?.url) {
          setProfileUrl(data.profile.url);
        }
        if (data.admin && setAdmin) {
          setAdmin(data.admin);
        }
      } else {
        toast.error(data?.message || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error uploading image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!window.confirm("Remove your current profile photo?")) return;

    try {
      setUploadingImage(true);
      const { data } = await api.delete("/api/admin/profile/delete", {
        withCredentials: true,
      });

      if (data?.success) {
        toast.success("Profile image removed");
        setProfileUrl("");
        if (data.admin && setAdmin) {
          setAdmin(data.admin);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to remove image");
    } finally {
      setUploadingImage(false);
    }
  };

  // =========================================================
  // BASIC DETAILS SAVE
  // =========================================================
  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();

    if (basicInfo.mobileNo && !/^\d{10}$/.test(basicInfo.mobileNo)) {
      toast.error("Mobile number must be exactly 10 digits.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.put(
        "/api/admin/profile/about-info",
        {
          name: basicInfo.name,
          aboutDesc: basicInfo.aboutDesc,
          address: basicInfo.address,
          mobileNo: basicInfo.mobileNo,
          shortDesc: basicInfo.shortDescription
        },
        { withCredentials: true }
      );

      if (data?.success) {
        toast.success("Profile details saved successfully!");
        if (data?.admin && setAdmin) setAdmin(data.admin);
      } else {
        toast.error(data?.message || "Failed to save profile details");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error updating details");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HOBBIES HANDLERS
  // =========================================================
  const handleAddHobby = async (e) => {
    e.preventDefault();
    if (!newHobby.trim()) return;

    try {
      const { data } = await api.post(
        "/api/admin/hobbies/add",
        { name: newHobby.trim() },
        { withCredentials: true }
      );

      if (data?.success) {
        toast.success("Hobby added!");
        setNewHobby("");
        fetchAdminDetails();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add hobby");
    }
  };

  const handleDeleteHobby = async (hobbyId) => {
    try {
      const { data } = await api.delete(`/api/admin/hobbies/${hobbyId}/delete`, {
        withCredentials: true,
      });

      if (data?.success) {
        toast.success("Hobby removed");
        setHobbies((prev) => prev.filter((h) => (h._id || h) !== hobbyId));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete hobby");
    }
  };

  // =========================================================
  // SOCIAL PROFILE HANDLERS (FILE OR URL SUPPORT)
  // =========================================================
  const handleAddSocial = async (e) => {
    e.preventDefault();

    if (!newSocial.name.trim()) {
      toast.error("Platform name is required");
      return;
    }

    if (!newSocial.link.startsWith("https://")) {
      toast.error("Profile URL must start with https://");
      return;
    }

    try {
      setSocialSubmitting(true);
      const formData = new FormData();
      formData.append("name", newSocial.name.trim());
      formData.append("link", newSocial.link.trim());

      if (socialMode === "file" && socialFile) {
        formData.append("icon", socialFile);
      } else if (socialMode === "url" && newSocial.platformImageUrl.trim()) {
        formData.append("platformImageUrl", newSocial.platformImageUrl.trim());
      }

      const { data } = await api.post("/api/admin/socials/add", formData, {
        withCredentials: true,
      });

      if (data?.success) {
        toast.success("Social profile added!");
        setNewSocial({ name: "", link: "", platformImageUrl: "" });
        setSocialFile(null);
        setShowSocialModal(false);
        fetchAdminDetails();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add social link");
    } finally {
      setSocialSubmitting(false);
    }
  };

  const handleDeleteSocial = async (socialId) => {
    try {
      const { data } = await api.delete(`/api/admin/socials/${socialId}/delete`, {
        withCredentials: true,
      });

      if (data?.success) {
        toast.success("Social link removed");
        setSocialProfiles((prev) =>
          prev.filter((s) => (s._id || s) !== socialId)
        );
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove social link");
    }
  };

  if (fetchLoading) {
    return (
      <div className="w-full min-h-screen bg-[#dadada] flex flex-col items-center justify-center p-6 text-black">
        <Loader2 size={32} className="animate-spin text-black/50" />
        <p className="text-sm font-medium text-black/60 mt-3">
          Loading profile overview...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex flex-col bg-[#dadada] text-black antialiased overflow-hidden">
      {/* =====================================================
          TOP BAR (Locked to h-16 to perfectly match Sidebar & Other Modules)
      ====================================================== */}
      <div className="TopBar w-full h-16 border-b border-[#0000009b] bg-[#dadada] flex items-center justify-between px-6 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
            <User size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">About Profile</h1>
            <p className="text-[11px] text-black/40 mt-1">
              Personal branding, contact credentials & portfolio summaries
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAdminDetails}
          title="Refresh profile"
          className="w-9 h-9 rounded-lg border border-black/20 bg-[#dadada] flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* =====================================================
          MAIN BODY
      ====================================================== */}
      <div className="w-full flex-1 overflow-y-auto p-4 sm:p-6 2xl:p-8 space-y-6 max-w-6xl mx-auto">
        {/* TOP OVERVIEW CARD */}
        <div className="w-full bg-[#dadada] border border-black/25 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* PROFILE PHOTO WITH UPLOAD CONTROLS */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-black/40 bg-white overflow-hidden shadow-xs flex items-center justify-center">
              {uploadingImage ? (
                <Loader2 size={30} className="animate-spin text-black/40" />
              ) : profileUrl ? (
                <img
                  src={profileUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} className="text-black/30" />
              )}
            </div>

            {/* Hover Actions */}
            <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
              <label
                title="Change Photo"
                className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-zinc-800 transition-transform active:scale-95"
              >
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </label>

              {profileUrl && (
                <button
                  type="button"
                  onClick={handleDeleteProfileImage}
                  title="Remove Photo"
                  className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-red-700 transition-transform active:scale-95"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* QUICK BIO SUMMARY */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                {basicInfo.name || "Portfolio Admin"}
              </h2>
              {admin?.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-black text-white px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>

            <p className="text-xs text-black/50 mt-1 flex items-center justify-center md:justify-start gap-1.5">
              <Mail size={12} /> {basicInfo.email}
            </p>

            <p className="text-xs sm:text-sm text-black/75 mt-3 leading-relaxed line-clamp-3">
              {basicInfo.aboutDesc ||
                "Write a professional biography about yourself, your background, and your development experience below."}
            </p>

            {/* PORTFOLIO METRICS CHIPS */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl border border-black/20 bg-white/40 text-center">
                <span className="block text-lg font-bold text-black tabular-nums">
                  {counts.projects}
                </span>
                <span className="text-[10px] uppercase font-semibold text-black/50 flex items-center justify-center gap-1">
                  <FolderGit2 size={11} /> Projects
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-black/20 bg-white/40 text-center">
                <span className="block text-lg font-bold text-black tabular-nums">
                  {counts.skills}
                </span>
                <span className="text-[10px] uppercase font-semibold text-black/50 flex items-center justify-center gap-1">
                  <Code2 size={11} /> Skills
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-black/20 bg-white/40 text-center">
                <span className="block text-lg font-bold text-black tabular-nums">
                  {counts.experience}
                </span>
                <span className="text-[10px] uppercase font-semibold text-black/50 flex items-center justify-center gap-1">
                  <Briefcase size={11} /> Experience
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-black/20 bg-white/40 text-center">
                <span className="block text-lg font-bold text-black tabular-nums">
                  {counts.education}
                </span>
                <span className="text-[10px] uppercase font-semibold text-black/50 flex items-center justify-center gap-1">
                  <GraduationCap size={11} /> Education
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            BASIC DETAILS EDIT FORM
        ====================================================== */}
        <form
          onSubmit={handleBasicInfoSubmit}
          className="w-full bg-[#dadada] border border-black/25 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-black/15 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                Personal Credentials
              </h3>
              <p className="text-[11px] text-black/50">
                Update your contact details and biography
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-9 px-4 rounded-lg bg-black text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-800 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Save Details
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* FULL NAME */}
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
                />
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, name: e.target.value })
                  }
                  required
                  placeholder="Your Name"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-black/20 bg-white text-xs outline-none focus:border-black"
                />
              </div>
            </div>

            {/* EMAIL (DISABLED) */}
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
                />
                <input
                  type="email"
                  value={basicInfo.email}
                  disabled
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-black/10 bg-black/5 text-xs text-black/50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* PHONE NUMBER */}
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Mobile Number (10 Digits)
              </label>
              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
                />
                <input
                  type="tel"
                  maxLength={10}
                  value={basicInfo.mobileNo}
                  onChange={(e) =>
                    setBasicInfo({
                      ...basicInfo,
                      mobileNo: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="9876543210"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-black/20 bg-white text-xs outline-none focus:border-black"
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Location Address
              </label>
              <div className="relative">
                <MapPin
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
                />
                <input
                  type="text"
                  value={basicInfo.address}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, address: e.target.value })
                  }
                  placeholder="Ahmedabad, Gujarat, India"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-black/20 bg-white text-xs outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* BIO / ABOUT DESC */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              About Description / Bio
            </label>
            <textarea
              rows={4}
              value={basicInfo.aboutDesc}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, aboutDesc: e.target.value })
              }
              placeholder="Tell your story, focus areas, tech interests..."
              className="w-full p-3 rounded-lg border border-black/20 bg-white text-xs outline-none focus:border-black resize-none leading-relaxed"
            />
          </div>
          {/* BIO / SHORT Desc */}
          <div>
              <label className="block text-xs font-semibold mb-1.5">
              Short About Description / Bio
            </label>
            <textarea
              rows={4}
              value={basicInfo.shortDescription}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, shortDescription: e.target.value })
              }
              placeholder="Tell your story, focus areas, tech interests (For Home Page)..."
              className="w-full p-3 rounded-lg border border-black/20 bg-white text-xs outline-none focus:border-black resize-none leading-relaxed"
            />
          </div>
        </form>

        {/* =====================================================
            HOBBIES & SOCIAL PROFILES GRID
        ====================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HOBBIES SECTION */}
          <div className="w-full bg-[#dadada] border border-black/25 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-black/15 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Heart size={15} /> Personal Hobbies
                  </h3>
                  <p className="text-[11px] text-black/50">
                    Interests and activities outside of programming
                  </p>
                </div>
              </div>

              {/* HOBBY TAGS */}
              <div className="flex flex-wrap gap-2 mb-4">
                {hobbies.map((hobby) => {
                  const hId = hobby._id || hobby;
                  const hName = typeof hobby === "object" ? hobby.name : hobby;
                  return (
                    <span
                      key={hId}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-black/20 bg-white/75 text-xs font-medium text-black shadow-2xs"
                    >
                      {hName}
                      <button
                        type="button"
                        onClick={() => handleDeleteHobby(hId)}
                        className="text-black/40 hover:text-red-600 transition-colors p-0.5 cursor-pointer ml-1"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
                {hobbies.length === 0 && (
                  <p className="text-xs text-black/40 italic">
                    No hobbies added yet.
                  </p>
                )}
              </div>
            </div>

            {/* ADD HOBBY INPUT */}
            <form onSubmit={handleAddHobby} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="New hobby (e.g., Chess, Guitar)"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg border border-black/20 bg-white text-xs outline-none focus:border-black"
              />
              <button
                type="submit"
                className="h-9 px-3.5 rounded-lg bg-black text-white text-xs font-semibold flex items-center gap-1 hover:bg-zinc-800 cursor-pointer shrink-0"
              >
                <Plus size={13} /> Add
              </button>
            </form>
          </div>

          {/* SOCIAL PROFILES SECTION */}
          <div className="w-full bg-[#dadada] border border-black/25 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-black/15 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Globe size={15} /> Social Connections
                  </h3>
                  <p className="text-[11px] text-black/50">
                    Online profiles, LinkedIn, Twitter/X, GitHub
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSocialModal(true)}
                  className="h-8 px-3 rounded-lg bg-black text-white text-xs font-semibold flex items-center gap-1 hover:bg-zinc-800 cursor-pointer"
                >
                  <Plus size={12} /> Add Link
                </button>
              </div>

              {/* SOCIAL CARDS LIST */}
              <div className="space-y-2 mb-4">
                {socialProfiles.map((social) => {
                  const sId = social._id || social;
                  const sName = typeof social === "object" ? social.name : "Social Link";
                  const sLink = typeof social === "object" ? social.link : "#";
                  const sIcon =
                    typeof social === "object" ? social.platformImageUrl : null;

                  return (
                    <div
                      key={sId}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-black/15 bg-white/70 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {sIcon ? (
                          <img
                            src={sIcon}
                            alt=""
                            className="w-5 h-5 object-contain rounded-xs shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                            {sName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-black truncate">
                            {sName}
                          </p>
                          <a
                            href={sLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-black/50 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{sLink}</span>
                            <ExternalLink size={10} className="shrink-0" />
                          </a>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSocial(sId)}
                        className="text-black/40 hover:text-red-600 transition-colors p-1.5 cursor-pointer ml-2"
                        title="Remove link"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
                {socialProfiles.length === 0 && (
                  <p className="text-xs text-black/40 italic">
                    No social connections added.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ADD SOCIAL MODAL (WITH DUAL UPLOAD / URL TABS)
      ====================================================== */}
      {showSocialModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={() => setShowSocialModal(false)}
        >
          <form
            onSubmit={handleAddSocial}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-black/10 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-black">
                  Add Social Profile
                </h3>
                <p className="text-[11px] text-black/40">
                  Connect an online profile link with custom icon
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSocialModal(false)}
                className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center hover:bg-black hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* PLATFORM NAME */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Platform Name
              </label>
              <input
                type="text"
                placeholder="e.g., LinkedIn, GitHub, X"
                value={newSocial.name}
                onChange={(e) =>
                  setNewSocial({ ...newSocial, name: e.target.value })
                }
                required
                className="w-full h-10 px-3 rounded-lg border border-black/20 text-xs outline-none focus:border-black"
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Profile URL (Must start with https://)
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={newSocial.link}
                onChange={(e) =>
                  setNewSocial({ ...newSocial, link: e.target.value })
                }
                required
                className="w-full h-10 px-3 rounded-lg border border-black/20 text-xs outline-none focus:border-black"
              />
            </div>

            {/* ICON SOURCE PICKER: UPLOAD OR URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold">
                  Platform Icon
                </label>
                <div className="flex items-center h-7 p-0.5 rounded-lg border border-black/20 bg-black/5">
                  <button
                    type="button"
                    onClick={() => setSocialMode("file")}
                    className={`h-full px-2 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${socialMode === "file"
                        ? "bg-black text-white shadow-xs"
                        : "text-black/60 hover:text-black"
                      }`}
                  >
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setSocialMode("url")}
                    className={`h-full px-2 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${socialMode === "url"
                        ? "bg-black text-white shadow-xs"
                        : "text-black/60 hover:text-black"
                      }`}
                  >
                    Direct URL
                  </button>
                </div>
              </div>

              {socialMode === "file" ? (
                <label className="w-full h-12 px-3 rounded-lg border border-dashed border-black/30 bg-black/[0.02] flex items-center justify-between cursor-pointer hover:bg-black/[0.04] transition">
                  <div className="flex items-center gap-2 text-black/60 truncate">
                    <Upload size={14} className="shrink-0" />
                    <span className="text-xs truncate">
                      {socialFile ? socialFile.name : "Select icon image"}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-black bg-black/10 px-2 py-0.5 rounded">
                    Browse
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSocialFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative flex items-center">
                  <LinkIcon
                    size={13}
                    className="absolute left-3 text-black/40"
                  />
                  <input
                    type="url"
                    placeholder="https://cdn.icon...png"
                    value={newSocial.platformImageUrl}
                    onChange={(e) =>
                      setNewSocial({
                        ...newSocial,
                        platformImageUrl: e.target.value,
                      })
                    }
                    className="w-full h-10 pl-8 pr-3 rounded-lg border border-black/20 text-xs outline-none focus:border-black"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
              <button
                type="button"
                disabled={socialSubmitting}
                onClick={() => setShowSocialModal(false)}
                className="h-9 px-4 rounded-lg border border-black/20 text-xs font-medium hover:bg-black/5 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={socialSubmitting}
                className="h-9 px-4 rounded-lg bg-black text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
              >
                {socialSubmitting && (
                  <Loader2 size={13} className="animate-spin" />
                )}
                Add Social Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default About;