(() => {
  function getUnitFromUrl() {
    const url = new URL(window.location.href);
    let unit = url.searchParams.get("unit");

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

  // ===== lo que ya tenías =====
  const raw = sessionStorage.getItem("consulta_militar");
  const headerBox = document.getElementById("resultHeader");
  const missionBox = document.getElementById("missionBox");
  const missionValue = document.getElementById("missionValue");
  const tableBox = document.getElementById("tableBox");

  const vProvincia = document.getElementById("vProvincia");
  const vCanton = document.getElementById("vCanton");
  const vParroquia = document.getElementById("vParroquia");
  const vRecinto = document.getElementById("vRecinto");
  const vDireccion = document.getElementById("vDireccion");

  const btnMaps = document.getElementById("btnMaps");
  const modal = document.getElementById("mapsModal");
  const modalDir = document.getElementById("modalDir");
  const btnModalCancel = document.getElementById("btnModalCancel");
  const btnModalOk = document.getElementById("btnModalOk");

  let currentMapsQuery = "";

  if (!raw) {
    headerBox.innerHTML = `
      <div class="result-title">Sin datos para mostrar</div>
      <p class="muted">Realiza una consulta primero.</p>
    `;
    // volver a la misma unidad
    setTimeout(() => (window.location.href = `index.html?unit=${unidad.toLowerCase()}`), 1500);
    return;
  }

  const data = JSON.parse(raw);

  const grado = (data.GRADO || "").toString().trim();
  const nombres = (data.APELLIDOS_Y_NOMBRES || "").toString().trim();

  headerBox.innerHTML = `
    <div class="result-title">${grado ? `${grado} ` : ""}${nombres}</div>
  `;

  const mision = (data.MISION || "").toString().trim();
  if (mision && mision.toLowerCase() !== "recinto electoral") {
    missionValue.textContent = mision;
    missionBox.hidden = false;
    tableBox.hidden = true;
  } else {
    const provincia = data.PROVINCIA || "";
    const canton = data.CANTON || data.CANTÓN || "";
    const parroquia = data.PARROQUIA || "";
    const recinto = data.NOMBRE_RECINTO || "";
    const direccion = data.DIRECCION || data.DIRECCIÓN || "";

    vProvincia.textContent = provincia;
    vCanton.textContent = canton;
    vParroquia.textContent = parroquia;
    vRecinto.textContent = recinto;
    vDireccion.textContent = direccion;

    tableBox.hidden = false;
    missionBox.hidden = true;

    const partes = [recinto, direccion, canton, provincia].filter(Boolean);
    currentMapsQuery = partes.join(", ");

    if (btnMaps) {
      btnMaps.addEventListener("click", () => {
        if (!currentMapsQuery) return;
        if (modal) {
          modal.hidden = false;
          modalDir.textContent = currentMapsQuery;
        }
      });
    }
  }

  if (btnModalCancel && modal) {
    btnModalCancel.addEventListener("click", () => {
      modal.hidden = true;
    });
  }

  if (btnModalOk && modal) {
    btnModalOk.addEventListener("click", () => {
      if (!currentMapsQuery) {
        modal.hidden = true;
        return;
      }
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentMapsQuery)}`;
      window.open(url, "_blank");
      modal.hidden = true;
    });
  }
})();

// Botón "Nueva consulta"
const btnNueva = document.getElementById("btnNuevaConsulta");
if (btnNueva) {
  btnNueva.addEventListener("click", (e) => {
    e.preventDefault();
    const unidad = sessionStorage.getItem("unidad_activa") || "gcm12";
    window.location.href = `index.html?unit=${unidad.toLowerCase()}`;
  });
}

