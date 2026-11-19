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

                    // Ambos accesos usan el mismo número guardado para el militar.
                    const numeroCelular = telefono.replace(/\D/g, "");
                    const linkLlamar = document.createElement("a");
                    linkLlamar.href = `tel:${numeroCelular}`;
                    linkLlamar.className = "btn btn-phone";
                    linkLlamar.title = `Llamar a ${telefono}`;
                    linkLlamar.setAttribute("aria-label", `Llamar a ${telefono}`);

                    // Icono de teléfono sencillo (SVG)
                    linkLlamar.innerHTML = `
            <svg viewBox="0 0 24 24" class="icon-phone" aria-hidden="true">
              <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17.62 17.62 0 0 1 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.56 1 1 0 0 1-.25 1.01z"/>
            </svg>
          `;

                    const acciones = document.createElement("div");
                    acciones.className = "phone-actions";
                    acciones.appendChild(linkLlamar);

                    const whatsappNumero = numeroCelular.startsWith("593")
                        ? numeroCelular
                        : numeroCelular.startsWith("0")
                            ? `593${numeroCelular.slice(1)}`
                            : `593${numeroCelular}`;
                    const linkWhatsapp = document.createElement("a");
                    linkWhatsapp.href = `https://wa.me/${whatsappNumero}`;
                    linkWhatsapp.className = "btn btn-whatsapp";
                    linkWhatsapp.target = "_blank";
                    linkWhatsapp.rel = "noopener noreferrer";
                    linkWhatsapp.title = `Enviar mensaje por WhatsApp a ${telefono}`;
                    linkWhatsapp.setAttribute("aria-label", `Enviar mensaje por WhatsApp a ${telefono}`);
                    linkWhatsapp.innerHTML = `
                      <svg viewBox="0 0 24 24" class="icon-whatsapp" aria-hidden="true" focusable="false">
                        <path d="M12.04 2a9.82 9.82 0 0 0-8.43 14.86L2.3 22l5.28-1.38A9.82 9.82 0 1 0 12.04 2Zm0 17.85a8 8 0 0 1-4.08-1.12l-.29-.17-3.13.82.84-3.05-.19-.31a8.02 8.02 0 1 1 6.85 3.83Zm4.4-6c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.15 1.52.09.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"/>
                      </svg><span class="sr-only">WP</span>`;

                    tdTel.appendChild(spanNumero);
                    tdTel.appendChild(acciones);
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
