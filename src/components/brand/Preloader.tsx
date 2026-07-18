import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import pactosIntro from "@/assets/pactos_intro.png.asset.json";

const SESSION_KEY = "pactos-preloader-shown";

export function Preloader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, "1");
    const t = setTimeout(() => setVisible(false), 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pactos-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] grid place-items-center bg-black"
          aria-hidden
        >
          <motion.img
            src={pactosIntro.url}
            alt="PactOS"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[min(72vw,720px)] select-none drop-shadow-[0_0_60px_rgba(124,255,0,0.35)]"
            draggable={false}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="pointer-events-none absolute bottom-24 h-[2px] w-40 overflow-hidden rounded-full bg-white/10"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
              className="h-full w-1/2 bg-[#7CFF00] shadow-[0_0_16px_rgba(124,255,0,0.7)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}