import { describe, it, expect } from "vitest";
import { siteConfig } from "../../src/config/site";
import { contactConfig } from "../../src/config/contact";

describe("T-04 Config y Esquemas de Contenido", () => {
  it("siteConfig expone las propiedades correctas", () => {
    expect(siteConfig.nombre).toBe("Tejones Banda");
    expect(siteConfig.url).toBeTypeOf("string");
    expect(siteConfig.correo).toBe("contacto@tejonesbanda.es");
    expect(siteConfig.locale).toBe("es_ES");
  });

  it("contactConfig expone los límites correctos", () => {
    expect(contactConfig.maxMensajeLength).toBe(1000);
    expect(contactConfig.destinatario).toBeTypeOf("string");
  });
});
