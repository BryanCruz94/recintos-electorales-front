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

  const unidadUrl = getUnitFromUrl();
  const raw = sessionStorage.getItem("consulta_militar");
  const headerBox = document.getElementById("resultHeader");
  const missionBox = document.getElementById("missionBox");
  const missionValue = document.getElementById("missionValue");
  const tableBox = document.getElementById("tableBox");
  const jefeCantonBox = document.getElementById("jefeCantonBox");
  const jefeCantonTitle = document.getElementById("jefeCantonTitle");
  const jefeCantonMessage = document.getElementById("jefeCantonMessage");
  const jefeCantonList = document.getElementById("jefeCantonList");

  const vProvincia = document.getElementById("vProvincia");
  const vCanton = document.getElementById("vCanton");
  const vParroquia = document.getElementById("vParroquia");
  const vRecinto = document.getElementById("vRecinto");
  const vDireccion = document.getElementById("vDireccion");
  const vTelefono = document.getElementById("vTelefono");
  const labelTelefono = document.getElementById("labelTelefono");

  // NUEVOS elementos de Orden de Operaciones
  const lblOrden = document.getElementById("lblOrdenOperaciones");
  const btnOrden = document.getElementById("btnOrdenOperaciones");

  const btnMaps = document.getElementById("btnMaps");
  const modal = document.getElementById("mapsModal");
  const modalDir = document.getElementById("modalDir");
  const btnModalCancel = document.getElementById("btnModalCancel");
  const btnModalOk = document.getElementById("btnModalOk");

  let currentMapsQuery = "";

  let consulta;
  try {
    consulta = raw ? JSON.parse(raw) : null;
  } catch {
    consulta = null;
  }

  const unidadConsulta = consulta?.unit?.toString().trim().toUpperCase();
  if (!consulta?.data || !unidadConsulta || unidadConsulta !== unidadUrl) {
    const unidad = unidadConsulta || unidadUrl;
    sessionStorage.removeItem("consulta_militar");
    sessionStorage.setItem("unidad_activa", unidad);
    setUnitBranding(unidad);
    headerBox.innerHTML = `
      <div class="result-title">Sin datos para mostrar</div>
      <p class="muted">La consulta no corresponde a esta unidad. Realiza una nueva búsqueda.</p>
    `;
    setTimeout(() => (window.location.href = `index.html?unit=${unidad.toLowerCase()}`), 1500);
    return;
  }

  const unidad = unidadConsulta;
  sessionStorage.setItem("unidad_activa", unidad);
  setUnitBranding(unidad);
  const data = consulta.data;

  const grado = (data.GRADO || "").toString().trim();
  const nombres = (data.APELLIDOS_Y_NOMBRES || "").toString().trim();

  headerBox.innerHTML = `
    <div class="result-title">${grado ? `${grado} ` : ""}${nombres}</div>
  `;

  const mision = (data.MISION || "").toString().trim();
  const esJefeCanton = /^JEFE\s+DE\s+CANT[ÓO]N\b/i.test(mision);
  if (esJefeCanton) {
    missionBox.hidden = true;
    tableBox.hidden = true;
    jefeCantonBox.hidden = false;
    jefeCantonTitle.textContent = `Recintos del cantón ${mision.replace(/^JEFE\s+DE\s+CANT[ÓO]N\s*/i, "")}`;
    cargarRecintosJefeCanton(data.CI);
  }
  if (!esJefeCanton && mision && mision.toLowerCase() !== "recinto electoral") {
    missionValue.textContent = mision;
    missionBox.hidden = false;
    tableBox.hidden = true;
  } else if (!esJefeCanton) {
    console.log("telefono: " + data.TELÉFONO);
    console.log("tipo: " + typeof (data.TELÉFONO));

    if (data.TELÉFONO === "") {
      vTelefono.hidden = true;
      labelTelefono.hidden = true;
    } else {
      vTelefono.hidden = false;
      labelTelefono.hidden = false;
    }

    const provincia = data.PROVINCIA || "";
    const canton = data.CANTON || data.CANTÓN || "";
    const parroquia = data.PARROQUIA || "";
    const recinto = data.NOMBRE_RECINTO || "";
    const direccion = data.DIRECCION || data.DIRECCIÓN || "";
    const telefono = data.TELEFONO || data.TELÉFONO || "";
    const codRecinto = (data.COD_RECINTO || "").toString().trim();


    vProvincia.textContent = provincia;
    vCanton.textContent = canton;
    vParroquia.textContent = parroquia;
    vRecinto.textContent = recinto;
    vDireccion.textContent = direccion;
    vTelefono.textContent = telefono;

    // ==== botón "ver militares del recinto" ====
    const btnVerMilitares = document.getElementById("btnVerMilitares");
    if (btnVerMilitares && codRecinto) {
      btnVerMilitares.disabled = false;
      btnVerMilitares.addEventListener("click", () => {
        // guardamos datos del recinto para la otra pantalla
        sessionStorage.setItem("recinto_actual_cod", codRecinto);
        sessionStorage.setItem("recinto_actual_nombre", recinto);

        const unidadLower = unidad.toLowerCase();

        window.location.href = `militares_recinto.html?unit=${unidadLower}&cod=${encodeURIComponent(
          codRecinto
        )}`;
      });
    }

    // ==== ORDEN DE OPERACIONES (mostrar botón solo si existe) ====
    const orden = (data.ORDEN_OPERACIONES || "").toString().trim();

    if (orden) {
      lblOrden.hidden = false;
      btnOrden.parentElement.hidden = false;
      btnOrden.onclick = () => {
        window.open(orden, "_blank");
      };
    } else {
      lblOrden.hidden = true;
      btnOrden.parentElement.hidden = true;
    }

    tableBox.hidden = false;
    missionBox.hidden = true;

    const longitud = (data.LONG || "").toString().trim().replace(",", ".");
    const latitud = (data.LAT || "").toString().trim().replace(",", ".");
    const coordenadasValidas = longitud && latitud &&
      Number.isFinite(Number(longitud)) && Number.isFinite(Number(latitud)) &&
      Number(longitud) >= -180 && Number(longitud) <= 180 &&
      Number(latitud) >= -90 && Number(latitud) <= 90;
    if (coordenadasValidas) {
      currentMapsQuery = `${latitud},${longitud}`;
    } else {
      const partes = [recinto, direccion, canton, provincia].filter(Boolean);
      currentMapsQuery = partes.join(", ");
    }

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

  async function cargarRecintosJefeCanton(ci) {
    if (!ci) {
      jefeCantonMessage.textContent = "No se encontró la cédula para cargar los recintos.";
      return;
    }
    try {
      const url = `${window.APP_CONFIG.API_BASE_URL}/jefe-canton/${unidad}/${encodeURIComponent(ci)}/recintos`;
      const response = await fetch(url);
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "No se pudieron cargar los recintos.");
      const recintos = json.RECINTOS || [];
      jefeCantonTitle.textContent = `Recintos del cantón ${json.CANTON}`;
      jefeCantonMessage.textContent = recintos.length
        ? `${recintos.length} recinto${recintos.length === 1 ? "" : "s"} encontrado${recintos.length === 1 ? "" : "s"}. Selecciona uno para ver sus integrantes.`
        : "No hay recintos registrados para este cantón.";
      recintos.forEach((recinto) => {
        const details = document.createElement("details");
        details.className = "canton-recinto";
        const summary = document.createElement("summary");
        summary.textContent = recinto.NOMBRE_RECINTO || "Recinto sin nombre";
        details.appendChild(summary);

        const direccion = document.createElement("p");
        direccion.className = "muted recinto-direccion";
        direccion.textContent = recinto.DIRECCION || "Sin dirección registrada";
        details.appendChild(direccion);

        const miembros = document.createElement("ul");
        miembros.className = "integrantes-list";
        (recinto.INTEGRANTES || []).forEach((integrante) => {
          const li = document.createElement("li");
          const nombre = document.createElement("span");
          nombre.textContent = `${integrante.GRADO ? `${integrante.GRADO} ` : ""}${integrante.APELLIDOS_Y_NOMBRES || "Sin nombre"}`;
          li.appendChild(nombre);
          if (integrante.TELEFONO) {
            const tel = document.createElement("a");
            tel.className = "integrante-telefono";
            tel.href = `tel:${integrante.TELEFONO.toString().replace(/\s+/g, "")}`;
            tel.textContent = integrante.TELEFONO;
            li.appendChild(tel);
          }
          miembros.appendChild(li);
        });
        details.appendChild(miembros);

        const long = (recinto.LONG || "").toString().trim().replace(",", ".");
        const lat = (recinto.LAT || "").toString().trim().replace(",", ".");
        const coordsValidas = long && lat && Number.isFinite(Number(long)) && Number.isFinite(Number(lat)) &&
          Number(long) >= -180 && Number(long) <= 180 && Number(lat) >= -90 && Number(lat) <= 90;
        const destino = coordsValidas ? `${lat},${long}` :
          [recinto.NOMBRE_RECINTO, recinto.DIRECCION, recinto.CANTON, recinto.PROVINCIA].filter(Boolean).join(", ");
        if (destino) {
          const maps = document.createElement("a");
          maps.className = "btn btn-map recinto-maps";
          maps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destino)}`;
          maps.target = "_blank";
          maps.rel = "noopener noreferrer";
          maps.innerHTML = `<svg class="icon-map" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.962 2 6.5 4.462 6.5 7.5c0 4.004 4.39 8.82 5.66 10.12a.5.5 0 0 0 .72 0c1.27-1.3 5.62-6.116 5.62-10.12C18.5 4.462 16.038 2 13 2h-1Zm0 6.75a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z"/></svg><span>Navegar con Google Maps</span>`;
          details.appendChild(maps);
        }
        jefeCantonList.appendChild(details);
      });
    } catch (error) {
      jefeCantonMessage.textContent = error.message || "Error al cargar los recintos.";
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

  // ===== footer =====
  const devInfo = document.getElementById("devInfo");
  const poweredBy = document.getElementById("poweredBy");
  const appVersion = document.getElementById("appVersion");

  devInfo.textContent = window.APP_CONFIG.APP_INFO.DEV;
  poweredBy.textContent = window.APP_CONFIG.APP_INFO.POWERED_BY;
  appVersion.textContent = window.APP_CONFIG.APP_INFO.VERSION;
}
