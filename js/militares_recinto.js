(() => {
    // ===== helpers reutilizados =====
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

    // ===== elementos de la vista =====
    const recintoTitle = document.getElementById("recintoTitle");
    const msgBox = document.getElementById("msgBox");
    const tbody = document.getElementById("militaresBody");
    const btnVolver = document.getElementById("btnVolver");

    // footer
    const devInfo = document.getElementById("devInfo");
    const poweredBy = document.getElementById("poweredBy");
    const appVersion = document.getElementById("appVersion");

    devInfo.textContent = window.APP_CONFIG.APP_INFO.DEV;
    poweredBy.textContent = window.APP_CONFIG.APP_INFO.POWERED_BY;
    appVersion.textContent = window.APP_CONFIG.APP_INFO.VERSION;

    // ===== obtener código de recinto =====
    const url = new URL(window.location.href);
    const codRecinto =
        url.searchParams.get("cod") ||
        sessionStorage.getItem("recinto_actual_cod") ||
        "";

    const nombreRecinto =
        sessionStorage.getItem("recinto_actual_nombre") ||
        "";

    if (recintoTitle) {
        recintoTitle.textContent =
            nombreRecinto || (codRecinto ? `Recinto ${codRecinto}` : "Militares del recinto");
    }

    async function cargarMilitares() {
        if (!codRecinto) {
            msgBox.textContent = "No se recibió el código del recinto.";
            return;
        }

        try {
            const apiUrl = `${window.APP_CONFIG.API_BASE_URL}/militares/${unidad}/recinto/${codRecinto}`;
            const resp = await fetch(apiUrl);
            const json = await resp.json();

            if (!resp.ok || !json.success) {
                msgBox.textContent = json.message || "No se pudo obtener la información.";
                return;
            }

            const lista = json.data || [];
            if (!lista.length) {
                msgBox.textContent = "No se encontraron militares asignados a este recinto.";
                return;
            }

            msgBox.textContent = `Total de militares asignados: ${lista.length}`;

            lista.forEach((m) => {
                const tr = document.createElement("tr");

                const tdDatos = document.createElement("td");
                const tdTel = document.createElement("td");
                tdTel.classList.add("cell-phone");

                const grado = (m.GRADO || "").toString().trim();
                const nombres = (m.APELLIDOS_Y_NOMBRES || "").toString().trim();
                const telefono = (
                    m.TELEFONO ||
                    m.TELÉFONO ||
                    ""
                ).toString().trim();

                tdDatos.textContent = `${grado ? grado + " " : ""}${nombres}`;

                if (telefono) {
                    const spanNumero = document.createElement("span");
                    spanNumero.textContent = telefono;

                    const linkLlamar = document.createElement("a");
                    // Quitamos espacios para el tel:
                    const telClean = telefono.replace(/\s+/g, "");
                    linkLlamar.href = `tel:${telClean}`;
                    linkLlamar.className = "btn btn-phone";
                    linkLlamar.title = `Llamar a ${telefono}`;

                    // Icono de teléfono sencillo (SVG)
                    linkLlamar.innerHTML = `
            <svg viewBox="0 0 24 24" class="icon-phone" aria-hidden="true">
              <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17.62 17.62 0 0 1 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.56 1 1 0 0 1-.25 1.01z"/>
            </svg>
          `;

                    tdTel.appendChild(spanNumero);
                    tdTel.appendChild(linkLlamar);
                } else {
                    tdTel.textContent = "-";
                }

                tr.appendChild(tdDatos);
                tr.appendChild(tdTel);
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            msgBox.textContent = "Error al conectar con el servidor.";
        }
    }

    cargarMilitares();

    // ===== botón volver =====
    if (btnVolver) {
        btnVolver.addEventListener("click", (e) => {
            e.preventDefault();
            const unidadLower = unidad.toLowerCase();
            window.location.href = `result.html?unit=${unidadLower}`;
        });
    }
    
})();
