import React, { useState, useEffect } from "react";
import { Calendar, MapPin } from "lucide-react";
import api from "../api/axios";

const Experience = () => {
  const [experiences, setExperiences] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchExperiences = async () => {
      try {
        const { data } = await api.get("/api/portfolio/experience");

        const rawList =
          data?.experiences ||
          data?.experience ||
          data?.data ||
          (Array.isArray(data) ? data : null);

        if (isMounted && Array.isArray(rawList)) {
          // Keep records that have either a company name or a role
          const validRecords = rawList.filter((exp) => {
            if (!exp || typeof exp !== "object") return false;
            const company = exp.companyName || exp.company || "";
            const role = exp.designation || exp.role || exp.position || "";
            return Boolean(String(company).trim() || String(role).trim());
          });

          setExperiences(validRecords);
        } else if (isMounted) {
          setExperiences([]);
        }
      } catch (err) {
        console.error("Failed to fetch experiences:", err);
        if (isMounted) setExperiences([]);
      }
    };

    fetchExperiences();

    return () => {
      isMounted = false;
    };
  }, []);

  // Don't render anything if data is missing or empty
  if (!experiences || experiences.length === 0) {
    return null;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
    }
    return dateStr;
  };

  return (
    <div className="relative flex flex-col justify-start items-start w-[90%] max-w-5xl mx-auto pb-16 antialiased">
      <h1 className="w-full text-start text-3xl mt-6 font-bold">
        Experience<span className="animate-pulse">_</span>
      </h1>

      <div className="relative w-full mt-10">
        {/* Center line on >=md, Left line on <md */}
        <div className="absolute top-4 bottom-4 left-4 md:left-1/2 -translate-x-1/2 w-[2px] bg-black/70" />

        <div className="flex flex-col gap-10 sm:gap-14 w-full">
          {experiences.map((exp, idx) => {
            const isEven = idx % 2 === 0;
            const company = exp.companyName || exp.company;
            const designation = exp.designation || exp.role || exp.position;
            const logo = exp.companyLogo?.url || exp.logo;
            const isCurrent = Boolean(exp.currentlyWorkingHere ?? exp.currentlyWorking);
            const location = exp.companyLocation || exp.location;
            const points = exp.work?.points || (typeof exp.work === "string" ? [exp.work] : []);

            return (
              <div
                key={exp._id || idx}
                className="relative flex items-center md:justify-between w-full"
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-[#dadada] z-20 shadow-xs" />

                {/* Left Desktop Slot (>= md only) */}
                <div className="hidden md:flex w-[46%] justify-end">
                  {isEven ? (
                    <div className="w-full">
                      <ExperienceCard
                        company={company}
                        designation={designation}
                        logo={logo}
                        joiningDate={formatDate(exp.joiningDate)}
                        endDate={formatDate(exp.endDate || exp.lastDate)}
                        isCurrent={isCurrent}
                        location={location}
                        points={points}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-end justify-center pr-6 text-right">
                      <span className="text-sm font-bold text-black">{company}</span>
                      {(exp.joiningDate || exp.endDate || isCurrent) && (
                        <span className="text-xs text-black/60 font-medium">
                          {formatDate(exp.joiningDate) || "—"} — {isCurrent ? "Present" : formatDate(exp.endDate || exp.lastDate) || "—"}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Desktop Slot (>= md) AND Full Mobile Slot (< md) */}
                <div className="w-full pl-10 md:pl-0 md:w-[46%] flex justify-start">
                  {/* On Mobile (< md): Always render the full card */}
                  <div className="block md:hidden w-full">
                    <ExperienceCard
                      company={company}
                      designation={designation}
                      logo={logo}
                      joiningDate={formatDate(exp.joiningDate)}
                      endDate={formatDate(exp.endDate || exp.lastDate)}
                      isCurrent={isCurrent}
                      location={location}
                      points={points}
                    />
                  </div>

                  {/* On Desktop (>= md): Alternate between Card and Meta-text */}
                  <div className="hidden md:block w-full">
                    {!isEven ? (
                      <ExperienceCard
                        company={company}
                        designation={designation}
                        logo={logo}
                        joiningDate={formatDate(exp.joiningDate)}
                        endDate={formatDate(exp.endDate || exp.lastDate)}
                        isCurrent={isCurrent}
                        location={location}
                        points={points}
                      />
                    ) : (
                      <div className="flex flex-col items-start justify-center pl-6 text-left">
                        <span className="text-sm font-bold text-black">{company}</span>
                        {(exp.joiningDate || exp.endDate || isCurrent) && (
                          <span className="text-xs text-black/60 font-medium">
                            {formatDate(exp.joiningDate) || "—"} — {isCurrent ? "Present" : formatDate(exp.endDate || exp.lastDate) || "—"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ExperienceCard = ({
  company,
  designation,
  logo,
  joiningDate,
  endDate,
  isCurrent,
  location,
  points,
}) => {
  return (
    <div className="w-full bg-[#dadada] border border-black/30 rounded-xl p-4 shadow-xs hover:border-black transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg border border-black/30 bg-white overflow-hidden flex items-center justify-center shrink-0">
            {logo ? (
              <img
                src={logo}
                alt={company || ""}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <span className="font-bold text-sm text-black/70">
                {company?.charAt(0)?.toUpperCase() || "E"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-black truncate leading-tight">
              {designation}
            </h3>
            {company && (
              <p className="text-xs text-black/60 font-semibold truncate mt-0.5">
                @{company}
              </p>
            )}
          </div>
        </div>

        {isCurrent ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-black text-white px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        ) : (
          <span className="text-[10px] font-medium border border-black/20 bg-white/50 text-black/70 px-2 py-0.5 rounded-full shrink-0">
            Completed
          </span>
        )}
      </div>

      {(joiningDate || endDate || location) && (
        <div className="mt-3 flex items-center gap-3 flex-wrap text-[11px] text-black/60 border-t border-black/10 pt-2">
          {(joiningDate || endDate) && (
            <span className="inline-flex items-center gap-1 font-medium">
              <Calendar size={12} className="text-black/50" />
              {joiningDate || "—"} — {isCurrent ? "Present" : endDate || "—"}
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1 font-medium">
              <MapPin size={12} className="text-black/50" />
              {location}
            </span>
          )}
        </div>
      )}

      {points?.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-black/10 pt-2.5">
          {points.map((pt, pIdx) => (
            <li
              key={pIdx}
              className="text-xs text-black/80 leading-relaxed flex items-start gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-black/60 mt-1.5 shrink-0" />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Experience;