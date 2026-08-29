import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Landing = ({ homeLoaded, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;

    const interval = setInterval(() => {
      if (current < 90) {
        current += Math.floor(Math.random() * 4) + 1;

        if (current > 90) current = 90;

        setProgress(current);
      } else if (homeLoaded) {
        current = 100;
        setProgress(100);

        clearInterval(interval);

        setTimeout(() => {
          onComplete?.();
        }, 900);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [homeLoaded, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.7,
          ease: "easeInOut",
        },
      }}
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#F3F0EA]"
    >
      {/* ================= BACKGROUND DEPTH ================= */}

      <div className="pointer-events-none absolute -left-[40%] -top-[15%] h-[120vw] w-[120vw] rounded-full bg-[#DCE5E8]/35 blur-[100px] sm:-left-[20%] sm:-top-[30%] sm:h-[70vw] sm:w-[70vw] sm:blur-[140px]" />

      <div className="pointer-events-none absolute -bottom-[20%] -right-[40%] h-[120vw] w-[120vw] rounded-full bg-[#E8D8CF]/30 blur-[100px] sm:-bottom-[35%] sm:-right-[20%] sm:h-[70vw] sm:w-[70vw] sm:blur-[160px]" />

      {/* =====================================================
          BACKGROUND GRID
      ====================================================== */}

      {/* Top vertical line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="
          absolute
          left-[72%]
          top-0
          h-[24%]
          w-px
          origin-top
          bg-[#6F747B]

          sm:left-[54%]
          sm:h-[37%]
        "
      />

      {/* Top horizontal right */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="
          absolute
          left-[50%]
          top-[18%]
          h-px
          w-[50%]
          origin-left
          bg-[#6F747B]

          sm:top-[25%]
        "
      />

      {/* Small top horizontal left */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="
          absolute
          left-0
          top-[29%]
          h-px
          w-[72%]
          origin-left
          bg-[#6F747B]

          sm:top-[33%]
          sm:w-[57%]
        "
      />

      {/* Small crossing line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="
          absolute
          left-[65%]
          top-[18%]
          h-px
          w-[20%]
          origin-left
          bg-[#6F747B]

          sm:left-[47%]
          sm:top-[25%]
          sm:w-[12%]
        "
      />

      {/* =====================================================
          GREY PORT BLOCK
      ====================================================== */}

      <motion.div
        initial={{
          width: 0,
          opacity: 0,
        }}
        animate={{
          width: "50%",
          opacity: 1,
        }}
        transition={{
          duration: 0.9,
          delay: 0.45,
          ease: [0.76, 0, 0.24, 1],
        }}
        className="
          absolute
          left-0
          top-[34%]
          h-[18%]
          pr-[56%]
          overflow-hidden
          bg-[#3F464D]
            W-[50%]
          sm:top-[37%]
          sm:h-[20%]
          sm:w-[50%]
        "
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#58616B]/50 via-transparent to-[#252A30]/50" />
      </motion.div>

      {/* =====================================================
          MAIN PORTFOLIO TEXT
      ====================================================== */}

      <div
        className="
          absolute
          left-[6%]
          top-[34%]
          flex
          h-[18%]
          w-[94%]
          items-center

          sm:left-[12%]
          sm:top-[37%]
          sm:h-[20%]
          sm:w-[88%]
        "
      >
        {/* PORT */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 1.1,
          }}
          className="
            relative
            z-10
            text-[clamp(52px,17vw,150px)]
            font-black
            leading-none
            tracking-[0.007em]
            text-[#F7F4EE]

            sm:ml-[16%]
            sm:text-[clamp(70px,8vw,150px)]
          "
        >
          PORT
        </motion.div>

        {/* FOLIO */}
        <motion.div
          initial={{
            opacity: 0,
            x: -30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 1.3,
          }}
          className="
            relative
            z-10
            ml-[2%]
            text-[clamp(52px,17vw,150px)]
            font-black
            leading-none
            tracking-[0.007em]
            text-[#292D33]

            sm:ml-[3.5%]
            sm:text-[clamp(70px,8vw,150px)]
          "
        >
          FOLIO
        </motion.div>
      </div>

      {/* =====================================================
          MIDDLE HORIZONTAL LINE
      ====================================================== */}

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 0.9,
          delay: 0.65,
        }}
        className="
          absolute
          left-0
          top-[57%]
          h-px
          w-[100%]
          origin-left
          bg-[#6F747B]

          sm:top-[61%]
          sm:w-[80%]
        "
      />

      {/* =====================================================
          CENTER VERTICAL LINE
      ====================================================== */}

      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{
          duration: 0.7,
          delay: 0.8,
        }}
        className="
          absolute
          left-[25%]
          top-[52%]
          h-[48%]
          w-px
          origin-top
          bg-[#6F747B]

          sm:left-[46.5%]
          sm:top-[57%]
          sm:h-[43%]
        "
      />

      {/* =====================================================
          RIGHT VERTICAL LINE
      ====================================================== */}

      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{
          duration: 0.7,
          delay: 0.9,
        }}
        className="
          absolute
          left-[75%]
          top-[52%]
          h-[25%]
          w-px
          origin-top
          bg-[#6F747B]

          sm:left-[76%]
          sm:top-[57%]
          sm:h-[23%]
        "
      />

      {/* =====================================================
          RIGHT SMALL HORIZONTAL LINE
      ====================================================== */}

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 0.7,
          delay: 1,
        }}
        className="
          absolute
          left-[45%]
          top-[68%]
          h-px
          w-[55%]
          origin-left
          bg-[#6F747B]
            
          sm:left-[63%]
          sm:top-[69%]
          sm:w-[37%]
        "
      />

      {/* =====================================================
          BOTTOM LINE
      ====================================================== */}

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 0.9,
          delay: 1.1,
        }}
        className="
          absolute
          bottom-[10%]
          left-[10%]
          h-px
          w-[90%]
          origin-left
          bg-[#6F747B]

          sm:bottom-[4.5%]
          sm:left-[43%]
          sm:w-[57%]
        "
      />

      {/* =====================================================
          FULL STACK DEVELOPER LABEL
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 1.25,
        }}
        className="
          absolute
          left-[7%]
          top-[24%]
          text-[10px]
          font-semibold
          tracking-tight
          text-[#4E545C]

          sm:left-[23.5%]
          sm:top-[28%]
          sm:text-[clamp(10px,0.9vw,15px)]
        "
      >
        Full Stack Developer
      </motion.div>

      {/* =====================================================
          NAME
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          x: -15,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 1.4,
        }}
        className="
          absolute
          left-[30%]
          top-[63%]
          text-[15px]
          font-bold
          tracking-tight
          text-[#30353B]

          sm:left-[50%]
          sm:top-[68%]
          sm:text-[clamp(15px,1.4vw,24px)]
        "
      >
        Kishan Patel
      </motion.div>

      {/* =====================================================
          YEAR
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          x: 20,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 1.5,
        }}
        className="
          absolute
          right-[7%]
          top-[58.5%]
          text-[clamp(28px,10vw,55px)]
          font-black
          leading-none
          tracking-[-0.06em]
          text-[#30353B]

          sm:right-[8.5%]
          sm:text-[clamp(30px,3vw,55px)]
        "
      >
        {new Date().getFullYear().toString()}
      </motion.div>

      {/* =====================================================
          LOADING COUNTER
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.4,
          delay: 0.2,
        }}
        className="
          absolute
          bottom-5
          left-5
          flex
          items-baseline
          gap-1
          text-[#686E76]

          sm:bottom-8
          sm:left-8
          sm:gap-2
        "
      >
        <motion.span
          key={progress}
          initial={{ opacity: 0.5, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold tabular-nums sm:text-2xl"
        >
          {String(progress).padStart(3, "0")}
        </motion.span>

        <span className="text-xs font-medium text-[#9A9DA0] sm:text-sm">
          %
        </span>
      </motion.div>

      {/* =====================================================
          LOADING LINE
      ====================================================== */}

      <div
        className="
          absolute
          bottom-6
          right-5
          h-[2px]
          w-[30%]
          overflow-hidden
          bg-[#D5D1C9]

          sm:bottom-8
          sm:right-8
          sm:w-[18%]
        "
      >
        <motion.div
          animate={{
            width: `${progress}%`,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          className="h-full bg-[#C97858]"
        />
      </div>

      {/* =====================================================
          SMALL ACCENT DOT
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.4,
          delay: 1.2,
        }}
        className="
          absolute
          bottom-[10%]
          left-[7%]
          h-[5px]
          w-[5px]
          rounded-full
          bg-[#C97858]

          sm:bottom-[4.5%]
          sm:left-[40%]
        "
      />
    </motion.div>
  );
};

export default Landing;