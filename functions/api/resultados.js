export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB
      .prepare(`
        SELECT
          id,
          sitio,
          fecha,
          tipo_atractivo,
          comunidad,
          lat,
          lon,
          promedio,
          nivel,
          atractivo,
          accesibilidad,
          infraestructura,
          servicios,
          sostenibilidad,
          created_at
        FROM visitas
        ORDER BY promedio DESC, created_at DESC
      `)
      .all();

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const sitio = body.sitio || "";
    const fecha = body.fecha || "";
    const tipo_atractivo = body.tipo_atractivo || "";
    const comunidad = body.comunidad || "";

    const lat = body?.coordenadas?.lat ?? body?.lat ?? null;
    const lon = body?.coordenadas?.lon ?? body?.lon ?? null;

    const atractivo = Number(body?.atractivo ?? body?.evaluacion?.atractivo ?? 0);
    const accesibilidad = Number(body?.accesibilidad ?? body?.evaluacion?.accesibilidad ?? 0);
    const infraestructura = Number(body?.infraestructura ?? body?.evaluacion?.infraestructura ?? 0);
    const servicios = Number(body?.servicios ?? body?.evaluacion?.servicios ?? body?.evaluacion?.serv_visitante ?? 0);
    const sostenibilidad = Number(body?.sostenibilidad ?? body?.evaluacion?.sostenibilidad ?? 0);

    const valores = [
      atractivo,
      accesibilidad,
      infraestructura,
      servicios,
      sostenibilidad
    ].filter(v => !Number.isNaN(v));

    const promedio = body.promedio_evaluacion != null
      ? Number(body.promedio_evaluacion)
      : (valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0);

    const nivel = body.nivel_preliminar || (
      promedio >= 4 ? "Alto" :
      promedio >= 3 ? "Medio" :
      "Bajo"
    );

    await context.env.DB
      .prepare(`
        INSERT INTO visitas (
          sitio,
          fecha,
          tipo_atractivo,
          comunidad,
          lat,
          lon,
          promedio,
          nivel,
          atractivo,
          accesibilidad,
          infraestructura,
          servicios,
          sostenibilidad
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        sitio,
        fecha,
        tipo_atractivo,
        comunidad,
        lat,
        lon,
        promedio,
        nivel,
        atractivo,
        accesibilidad,
        infraestructura,
        servicios,
        sostenibilidad
      )
      .run();

    return new Response(
      JSON.stringify({ ok: true }),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }
}
