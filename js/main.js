(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const settings = window.SiteSettings || {};

  function icon(name) {
    return `<i data-lucide="${name}"></i>`;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function brandHTML(name) {
    const words = String(name).trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    const accent = words.length > 1 ? words.pop() : "";
    const main = words.join(" ") || accent;
    const mainPart = `<span class="brand-word brand-word-main">${escapeHTML(main)}</span>`;
    const accentPart = accent && main !== accent ? `<span class="brand-word brand-word-accent">${escapeHTML(accent)}</span>` : "";
    return mainPart + accentPart;
  }

  function logoSVG() {
    return `
      <svg class="brand-logo" viewBox="0 0 64 64" role="img" aria-hidden="true" focusable="false">
        <path class="logo-shield" d="M32 5 55 15v16c0 14.8-9.4 22.8-23 28C18.4 53.8 9 45.8 9 31V15L32 5Z"/>
        <path class="logo-roof" d="M17 31 32 18l15 13"/>
        <path class="logo-house" d="M22 31v13h20V31"/>
        <path class="logo-bridge" d="M21 44c5.3-7.2 16.7-7.2 22 0"/>
        <path class="logo-base" d="M18 48h28"/>
      </svg>
    `;
  }

  function initConfigContent() {
    const companyName = settings.companyName || "RoofBridge Connect";
    const phoneHref = settings.phoneHref || "tel:+15551234567";
    const phoneDisplay = settings.phoneDisplay || "(555) 123-4567";
    const phoneButtonLabel = settings.phoneButtonLabel || phoneDisplay;
    const email = settings.email || "support@example.com";
    const whatsappHref = settings.whatsappHref || "https://wa.me/15551234567";
    const hours = Array.isArray(settings.businessHours) ? settings.businessHours : [];

    qsa(".brand").forEach((link) => {
      link.setAttribute("aria-label", `${companyName} home`);
    });

    qsa(".brand-mark").forEach((node) => {
      node.innerHTML = logoSVG();
    });

    qsa(".brand > span:last-child").forEach((node) => {
      node.classList.add("brand-name");
      node.innerHTML = brandHTML(companyName);
    });

    qsa('a[href^="tel:"]').forEach((link) => {
      link.href = phoneHref;
      if (link.classList.contains("mobile-phone")) return;
      if (link.classList.contains("floating-cta")) {
        link.innerHTML = `${icon("phone")} ${settings.mobilePhoneButtonLabel || "Get Quote"}`;
      } else if (link.classList.contains("desktop-cta") || link.classList.contains("btn-ghost")) {
        link.innerHTML = `${icon("phone")} <span>${phoneButtonLabel}</span>`;
      } else {
        link.textContent = phoneDisplay;
      }
    });

    qsa('a[href^="mailto:"]').forEach((link) => {
      link.href = `mailto:${email}`;
      link.textContent = email;
    });

    qsa('a[href*="wa.me"]').forEach((link) => {
      link.href = whatsappHref;
    });

    qsa(".footer-col:first-child p").forEach((node) => {
      if (settings.footer?.shortDescription) node.textContent = settings.footer.shortDescription;
    });

    qsa(".footer-col").forEach((col) => {
      const heading = qs("h2", col);
      if (!heading || heading.textContent.trim() !== "Contact" || !hours.length) return;
      const paragraphs = qsa("p", col);
      const hoursParagraph = paragraphs.find((p) => p.textContent.includes("Monday-Friday"));
      if (hoursParagraph) hoursParagraph.innerHTML = hours.join("<br>");
    });

    qsa(".footer-bottom").forEach((node) => {
      const meta = document.createElement("p");
      meta.className = "footer-company-meta";
      meta.textContent = `${companyName} · ${settings.address || "United States"} · ID: ${settings.companyId || "N/A"}`;
      node.before(meta);
      node.textContent = settings.legal?.disclaimer || node.textContent;
    });
  }

  function initServicesDropdown() {
    const menu = settings.servicesMenu || [];
    if (!menu.length) return;
    const current = window.location.pathname.split("/").pop() || "index.html";

    qsa(".desktop-nav").forEach((nav) => {
      const servicesLink = qsa("a", nav).find((link) => link.getAttribute("href") === "services.html");
      if (!servicesLink || qs(".nav-dropdown", nav)) return;
      const serviceHrefs = new Set(menu.map((item) => item.href));
      qsa("a", nav).forEach((link) => {
        const href = link.getAttribute("href");
        if (href !== "services.html" && serviceHrefs.has(href)) link.remove();
      });
      const dropdown = document.createElement("div");
      dropdown.className = `nav-dropdown ${menu.some((item) => item.href === current) ? "is-active" : ""}`;
      dropdown.innerHTML = `
        <button class="nav-dropdown-toggle" type="button" aria-expanded="false">
          Services ${icon("chevron-down")}
        </button>
        <div class="nav-dropdown-menu" role="menu">
          ${menu.map((item) => `
            <a href="${item.href}" role="menuitem" ${item.href === current ? 'aria-current="page"' : ""}>
              <strong>${item.label}</strong>
              <span>${item.description}</span>
            </a>
          `).join("")}
        </div>
      `;
      servicesLink.replaceWith(dropdown);
      const toggle = qs(".nav-dropdown-toggle", dropdown);
      dropdown.addEventListener("mouseenter", () => toggle.setAttribute("aria-expanded", "true"));
      dropdown.addEventListener("mouseleave", () => toggle.setAttribute("aria-expanded", "false"));
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
      });
      dropdown.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });
    });

    qsa(".mobile-panel nav").forEach((nav) => {
      const servicesLink = qsa("a", nav).find((link) => link.getAttribute("href") === "services.html");
      if (!servicesLink || qs(".mobile-services", nav)) return;
      const serviceHrefs = new Set(menu.map((item) => item.href));
      qsa("a", nav).forEach((link) => {
        const href = link.getAttribute("href");
        if (href !== "services.html" && serviceHrefs.has(href)) link.remove();
      });
      const details = document.createElement("details");
      details.className = `mobile-services ${menu.some((item) => item.href === current) ? "is-active" : ""}`;
      details.open = ["services.html", "service-roof-repair.html", "service-roof-replacement.html", "service-roof-installation.html"].includes(current);
      details.innerHTML = `
        <summary>Services ${icon("chevron-down")}</summary>
        <div class="mobile-services-list">
          ${menu.map((item) => `<a href="${item.href}" ${item.href === current ? 'aria-current="page"' : ""}>${item.label}</a>`).join("")}
        </div>
      `;
      servicesLink.replaceWith(details);
    });
  }

  function initIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function initSmoothScroll() {
    if (prefersReduced || !window.Lenis) return;
    const lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  function initHeader() {
    const header = qs(".site-header");
    const floatingCta = qs(".floating-cta");
    if (!header) return;

    const update = () => {
      const scrolled = window.scrollY > 40;
      header.classList.toggle("is-scrolled", scrolled);
      if (floatingCta) floatingCta.classList.toggle("is-visible", window.scrollY > 250);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initMobileMenu() {
    const toggle = qs("[data-menu-toggle]");
    const panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) return;

    const links = qsa("a", panel);
    const setOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      panel.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
      initIcons();
      if (open) links[0]?.focus();
    };

    toggle.addEventListener("click", () => setOpen(!panel.classList.contains("is-open")));
    links.forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel.classList.contains("is-open")) setOpen(false);
    });
  }

  function initActiveNav() {
    const current = window.location.pathname.split("/").pop() || "index.html";
    qsa("[data-nav-link]").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === current) link.setAttribute("aria-current", "page");
    });
  }

  function initFaqs() {
    qsa("[data-faq]").forEach((item, index) => {
      const button = qs(".faq-button", item);
      const panel = qs(".faq-panel", item);
      if (!button || !panel) return;
      const id = panel.id || `faq-panel-${index}`;
      panel.id = id;
      button.setAttribute("aria-controls", id);
      button.setAttribute("aria-expanded", "false");
      button.addEventListener("click", () => {
        const isOpen = item.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
      });
    });
  }

  function initForms() {
    const mobileFormQuery = window.matchMedia("(max-width: 860px)");

    qsa("[data-lead-form]").forEach((form) => {
      const success = qs(".form-success", form);
      const grid = qs(".form-grid", form);
      const fieldWraps = qsa(".field", form);
      const submitWrap = qsa(".full", form).find((wrap) => qs('button[type="submit"]', wrap));
      let activeOverride = null;
      let progress = qs(".form-progress", form);

      if (grid && !progress) {
        progress = document.createElement("div");
        progress.className = "form-progress";
        progress.setAttribute("aria-label", "Completed form fields");
        grid.before(progress);
      }

      const setError = (field, message) => {
        const wrap = field.closest(".field");
        const error = wrap ? qs(".error", wrap) : null;
        field.setAttribute("aria-invalid", message ? "true" : "false");
        if (error) error.textContent = message;
      };

      const validateField = (field) => {
        const value = field.value.trim();
        let message = "";

        if (field.hasAttribute("required") && !value) {
          message = "This field is required.";
        } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          message = "Enter a valid email address.";
        } else if (field.name === "phone" && value && !/^[\d\s()+.-]{7,}$/.test(value)) {
          message = "Enter a valid phone number.";
        } else if (field.name === "zip" && value && !/^\d{5}(?:-\d{4})?$/.test(value)) {
          message = "Enter a valid ZIP code.";
        }

        setError(field, message);
        return !message;
      };

      const fields = qsa("input, select, textarea", form);
      const fieldIsReady = (field) => {
        const value = field.value.trim();
        if (field.hasAttribute("required") && !value) return false;
        if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
        if (field.name === "phone" && value && !/^[\d\s()+.-]{7,}$/.test(value)) return false;
        if (field.name === "zip" && value && !/^\d{5}(?:-\d{4})?$/.test(value)) return false;
        return true;
      };

      const fieldLabel = (field) => {
        const label = field.id ? qs(`label[for="${field.id}"]`, form) : null;
        return label?.textContent.trim() || field.name || "Field";
      };

      const fieldSummaryValue = (field) => {
        if (field.tagName === "SELECT") {
          return field.options[field.selectedIndex]?.textContent.trim() || field.value.trim();
        }
        return field.value.trim();
      };

      const allRequiredReady = () => fields
        .filter((field) => field.hasAttribute("required"))
        .every(fieldIsReady);

      const updateProgressiveForm = () => {
        if (!grid || !progress || !submitWrap) return;

        if (!mobileFormQuery.matches) {
          form.classList.remove("is-progressive");
          fieldWraps.forEach((wrap) => {
            wrap.classList.remove("is-current", "is-complete", "is-locked");
            wrap.hidden = false;
          });
          submitWrap.hidden = false;
          progress.hidden = true;
          progress.innerHTML = "";
          return;
        }

        form.classList.add("is-progressive");
        progress.hidden = false;

        const requiredReady = allRequiredReady();
        let activeIndex = activeOverride;
        if (activeIndex === null) {
          activeIndex = fieldWraps.findIndex((wrap) => {
            const field = qs("input, select, textarea", wrap);
            return field?.hasAttribute("required") && !fieldIsReady(field);
          });
          if (activeIndex === -1) {
            activeIndex = fieldWraps.findIndex((wrap) => {
              const field = qs("input, select, textarea", wrap);
              return field && !field.hasAttribute("required") && !field.value.trim();
            });
          }
        }
        if (activeIndex === -1) activeIndex = null;

        const summaryItems = [];
        fieldWraps.forEach((wrap, index) => {
          const field = qs("input, select, textarea", wrap);
          const complete = field ? fieldIsReady(field) && Boolean(field.value.trim()) : false;
          const current = index === activeIndex;

          wrap.hidden = !current;
          wrap.classList.toggle("is-current", current);
          wrap.classList.toggle("is-complete", complete);
          wrap.classList.toggle("is-locked", complete && !current);

          if (field && complete && !current) {
            summaryItems.push(`
              <button class="form-progress-item" type="button" data-progress-index="${index}">
                <span>${fieldLabel(field)}</span>
                <strong>${fieldSummaryValue(field)}</strong>
              </button>
            `);
          }
        });

        progress.innerHTML = summaryItems.join("");
        qsa("[data-progress-index]", progress).forEach((button) => {
          button.addEventListener("click", () => {
            activeOverride = Number(button.dataset.progressIndex);
            updateProgressiveForm();
            const field = qs("input, select, textarea", fieldWraps[activeOverride]);
            field?.focus();
          });
        });

        submitWrap.hidden = !requiredReady;
      };

      fields.forEach((field) => {
        field.addEventListener("blur", () => {
          validateField(field);
          updateProgressiveForm();
        });
        field.addEventListener("input", () => {
          if (field.getAttribute("aria-invalid") === "true") validateField(field);
          const index = fieldWraps.findIndex((wrap) => wrap.contains(field));
          if (activeOverride === index && fieldIsReady(field)) activeOverride = null;
          updateProgressiveForm();
        });
        field.addEventListener("change", () => {
          const index = fieldWraps.findIndex((wrap) => wrap.contains(field));
          if (activeOverride === index && fieldIsReady(field)) activeOverride = null;
          updateProgressiveForm();
        });
      });

      mobileFormQuery.addEventListener?.("change", updateProgressiveForm);
      updateProgressiveForm();

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const valid = fields.map(validateField).every(Boolean);
        if (!valid) {
          const firstInvalid = qs('[aria-invalid="true"]', form);
          firstInvalid?.focus();
          return;
        }
        form.reset();
        activeOverride = null;
        fields.forEach((field) => setError(field, ""));
        updateProgressiveForm();
        success?.classList.add("is-visible");
        success?.focus?.();
      });
    });
  }

  function initGallery() {
    const lightbox = qs("[data-lightbox]");
    if (!lightbox) return;
    const image = qs("img", lightbox);
    const caption = qs("figcaption", lightbox);
    const close = qs("[data-lightbox-close]", lightbox);

    const escapeHtml = (value) => String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

    const open = (trigger) => {
      const img = qs("img", trigger);
      if (!img || !image || !caption) return;
      image.src = img.currentSrc || img.src;
      image.alt = img.alt;
      const title = trigger.dataset.caption || img.alt;
      const description = trigger.dataset.description || "Images are illustrative examples and do not imply RoofBridge Connect completed the project.";
      const points = (trigger.dataset.points || "")
        .split("|")
        .map((point) => point.trim())
        .filter(Boolean);

      caption.innerHTML = `
        <div class="lightbox-copy">
          <span class="lightbox-kicker">Example situation</span>
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(description)}</span>
          ${points.length ? `
            <ul>
              ${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
            </ul>
          ` : ""}
          <small>Illustrative example only. Providers are independent, and service availability may vary by location.</small>
        </div>
      `;
      lightbox.classList.add("is-open");
      close?.focus();
    };

    const closeLightbox = () => lightbox.classList.remove("is-open");

    qsa("[data-gallery-item]").forEach((item) => item.addEventListener("click", () => open(item)));
    close?.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLightbox();
    });
  }

  function initScrollReveal() {
    if (prefersReduced || !window.gsap || !window.ScrollTrigger) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    qsa("[data-reveal]").forEach((element) => {
      window.gsap.fromTo(
        element,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 86%" },
        }
      );
    });
    qsa(".trust-card").forEach((card, index) => {
      window.gsap.fromTo(
        card,
        { y: 18, opacity: 0, scale: 0.985 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.55,
          delay: (index % 3) * 0.07,
          ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 88%" },
        }
      );
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initConfigContent();
    initServicesDropdown();
    initIcons();
    initSmoothScroll();
    initHeader();
    initMobileMenu();
    initActiveNav();
    initFaqs();
    initForms();
    initGallery();
    initScrollReveal();
  });
})();
