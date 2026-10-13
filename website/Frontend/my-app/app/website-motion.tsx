"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useWebsiteHydrationSignal() {
  const pathname = usePathname();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("website-main-hydrated"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
}

export function WebsiteMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let observer: MutationObserver | undefined;
    const entranceTargets = scope.querySelectorAll(
      ".site-nav .brand, .site-nav .nav-links > *",
    );
    let contentStarted = false;
    let onMainHydrated: (() => void) | undefined;
    const context = gsap.context(() => {
      const brand = scope.querySelector(".site-nav .brand");
      const navLinks = scope.querySelectorAll(".site-nav .nav-links > *");
      const navigationTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (brand) navigationTimeline.fromTo(brand, { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, duration: 0.5 });
      if (navLinks.length) navigationTimeline.fromTo(navLinks, { autoAlpha: 0, y: -9 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.045 }, brand ? "-=0.28" : undefined);

      const revealSelector = [
        ".body-part-card",
        ".featured-card",
        ".exercise-card",
        ".collection-card",
        ".next-card",
        ".dashboard-card",
        ".profile-stats > article",
        ".profile-shortcuts > a",
        ".calendar-panel",
        ".calendar-day-panel",
        ".calendar-schedule-panel",
        ".profile-panel",
        ".auth-card",
      ].join(",");

      const startContentMotion = () => {
        if (contentStarted) return;
        contentStarted = true;
        const introTargets = scope.querySelectorAll("main .page-intro > *, main .hero-copy > *, main .welcome-copy > *");
        if (introTargets.length) {
          gsap.fromTo(introTargets, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power3.out" });
        }

        const revealNewContent = () => {
          const unrevealed = scope.querySelectorAll<HTMLElement>(revealSelector);
          unrevealed.forEach((element, index) => {
            if (element.dataset.gsapRevealed) return;
            element.dataset.gsapRevealed = "true";
            gsap.fromTo(
              element,
              { autoAlpha: 0, y: 22 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.48,
                delay: Math.min(index % 5, 4) * 0.055,
                ease: "power2.out",
                scrollTrigger: { trigger: element, start: "top 92%", once: true },
              },
            );
          });
          ScrollTrigger.refresh();
        };

        revealNewContent();
        observer = new MutationObserver(revealNewContent);
        observer.observe(scope, { childList: true, subtree: true });

        const sun = scope.querySelector(".hero-sun, .welcome-sun");
        const orbit = scope.querySelector(".hero-orbit");
        const secondOrbit = scope.querySelector(".hero-orbit-two");
        if (sun) gsap.to(sun, { y: -12, duration: 3.2, ease: "sine.inOut", repeat: -1, yoyo: true });
        if (orbit) gsap.to(orbit, { rotate: "-=3", duration: 8, ease: "sine.inOut", repeat: -1, yoyo: true });
        if (secondOrbit) gsap.to(secondOrbit, { rotate: "+=3", duration: 10, ease: "sine.inOut", repeat: -1, yoyo: true });
      };

      onMainHydrated = () => startContentMotion();
      window.addEventListener("website-main-hydrated", onMainHydrated, { once: true });

      const footer = scope.querySelector(".site-footer");
      if (footer) {
        gsap.fromTo(footer, { autoAlpha: 0, y: 16 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          scrollTrigger: { trigger: footer, start: "top 96%", once: true },
        });
      }
    }, scope);
    const safetyTimer = window.setTimeout(() => {
      gsap.set(entranceTargets, { clearProps: "opacity,visibility,transform" });
    }, 2200);

    return () => {
      window.clearTimeout(safetyTimer);
      if (onMainHydrated) window.removeEventListener("website-main-hydrated", onMainHydrated);
      observer?.disconnect();
      context.revert();
    };
  }, [pathname]);

  return <div className="site-shell" ref={scopeRef}>{children}</div>;
}

export function WebsiteSplash() {
  const splashRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const splash = splashRef.current;
    if (!visible || !splash) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const safetyTimer = window.setTimeout(() => {
      setVisible(false);
    }, 3500);

    const context = gsap.context(() => {
      gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setVisible(false),
      })
        .fromTo(".splash-title", { autoAlpha: 0, scale: 0.82, y: 12 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.65 })
        .to(".splash-progress span", { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, "-=0.1")
        .to(splash, { autoAlpha: 0, duration: 0.45, delay: 0.12 });
    }, splash);

    return () => {
      window.clearTimeout(safetyTimer);
      context.revert();
    };
  }, [visible]);

  const skipSplash = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="site-splash" ref={splashRef} role="status" aria-label="Welcome to WorkOut">
      <div className="splash-content">
        <p className="splash-title">WorkOut</p>
        <div className="splash-progress" aria-hidden="true"><span /></div>
      </div>
      <button className="splash-skip" type="button" onClick={skipSplash}>Skip intro</button>
    </div>
  );
}
