export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB
      .prepare("SELECT * FROM visitas ORDER BY promedio DESC, created_at DESC")
      .all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({error: e.message}), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    await context.env.DB.prepare(`
      INSERT INTO visitas (sitio, fecha, tipo_atractivo, comunidad, lat, lon, promedio, nivel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.sitio,
      body.fecha,
      body.tipo_atractivo,
      body.comunidad,
      body.coordenadas?.lat ?? null,
      body.coordenadas?.lon ?? null,
      body.promedio_evaluacion ?? 0,
      body.nivel_preliminar ?? "Medio"
    ).run();

    return new Response(JSON.stringify({ok:true}));
  } catch (e) {
    return new Response(JSON.stringify({error:e.message}), { status:500 });
  }
}
