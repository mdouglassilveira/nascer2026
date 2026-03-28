import pg from 'pg'
const { Client } = pg

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const client = new Client({
  connectionString: 'postgresql://postgres.ghukwnsmuimbejpevahk:jcqbyvRsaaEOONN1@aws-1-sa-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

async function run() {
  await client.connect()
  console.log('Connected!')

  // 1. CREATE EDITION 2026
  const edRes = await client.query(`
    INSERT INTO public.editions (year, name, active, enrollment_open, start_date, end_date)
    VALUES (2026, 'Programa Nascer 2026', true, false, '2026-07-21', '2026-10-06')
    ON CONFLICT (year) DO UPDATE SET active = true
    RETURNING id
  `)
  const editionId = edRes.rows[0].id
  console.log('Edition 2026 ID:', editionId)

  // 2. INSERT CENTERS
  const centers = [
    { name: 'CIB', city: 'Blumenau', address: 'Rua São Paulo, 3366 - Victor Konder' },
    { name: 'Inova em Brusque', city: 'Brusque', address: 'Rua Dorval Luz, 123 - Santa Terezinha' },
    { name: 'Inova Contestado', city: 'Caçador', address: 'R. Nereu Ramos, 273 - 1 andar - Centro' },
    { name: 'Pollen', city: 'Chapecó', address: 'R. Eduardo Pedroso da Silva, 195 E - Efapi' },
    { name: 'CRIO', city: 'Criciúma', address: 'Henrique Lage, 619 - Centro' },
    { name: 'ACATE', city: 'Florianópolis', address: 'Av. Luiz Boiteux Piazza, 1302 - Canasvieiras' },
    { name: 'Elume', city: 'Itajaí', address: 'R. Manoel Bernardes, 1150 - Itaipava' },
    { name: 'Novale', city: 'Jaraguá do Sul', address: 'Rua Cesare Valentini, 200 - Três Rios do Sul' },
    { name: 'Inovale', city: 'Joaçaba', address: 'R. Antônio Adolpho Maresch, 68 - Bairro Flor da Serra' },
    { name: 'Ágora Tech Park', city: 'Joinville', address: 'Estr. Dona Francisca, 8300 - Distrito Industrial' },
    { name: 'Orion', city: 'Lages', address: 'Rua Heitor Villa Lobos, 525 - Bairro São Francisco' },
    { name: 'CINF', city: 'Rio do Sul', address: 'RODOVIA BR-470, 141 - VALADA ITOUPAVA' },
    { name: 'Centro de Inovação do Planalto Norte', city: 'São Bento do Sul', address: 'R. Norberto Eduardo Weihermann, 230 - Colonial' },
    { name: 'Sigma', city: 'Tubarão', address: 'Rua Coronel Colaço, 144 Centro' },
    { name: 'Centro de Inovação Videira', city: 'Videira', address: 'Terminal Rodoviário Irio Zardo' },
  ]

  for (const c of centers) {
    await client.query(
      'INSERT INTO public.centers (name, city, address) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [c.name, c.city, c.address]
    )
  }
  console.log('Inserted', centers.length, 'centers')

  const centerRes = await client.query("SELECT id FROM public.centers WHERE city = 'Florianópolis' LIMIT 1")
  const centerId = centerRes.rows[0]?.id
  console.log('ACATE center ID:', centerId)

  // 3. POPULATE edition_id ON EXISTING DATA
  const tables = ['projects', 'events', 'activities', 'soft_skills', 'diagnostics']
  for (const t of tables) {
    const r = await client.query(`UPDATE public.${t} SET edition_id = $1 WHERE edition_id IS NULL`, [editionId])
    console.log(`Updated ${t}: ${r.rowCount} rows`)
  }

  // Set center on projects
  if (centerId) {
    await client.query('UPDATE public.projects SET center_id = $1 WHERE center_id IS NULL', [centerId])
    console.log('Updated projects with center_id')
  }

  // 4. CREATE edition_participants FOR EXISTING USERS
  const users = await client.query('SELECT id, project_id, role, status FROM public.users WHERE project_id IS NOT NULL')
  for (const u of users.rows) {
    try {
      await client.query(`
        INSERT INTO public.edition_participants (user_id, edition_id, project_id, center_id, role, status)
        VALUES ($1, $2, $3, $4, 'empreendedor', $5)
        ON CONFLICT (user_id, edition_id) DO NOTHING
      `, [u.id, editionId, u.project_id, centerId, u.status || 'ativo'])
      console.log(`  Participant: ${u.id} (${u.role})`)
    } catch (e) {
      console.log(`  ERROR participant ${u.id}: ${e.message.substring(0, 60)}`)
    }
  }

  // 5. RLS POLICIES FOR edition_participants
  const policies = [
    `CREATE POLICY "Users can view own participation" ON public.edition_participants FOR SELECT USING (user_id = auth.uid() OR project_id = public.get_my_project_id())`,
    `CREATE POLICY "Users can update own participation" ON public.edition_participants FOR UPDATE USING (user_id = auth.uid())`,
  ]
  for (const sql of policies) {
    try { await client.query(sql); console.log('OK: policy created') }
    catch (e) { console.log('SKIP: policy -', e.message.substring(0, 50)) }
  }

  // 6. UPDATE HELPER FUNCTIONS
  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_active_edition_id()
    RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
      SELECT id FROM public.editions WHERE active = true LIMIT 1
    $$
  `)
  console.log('OK: get_active_edition_id()')

  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_my_project_id()
    RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
      SELECT project_id FROM public.edition_participants
      WHERE user_id = auth.uid()
      AND edition_id = public.get_active_edition_id()
      LIMIT 1
    $$
  `)
  console.log('OK: get_my_project_id() updated to edition-aware')

  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_my_center_id()
    RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
      SELECT center_id FROM public.edition_participants
      WHERE user_id = auth.uid()
      AND edition_id = public.get_active_edition_id()
      LIMIT 1
    $$
  `)
  console.log('OK: get_my_center_id()')

  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_my_edition_role()
    RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
      SELECT role FROM public.edition_participants
      WHERE user_id = auth.uid()
      AND edition_id = public.get_active_edition_id()
      LIMIT 1
    $$
  `)
  console.log('OK: get_my_edition_role()')

  // 7. VERIFY
  const verify = await client.query(`
    SELECT
      (SELECT count(*) FROM public.editions) as editions,
      (SELECT count(*) FROM public.centers) as centers,
      (SELECT count(*) FROM public.edition_participants) as participants,
      (SELECT count(*) FROM public.projects WHERE edition_id IS NOT NULL) as projects_linked,
      (SELECT count(*) FROM public.events WHERE edition_id IS NOT NULL) as events_linked
  `)
  console.log('\n=== VERIFICATION ===')
  console.log(verify.rows[0])

  await client.end()
  console.log('\nDone!')
}

run()
