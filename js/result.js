(() => {
  // Recuperar datos guardados desde la pantalla 1
  const raw = sessionStorage.getItem("consulta_militar");
  const headerBox = document.getElementById("resultHeader");
  const missionBox = document.getElementById("missionBox");
  const missionValue = document.getElementById("missionValue");
  const tableBox = document.getElementById("tableBox");

  // Valores
  const vProvincia = document.getElementById("vProvincia");
  const vCanton = document.getElementById("vCanton");
  const vParroquia = document.getElementById("vParroquia");
  const vRecinto = document.getElementById("vRecinto");
  const vDireccion = document.getElementById("vDireccion");
  const btnMaps = document.getElementById("btnMaps");

  // Modal
  const modal = document.getElementById("mapsModal");
  const modalDir = document.getElementById("modalDir");
  const btnModalCancel = document.getElementById("btnModalCancel");
  const btnModalOk = document.getElementById("btnModalOk");

  // variable donde guardaremos lo que vamos a mandar a Maps
  let currentMapsQuery = "";

  if (!raw) {
    // Si entran directo sin consultar, redirigimos
    headerBox.innerHTML = `
      <div class="result-title">Sin datos para mostrar</div>
      <p class="muted">Realiza una consulta primero.</p>
    `;
    setTimeout(() => (window.location.href = "index.html"), 1500);
    return;
  }

  const data = JSON.parse(raw);

  // Encabezado: GRADO + APELLIDOS_Y_NOMBRES
  const grado = (data.GRADO || "").toString().trim();
  const nombres = (data.APELLIDOS_Y_NOMBRES || "").toString().trim();

  headerBox.innerHTML = `
    <div class="result-title">${grado ? `${grado} ` : ""}${nombres}</div>
  `;

  // Lógica de misión
  const mision = (data.MISION || "").toString().trim();
  if (mision && mision.toLowerCase() !== "recinto electoral") {
    // Mostrar solo el aviso de misión
    missionValue.textContent = mision;
    missionBox.hidden = false;
    tableBox.hidden = true;
  } else {
    // Misión Recinto Electoral: mostramos tabla
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

    // Armamos el texto para Maps
    const partes = [recinto, direccion, canton, provincia].filter(Boolean);
    const queryMaps = partes.join(", ");
    currentMapsQuery = queryMaps;

    if (btnMaps) {
      btnMaps.addEventListener("click", () => {
        if (!currentMapsQuery) return;
        // Mostrar modal
        if (modal) {
          modal.hidden = false;
          if (modalDir) {
            modalDir.textContent = currentMapsQuery;
          }
        }
      });
    }
  }

  // Eventos del modal
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
      // Abrimos en una pestaña nueva / intenta abrir la app
      window.open(url, "_blank");
      modal.hidden = true;
    });
  }
})();
