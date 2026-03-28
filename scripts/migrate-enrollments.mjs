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

  const queries = [
    // =====================================================
    // ENROLLMENTS TABLE
    // =====================================================
    [`CREATE TABLE IF NOT EXISTS public.enrollments (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
      edition_id uuid REFERENCES public.editions(id) ON DELETE CASCADE NOT NULL,
      center_id uuid REFERENCES public.centers(id) ON DELETE SET NULL,
      status text DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'submetida', 'em_avaliacao', 'aprovada', 'rejeitada', 'desistente')),
      form_step int DEFAULT 0,

      -- Step 1: Dados pessoais
      full_name text,
      phone text,
      gender text,
      institution_linked boolean,
      institution_name text,

      -- Step 2: Maturidade / Perfil
      diag_experience text,
      diag_team text,
      diag_availability text,
      diag_stage text,
      diag_model text,
      diag_formalization text,
      diag_sales text,
      diag_market text,
      diag_area_experience text,
      diag_clients text,
      diag_validation text,
      diag_management text,

      -- Step 3: Proposta
      project_title text,
      project_description text,
      problem_solution text,
      market_innovation text,
      team_profile text,
      business_model text,
      project_link text,

      -- Step 4: Elegibilidade + Docs + Endereço
      enrollment_type text CHECK (enrollment_type IN ('cpf', 'cnpj')),

      -- Elegibilidade CNPJ (5 perguntas sim/não)
      elig_company_age boolean,
      elig_revenue boolean,
      elig_compatible boolean,
      elig_partner boolean,
      elig_cnpj_sc boolean,

      -- PJ
      company_time text,
      cnpj text,
      doc_social_contract_url text,
      doc_cnpj_card_url text,
      doc_dre_url text,

      -- PF / dados finais
      cpf text,
      doc_identity_url text,
      resident_sc boolean,
      cep text,
      address text,
      city text,
      state text,
      street text,
      address_number text,
      address_complement text,
      doc_residence_url text,

      -- Aceite
      accepted_rules boolean DEFAULT false,

      created_at timestamptz DEFAULT now(),
      submitted_at timestamptz,
      updated_at timestamptz DEFAULT now(),

      UNIQUE(user_id, edition_id)
    )`, 'Create enrollments table'],

    ['ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY', 'Enable RLS'],

    // User can see and edit their own enrollment
    [`CREATE POLICY "Users can view own enrollment" ON public.enrollments
      FOR SELECT USING (user_id = auth.uid())`, 'Enrollment select policy'],

    [`CREATE POLICY "Users can insert own enrollment" ON public.enrollments
      FOR INSERT WITH CHECK (user_id = auth.uid())`, 'Enrollment insert policy'],

    [`CREATE POLICY "Users can update own enrollment" ON public.enrollments
      FOR UPDATE USING (user_id = auth.uid())`, 'Enrollment update policy'],

    // Admins/avaliadores can see enrollments of their edition
    [`CREATE POLICY "Staff can view edition enrollments" ON public.enrollments
      FOR SELECT USING (
        edition_id = public.get_active_edition_id()
        AND public.get_my_edition_role() IN ('avaliador', 'coordenador', 'admin')
      )`, 'Staff enrollment view policy'],

    // Updated_at trigger
    [`CREATE TRIGGER update_enrollments_updated_at
      BEFORE UPDATE ON public.enrollments
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()`, 'Enrollment updated_at trigger'],
  ]

  for (const [sql, desc] of queries) {
    try {
      await client.query(sql)
      console.log('OK:', desc)
    } catch (e) {
      if (e.message.includes('already exists')) console.log('SKIP:', desc, '(exists)')
      else console.log('ERROR:', desc, '-', e.message.substring(0, 80))
    }
  }

  // Verify
  const r = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'enrollments' ORDER BY ordinal_position")
  console.log('\nEnrollments columns:', r.rows.map(c => c.column_name).join(', '))

  await client.end()
  console.log('\nDone!')
}

run()
