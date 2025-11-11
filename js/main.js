(() => {
  // ===== helpers =====
  function getUnitFromUrl() {
    const url = new URL(window.location.href);
    // intenta ?unit=GCM12
    let unit = url.searchParams.get("unit");

    // fallback: ¿vino como ?gcm12 sin nombre?
    if (!unit) {
      // ejemplo: index.html?gcm12
      const rawQuery = url.search.replace("?", "");
      if (rawQuery && !rawQuery.includes("=")) {
        unit = rawQuery;
      }
    }

    // fallback: sessionStorage
    if (!unit) {
      unit = sessionStorage.getItem("unidad_activa") || "gcm12";
    }

    return unit.toUpperCase();
  }

  function setUnitBranding(unit) {
    const logoEl = document.getElementById("unitLogo");
    const subtitleEl = document.getElementById("unitSubtitle");

    const lower = unit.toLowerCase();
    const cfg = window.APP_CONFIG.UNITS[unit] || {};

    if (logoEl) {
      logoEl.src = `assets/img/${cfg.logo || `logo_${lower}.png`}`;
      logoEl.alt = `Logo ${unit}`;
    }

    if (subtitleEl) {
      subtitleEl.textContent = cfg.title || unit;
    }
  }

  const unidad = getUnitFromUrl();
  sessionStorage.setItem("unidad_activa", unidad);
  setUnitBranding(unidad);

  // ===== lógica del formulario =====
  const ciInput = document.getElementById("ci");
  const form = document.getElementById("consultaForm");
  const btn = document.getElementById("btnConsultar");
  const msgError = document.getElementById("msgError");

  const isValidCI = (val) => /^\d{10}$/.test(val);

  ciInput.addEventListener("input", () => {
    ciInput.value = ciInput.value.replace(/\D/g, "").slice(0, 10);
    if (isValidCI(ciInput.value)) {
      btn.disabled = false;
      msgError.textContent = "";
      ciInput.setAttribute("aria-invalid", "false");
    } else {
      btn.disabled = true;
      msgError.textContent = "La cédula debe tener 10 dígitos.";
      ciInput.setAttribute("aria-invalid", "true");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ci = ciInput.value.trim();

    if (!isValidCI(ci)) {
      msgError.textContent = "La cédula debe tener 10 dígitos.";
      return;
    }

    btn.disabled = true;
    const prevTxt = btn.textContent;
    btn.textContent = "Consultando…";
    btn.classList.add("loading");

    try {
      // ahora el back espera /militar/:unit/:ci
      const url = `${window.APP_CONFIG.API_BASE_URL}/militar/${unidad}/${ci}`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (!resp.ok || !data?.success) {
        msgError.textContent = data?.message || "No se encontró información.";
        return;
      }

      sessionStorage.setItem("consulta_militar", JSON.stringify(data.data));
      sessionStorage.setItem("unidad_activa", unidad);

      // redirigimos pasando también la unidad
      window.location.href = `result.html?unit=${unidad.toLowerCase()}`;
    } catch (err) {
      console.error(err);
      msgError.textContent = "Error al conectar con el servidor.";
    } finally {
      btn.textContent = prevTxt;
      btn.classList.remove("loading");
      btn.disabled = !isValidCI(ciInput.value);
    }
  });
})();
