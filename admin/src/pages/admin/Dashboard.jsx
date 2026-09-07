import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FolderGit2,
  GraduationCap,
  Briefcase,
  BookOpen,
  User,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ArrowUpRight,
  Heart,
  Globe,
} from "lucide-react";
import { UseAdmin } from "../../context/AdminContext";
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

const Dashboard = () => {
  const { admin } = UseAdmin();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    profile: null,
    projects: [],
    skills: [],
    experience: [],
    education: [],
    techStacks: [],
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [profileRes, projRes, skillRes, expRes, eduRes, techRes] =
        await Promise.allSettled([
          api.get("/api/admin/me", { withCredentials: true }),
          api.get("/api/admin/projects", { withCredentials: true }),
          api.get("/api/admin/skills", { withCredentials: true }),
          api.get("/api/admin/experience", { withCredentials: true }),
          api.get("/api/admin/education", { withCredentials: true }),
          api.get("/api/admin/techstack", { withCredentials: true }),
        ]);

      setData({
        profile:
          profileRes.status === "fulfilled" && profileRes.value.data?.admin
            ? profileRes.value.data.admin
            : admin || null,
        projects:
          projRes.status === "fulfilled" && projRes.value.data?.projects
            ? projRes.value.data.projects
            : [],
        skills:
          skillRes.status === "fulfilled" && skillRes.value.data?.skills
            ? skillRes.value.data.skills
            : [],
        experience:
          expRes.status === "fulfilled" && expRes.value.data?.experiences
            ? expRes.value.data.experiences
            : [],
        education:
          eduRes.status === "fulfilled" && eduRes.value.data?.educations
            ? eduRes.value.data.educations
            : [],
        techStacks:
          techRes.status === "fulfilled" && techRes.value.data?.techStacks
            ? techRes.value.data.techStacks
            : [],
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const profile = data.profile || admin;
  const profileUrl = profile?.about?.profile?.url;

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#dadada] flex flex-col items-center justify-center text-black">
        <Loader2 size={32} className="animate-spin text-black/50" />
        <p className="text-xs font-semibold text-black/60 mt-3 uppercase tracking-wider">
          Aggregating Dashboard Overview...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#dadada] text-black antialiased">
      {/* =====================================================
          TOP BAR (Height locked to h-16 to align with Sidebar)
      ====================================================== */}
      <div className="w-full h-16 border-b border-[#0000009b] bg-[#dadada] flex items-center justify-between px-6 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">Dashboard</h1>
            <p className="text-[11px] text-black/40 mt-1">
              Portfolio metrics, active projects & profile status
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          title="Refresh Dashboard"
          className="w-9 h-9 rounded-lg border border-black/20 bg-[#dadada] flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* =====================================================
          MAIN SCROLLABLE CONTENT
      ====================================================== */}
      <div className="w-full flex-1 p-4 sm:p-6 2xl:p-8 space-y-6 max-w-7xl mx-auto">
        {/* =====================================================
            1. HERO IDENTITY & METRICS CARD
        ====================================================== */}
        <div className="w-full bg-[#dadada] border border-black/30 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
            {/* Identity Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-black/40 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                {profileUrl ? (
                  <img
                    src={profileUrl}
                    alt={profile?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={44} className="text-black/30" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold tracking-tight text-black">
                    {profile?.name || "Portfolio Admin"}
                  </h2>
                  {profile?.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-black text-white px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-black/50 mt-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Mail size={12} /> {profile?.email}
                  </span>
                  {profile?.about?.mobileNo && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Phone size={12} /> {profile.about.mobileNo}
                      </span>
                    </>
                  )}
                  {profile?.about?.address && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} /> {profile.about.address}
                      </span>
                    </>
                  )}
                </p>

                <p className="text-xs sm:text-sm text-black/75 mt-3 max-w-2xl leading-relaxed line-clamp-2">
                  {profile?.about?.aboutDesc ||
                    "Manage and display your complete full-stack portfolio from this administrative center."}
                </p>

                {/* Social & Hobby quick chips */}
                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {profile?.about?.socialProfiles?.map((social, i) => {
                    const name = typeof social === "object" ? social.name : "Social";
                    const link = typeof social === "object" ? social.link : "#";
                    return (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-black/20 bg-white/70 text-[11px] font-medium text-black hover:bg-black hover:text-white transition-colors"
                      >
                        <Globe size={11} />
                        <span>{name}</span>
                        <ArrowUpRight size={10} />
                      </a>
                    );
                  })}
                  {profile?.about?.hobbies?.map((hobby, i) => {
                    const hName = typeof hobby === "object" ? hobby.name : hobby;
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-black/15 bg-black/5 text-[11px] font-medium text-black/80"
                      >
                        <Heart size={10} className="text-black/50" />
                        <span>{hName}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Link to Edit About */}
            <Link
              to="/admin/about"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Edit Profile
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Quick Metrics Grid */}
          <div className="mt-6 pt-6 border-t border-black/15 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/admin/projects"
              className="p-3.5 rounded-xl border border-black/20 bg-white/40 hover:bg-white/70 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[11px] uppercase font-bold text-black/50 flex items-center gap-1.5">
                  <FolderGit2 size={13} /> Projects
                </span>
                <span className="text-2xl font-bold text-black tabular-nums mt-1 block">
                  {data.projects.length}
                </span>
              </div>
              <ArrowUpRight
                size={16}
                className="text-black/30 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </Link>

            <Link
              to="/admin/skills"
              className="p-3.5 rounded-xl border border-black/20 bg-white/40 hover:bg-white/70 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[11px] uppercase font-bold text-black/50 flex items-center gap-1.5">
                  <GraduationCap size={13} /> Skills
                </span>
                <span className="text-2xl font-bold text-black tabular-nums mt-1 block">
                  {data.skills.length}
                </span>
              </div>
              <ArrowUpRight
                size={16}
                className="text-black/30 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </Link>

            <Link
              to="/admin/experience"
              className="p-3.5 rounded-xl border border-black/20 bg-white/40 hover:bg-white/70 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[11px] uppercase font-bold text-black/50 flex items-center gap-1.5">
                  <Briefcase size={13} /> Experience
                </span>
                <span className="text-2xl font-bold text-black tabular-nums mt-1 block">
                  {data.experience.length}
                </span>
              </div>
              <ArrowUpRight
                size={16}
                className="text-black/30 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </Link>

            <Link
              to="/admin/education"
              className="p-3.5 rounded-xl border border-black/20 bg-white/40 hover:bg-white/70 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[11px] uppercase font-bold text-black/50 flex items-center gap-1.5">
                  <BookOpen size={13} /> Education
                </span>
                <span className="text-2xl font-bold text-black tabular-nums mt-1 block">
                  {data.education.length}
                </span>
              </div>
              <ArrowUpRight
                size={16}
                className="text-black/30 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </Link>
          </div>
        </div>

        {/* =====================================================
            2. RECENT PROJECTS SECTION
        ====================================================== */}
        <div className="w-full bg-[#dadada] border border-black/25 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <FolderGit2 size={16} /> Featured Portfolio Projects
              </h3>
              <p className="text-[11px] text-black/50">
                Direct view into your live showcase repository
              </p>
            </div>
            <Link
              to="/admin/projects"
              className="text-xs font-semibold text-black underline hover:text-black/60 transition-colors flex items-center gap-1"
            >
              Manage all ({data.projects.length})
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {data.projects.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-black/25 text-center text-xs text-black/40">
              No projects added yet.{" "}
              <Link to="/admin/projects" className="underline text-black font-semibold">
                Add your first project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.projects.slice(0, 3).map((proj) => (
                <div
                  key={proj._id}
                  className="bg-white/80 border border-black/20 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-black/40 transition-colors"
                >
                  <div>
                    {proj?.image?.url ? (
                      <div className="w-full h-32 rounded-lg border border-black/20 overflow-hidden mb-3 bg-[#dadada]">
                        <img
                          src={proj.image.url}
                          alt={proj.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-lg border border-black/20 bg-black/5 flex items-center justify-center text-xs font-bold text-black/30 mb-3">
                        {proj.name}
                      </div>
                    )}

                    <h4 className="text-sm font-bold text-black truncate">
                      {proj.name}
                    </h4>
                    <p className="text-xs text-black/60 mt-1 line-clamp-2 leading-relaxed">
                      {proj.shortdesc}
                    </p>

                    {/* Tech Badges */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {proj.techStack?.slice(0, 3).map((t, idx) => {
                        const tName = typeof t === "object" ? t.name : "Tech";
                        const tIcon = typeof t === "object" ? t.icon?.url : null;
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-black/20 bg-white text-[10px] font-medium text-black/80"
                          >
                            {tIcon && <img src={tIcon} alt="" className="w-3 h-3 object-contain" />}
                            <span>{tName}</span>
                          </span>
                        );
                      })}
                      {proj.techStack?.length > 3 && (
                        <span className="text-[10px] text-black/40 font-medium self-center">
                          +{proj.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {proj.githubLink && proj.githubLink !== "#" && (
                        <a
                          href={proj.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded border border-black/20 hover:bg-black hover:text-white transition-colors"
                          title="Code repository"
                        >
                          <GithubIcon size={12} />
                        </a>
                      )}
                      {proj.publicLink && proj.publicLink !== "#" && (
                        <a
                          href={proj.publicLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded border border-black/20 hover:bg-black hover:text-white transition-colors"
                          title="Live link"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <Link
                      to={`/admin/projects/${proj._id}`}
                      className="text-xs font-semibold text-black hover:underline inline-flex items-center gap-0.5"
                    >
                      Details <ArrowUpRight size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =====================================================
            3. TWO COLUMN: SKILLS & WORK EXPERIENCE
        ====================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SKILLS CARD */}
          <div className="w-full bg-[#dadada] border border-black/25 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-black/15 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <GraduationCap size={15} /> Skills & Proficiencies
                  </h3>
                  <p className="text-[11px] text-black/50">
                    Assessed levels of technical competence
                  </p>
                </div>
                <Link
                  to="/admin/skills"
                  className="text-xs font-semibold text-black underline hover:text-black/60"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-3 mb-4">
                {data.skills.slice(0, 5).map((skill) => (
                  <div
                    key={skill._id}
                    className="p-2.5 rounded-xl border border-black/15 bg-white/70 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-black">
                      <div className="flex items-center gap-2">
                        {skill.technology?.url && (
                          <img
                            src={skill.technology.url}
                            alt=""
                            className="w-4 h-4 object-contain"
                          />
                        )}
                        <span>{skill.name}</span>
                        {skill.category?.name && (
                          <span className="text-[10px] font-normal text-black/40">
                            ({skill.category.name})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-black/60 font-medium">
                        {skill.levelOfKnowledge} ({skill.level || 0}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-500"
                        style={{ width: `${skill.level || 15}%` }}
                      />
                    </div>
                  </div>
                ))}
                {data.skills.length === 0 && (
                  <p className="text-xs text-black/40 italic">No skills registered.</p>
                )}
              </div>
            </div>

            {/* Registered Tech Stack Library Snapshot */}
            {data.techStacks.length > 0 && (
              <div className="pt-3 border-t border-black/10">
                <span className="text-[10px] uppercase font-bold text-black/40 block mb-2">
                  Library Tech Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.techStacks.map((tech) => (
                    <span
                      key={tech._id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-black/20 bg-white/60 text-[10.5px] font-medium text-black"
                    >
                      {tech.icon?.url && (
                        <img src={tech.icon.url} alt="" className="w-3 h-3 object-contain" />
                      )}
                      <span>{tech.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* WORK EXPERIENCE TIMELINE CARD */}
          <div className="w-full bg-[#dadada] border border-black/25 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-black/15 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Briefcase size={15} /> Work Experience
                  </h3>
                  <p className="text-[11px] text-black/50">
                    Roles, positions and company tenures
                  </p>
                </div>
                <Link
                  to="/admin/experience"
                  className="text-xs font-semibold text-black underline hover:text-black/60"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-3">
                {data.experience.slice(0, 4).map((exp) => (
                  <div
                    key={exp._id}
                    className="p-3 rounded-xl border border-black/15 bg-white/70 shadow-2xs flex items-start gap-3"
                  >
                    {exp.companyLogo?.url ? (
                      <img
                        src={exp.companyLogo.url}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover border border-black/20 shrink-0 bg-white"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-black/20 bg-black/5 flex items-center justify-center font-bold text-xs shrink-0">
                        {exp.companyName?.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-black truncate">
                          {exp.designation}
                        </h4>
                        <span className="text-[10px] font-semibold text-black/50 shrink-0">
                          {exp.joiningDate ? new Date(exp.joiningDate).getFullYear() : "—"} -{" "}
                          {exp.currentlyWorkingHere
                            ? "Present"
                            : exp.endDate
                            ? new Date(exp.endDate).getFullYear()
                            : "—"}
                        </span>
                      </div>

                      <p className="text-[11px] text-black/60 font-medium">
                        {exp.companyName} • {exp.companyLocation || "Remote"}
                      </p>

                      {exp.work?.points?.length > 0 && (
                        <p className="text-[11px] text-black/75 mt-1 line-clamp-1 italic">
                          "{exp.work.points[0]}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {data.experience.length === 0 && (
                  <p className="text-xs text-black/40 italic">No experience records found.</p>
                )}
              </div>
            </div>

            {/* Quick Education Footnote */}
            {data.education.length > 0 && (
              <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-black/50 flex items-center gap-1.5 font-medium">
                  <BookOpen size={12} /> Highest Education:{" "}
                  <strong className="text-black font-semibold">
                    {data.education[0].study} - {data.education[0].instituteName}
                  </strong>
                </span>
                <Link
                  to="/admin/education"
                  className="text-[11px] font-semibold text-black underline"
                >
                  Details
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;