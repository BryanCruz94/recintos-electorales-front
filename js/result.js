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
    vProvincia.textContent = data.PROVINCIA || "";
    vCanton.textContent = data.CANTON || data.CANTÓN || ""; // por si viene con tilde
    vParroquia.textContent = data.PARROQUIA || "";
    vRecinto.textContent = data.NOMBRE_RECINTO || "";
    vDireccion.textContent = data.DIRECCION || data.DIRECCIÓN || "";

    tableBox.hidden = false;
    missionBox.hidden = true;
  }
})();
