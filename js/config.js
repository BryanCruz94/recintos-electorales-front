// Config global. Cambia esto cuando despliegues.
window.APP_CONFIG = {
  API_BASE_URL: "https://recintos-electorales-back-production.up.railway.app",
  //API_BASE_URL: "http://localhost:3000",

  // Catálogo de unidades con sus títulos formales
  UNITS: {
    GCM12: {
      title: "GRUPO DE CABALLERÍA MECANIZADO N.º 12 TNTE HUGO ORTIZ",
      logo: "logo_gcm12.png",
    },
    IVDE: {
      title: 'BRIGADA DE SELVA N° 17 "PASTAZA"',
      logo: "logo_17bs.png",
    },
    // aquí puedes seguir agregando:
    // BRIG45: { title: "BRIGADA DE SELVA N.º 45", logo: "logo_brig45.png" }
    // UNIDAD PARA PRUEBAS
    PRUEBAS: {
      title: "UNIDAD DE PRUEBAS",
      logo: "pruebas.png",
    },
  },

  //VARIABLES DE INFORMACIÓN DEL APLICATIVO
  APP_INFO: {
    DEV: "TNTE Cruz B.",
    POWERED_BY: "CAPT Almachi J.",
    VERSION: "V1.3.3",
  }
};