import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Award } from "lucide-react";
import api from "../api/axios";

const Education = () => {
  const [educations, setEducations] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEducations = async () => {
      try {
        const res = await api.get("/api/portfolio/education");
        const data = res?.data;

        const rawList =
          data?.educations ||
          data?.education ||
          data?.data ||
          (Array.isArray(data) ? data : null);

        if (isMounted && Array.isArray(rawList)) {
          const validRecords = rawList.filter((edu) => {
            if (!edu || typeof edu !== "object") return false;
            const name =
              edu.instituteName || edu.schoolOrCollege || edu.institute || "";
            const study =
              edu.study || edu.std || edu.degree || edu.course || "";
            return Boolean(String(name).trim() || String(study).trim());
          });

          setEducations(validRecords);
        } else if (isMounted) {
          setEducations([]);
        }
      } catch (err) {
        console.error("Failed to fetch education records:", err);
        if (isMounted) setEducations([]);
      }
    };

    fetchEducations();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!educations || educations.length === 0) {
    return null;
  }

  const formatPassedYear = (edu) => {
    if (edu?.currentlyStudying || edu?.active || !edu?.passedYear) {
      return "Present";
    }
    const d = new Date(edu.passedYear);
    if (!Number.isNaN(d.getTime())) {
      return d.getFullYear();
    }
    return edu.passedYear || edu.year || "—";
  };

  return (
    <div className="relative flex flex-col justify-start items-start w-[90%] max-w-5xl mx-auto pb-16 antialiased">
      <h1 className="w-full text-start text-3xl mt-6 font-bold">
        Education<span className="animate-pulse">_</span>
      </h1>

      <div className="relative w-full mt-10">
        {/* Center Line on desktop (md:left-1/2), Left Line on mobile (left-4) */}
        <div className="absolute top-4 bottom-4 left-4 md:left-1/2 -translate-x-1/2 w-[2px] bg-black/70" />

        <div className="flex flex-col gap-10 sm:gap-14 w-full">
          {educations.map((edu, idx) => {
            const isEven = idx % 2 === 0;
            const institute =
              edu.instituteName ||
              edu.schoolOrCollege ||
              edu.institute ||
              "Institute";
            const study =
              edu.study || edu.std || edu.degree || edu.course || "Study";
            const logo = edu.instituteLogo?.url || edu.logo;
            const isCurrent = Boolean(edu.currentlyStudying ?? edu.active);
            const address = edu.address || edu.location;
            const grade =
              edu.grade?.value !== undefined
                ? `${edu.grade.value}${
                    edu.grade?.title?.toLowerCase() === "percentage" ? "%" : ""
                  } (${edu.grade?.title?.toUpperCase() || ""})`
                : edu.grade;

            return (
              <div
                key={edu._id || idx}
                className="relative flex items-center md:justify-between w-full"
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-[#dadada] z-20 shadow-xs" />

                {/* Left Desktop Slot (>= md only) */}
                <div className="hidden md:flex w-[46%] justify-end">
                  {isEven ? (
                    <div className="w-full">
                      <EducationCard
                        institute={institute}
                        study={study}
                        logo={logo}
                        passedYear={formatPassedYear(edu)}
                        isCurrent={isCurrent}
                        grade={grade}
                        address={address}
                        description={edu.description || edu.desc}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-end justify-center pr-6 text-right">
                      <span className="text-sm font-bold text-black">
                        {institute}
                      </span>
                      <span className="text-xs text-black/60 font-medium">
                        {study} • {formatPassedYear(edu)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Desktop Slot (>= md) AND Full Mobile Slot (< md) */}
                <div className="w-full pl-10 md:pl-0 md:w-[46%] flex justify-start">
                  {/* On Mobile (< md): Always show the full EducationCard */}
                  <div className="block md:hidden w-full">
                    <EducationCard
                      institute={institute}
                      study={study}
                      logo={logo}
                      passedYear={formatPassedYear(edu)}
                      isCurrent={isCurrent}
                      grade={grade}
                      address={address}
                      description={edu.description || edu.desc}
                    />
                  </div>

                  {/* On Desktop (>= md): Alternate between Card and Meta-text */}
                  <div className="hidden md:block w-full">
                    {!isEven ? (
                      <EducationCard
                        institute={institute}
                        study={study}
                        logo={logo}
                        passedYear={formatPassedYear(edu)}
                        isCurrent={isCurrent}
                        grade={grade}
                        address={address}
                        description={edu.description || edu.desc}
                      />
                    ) : (
                      <div className="flex flex-col items-start justify-center pl-6 text-left">
                        <span className="text-sm font-bold text-black">
                          {institute}
                        </span>
                        <span className="text-xs text-black/60 font-medium">
                          {study} • {formatPassedYear(edu)}
                        </span>
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

const EducationCard = ({
  institute,
  study,
  logo,
  passedYear,
  isCurrent,
  grade,
  address,
  description,
}) => {
  return (
    <div className="w-full bg-[#dadada] border border-black/30 rounded-xl p-4 shadow-xs hover:border-black transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg border border-black/30 bg-white overflow-hidden flex items-center justify-center shrink-0">
            {logo ? (
              <img
                src={logo}
                alt={institute}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <span className="font-bold text-sm text-black/70">
                {institute?.charAt(0)?.toUpperCase() || "E"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-black truncate leading-tight">
              {study}
            </h3>
            <p className="text-xs text-black/60 font-semibold truncate mt-0.5">
              @{institute}
            </p>
          </div>
        </div>

        {isCurrent ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-black text-white px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Current
          </span>
        ) : (
          <span className="text-[10px] font-medium border border-black/20 bg-white/50 text-black/70 px-2 py-0.5 rounded-full shrink-0">
            Completed
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 flex-wrap text-[11px] text-black/60 border-t border-black/10 pt-2">
        <span className="inline-flex items-center gap-1 font-medium">
          <Calendar size={12} className="text-black/50" />
          {passedYear}
        </span>
        {grade && (
          <span className="inline-flex items-center gap-1 font-medium">
            <Award size={12} className="text-black/50" />
            {grade}
          </span>
        )}
        {address && (
          <span className="inline-flex items-center gap-1 font-medium">
            <MapPin size={12} className="text-black/50" />
            {address}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2.5 pt-2 border-t border-black/10 text-xs text-black/80 leading-relaxed text-justify">
          {description}
        </p>
      )}
    </div>
  );
};

export default Education;