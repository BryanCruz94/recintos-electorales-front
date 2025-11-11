(() => {
  const ciInput   = document.getElementById("ci");
  const form      = document.getElementById("consultaForm");
  const btn       = document.getElementById("btnConsultar");
  const msgError  = document.getElementById("msgError");

  const isValidCI = (val) => /^\d{10}$/.test(val);

  // Solo dígitos y máximo 10
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

    // UI: loading
    btn.disabled = true;
    const prevTxt = btn.textContent;
    btn.textContent = "Consultando…";
    btn.classList.add("loading");

    try {
      const url = `${window.APP_CONFIG.API_BASE_URL}/militar/${ci}`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (!resp.ok || !data?.success) {
        msgError.textContent = data?.message || "No se encontró información.";
        return;
      }

      // Guardamos provisionalmente para la segunda pantalla (cuando la programemos)
      sessionStorage.setItem("consulta_militar", JSON.stringify(data.data));

      // TODO: cuando implementemos result.js, activamos el redirect:
      window.location.href = "result.html";
      //alert("Consulta exitosa. (La pantalla de resultados aún no está activa)");
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
