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
    // EVALUATIONS TABLE (comissão avaliadora - 4 critérios)
    // =====================================================
    [`CREATE TABLE IF NOT EXISTS public.evaluations (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
      evaluator_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
      edition_id uuid REFERENCES public.editions(id) ON DELETE CASCADE NOT NULL,
      score_problem int CHECK (score_problem >= 0 AND score_problem <= 10),
      score_market int CHECK (score_market >= 0 AND score_market <= 10),
      score_team int CHECK (score_team >= 0 AND score_team <= 10),
      score_resources int CHECK (score_resources >= 0 AND score_resources <= 10),
      comment text,
      created_at timestamptz DEFAULT now(),
      UNIQUE(enrollment_id, evaluator_id)
    )`, 'Create evaluations table'],

    ['ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY', 'Enable RLS evaluations'],

    // Avaliadores can see evaluations of their edition
    [`CREATE POLICY "Evaluators can view evaluations" ON public.evaluations
      FOR SELECT USING (
        evaluator_id = auth.uid()
        OR public.get_my_edition_role() IN ('avaliador', 'coordenador', 'admin')
      )`, 'Evaluations select policy'],

    [`CREATE POLICY "Evaluators can insert evaluations" ON public.evaluations
      FOR INSERT WITH CHECK (
        evaluator_id = auth.uid()
        AND public.get_my_edition_role() IN ('avaliador', 'admin')
      )`, 'Evaluations insert policy'],

    [`CREATE POLICY "Evaluators can update own evaluations" ON public.evaluations
      FOR UPDATE USING (evaluator_id = auth.uid())`, 'Evaluations update policy'],

    // =====================================================
    // CI EVALUATION (coordenador gives 0-10 score)
    // =====================================================
    ['ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS ci_score int CHECK (ci_score >= 0 AND ci_score <= 10)', 'Add ci_score to enrollments'],
    ['ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS ci_evaluator_id uuid REFERENCES public.users(id)', 'Add ci_evaluator_id to enrollments'],
    ['ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS ci_comment text', 'Add ci_comment to enrollments'],

    // =====================================================
    // ALGORITHM SCORE FUNCTION
    // Based on etapa 2 (maturity) answers
    // =====================================================
    [`CREATE OR REPLACE FUNCTION public.calc_algorithm_score(e public.enrollments)
    RETURNS int LANGUAGE plpgsql IMMUTABLE AS $$
    DECLARE score int := 0;
    BEGIN
      -- diag_experience: "Já empreendi" = 10, else 0
      IF e.diag_experience ILIKE '%Já empreendi%' THEN score := score + 10; END IF;
      -- diag_team: "Tenho outras pessoas" = 5, else 0
      IF e.diag_team ILIKE '%Tenho outras%' THEN score := score + 5; END IF;
      -- diag_availability: "Mais de 8 horas" = 10, else 0
      IF e.diag_availability ILIKE '%Mais de 8%' THEN score := score + 10; END IF;
      -- diag_stage: "Já possuo MVP" = 10, else 0
      IF e.diag_stage ILIKE '%MVP%' THEN score := score + 10; END IF;
      -- diag_model: defined model = 5, "Ainda não defini" = 0
      IF e.diag_model IS NOT NULL AND e.diag_model NOT ILIKE '%não defini%' THEN score := score + 5; END IF;
      -- diag_formalization: "Possuo CNPJ" = 5, else 0
      IF e.diag_formalization ILIKE '%Possuo CNPJ%' THEN score := score + 5; END IF;
      -- diag_sales: "Já tenho cliente" = 10, else 0
      IF e.diag_sales ILIKE '%Já tenho%' THEN score := score + 10; END IF;
      -- diag_market: "Já estudei" = 10, else 0
      IF e.diag_market ILIKE '%Já estudei%' THEN score := score + 10; END IF;
      -- diag_area_experience: "Já atuei" = 10, else 0
      IF e.diag_area_experience ILIKE '%Já atuei%' THEN score := score + 10; END IF;
      -- diag_clients: "Possuo contatos" = 10, else 0
      IF e.diag_clients ILIKE '%Possuo contatos%' THEN score := score + 10; END IF;
      -- diag_validation: "dados estruturados" = 10, else 0
      IF e.diag_validation ILIKE '%dados estruturados%' THEN score := score + 10; END IF;
      -- diag_management: "planilhas/documentos" = 5, else 0
      IF e.diag_management ILIKE '%planilhas%' THEN score := score + 5; END IF;
      RETURN score;
    END;
    $$`, 'Create calc_algorithm_score function'],

    // =====================================================
    // RANKING VIEW
    // =====================================================
    [`CREATE OR REPLACE VIEW public.vw_enrollment_ranking AS
    SELECT
      e.id as enrollment_id,
      e.user_id,
      e.edition_id,
      e.center_id,
      e.full_name,
      e.project_title,
      e.status,
      e.submitted_at,
      c.name as center_name,
      c.city as center_city,
      public.calc_algorithm_score(e) as algorithm_score,
      e.ci_score,
      COALESCE(
        (SELECT SUM(ev.score_problem + ev.score_market + ev.score_team + ev.score_resources)::numeric
         / NULLIF(COUNT(ev.id), 0)
         FROM public.evaluations ev WHERE ev.enrollment_id = e.id),
        0
      ) as avg_commission_score,
      COALESCE(
        (SELECT COUNT(ev.id) FROM public.evaluations ev WHERE ev.enrollment_id = e.id),
        0
      ) as evaluator_count,
      (
        public.calc_algorithm_score(e)
        + COALESCE(e.ci_score, 0) * 20
        + COALESCE(
            (SELECT SUM(ev.score_problem + ev.score_market + ev.score_team + ev.score_resources)::numeric
             / NULLIF(COUNT(ev.id), 0)
             FROM public.evaluations ev WHERE ev.enrollment_id = e.id),
            0
          ) * 2.5
      ) as final_score
    FROM public.enrollments e
    LEFT JOIN public.centers c ON c.id = e.center_id
    WHERE e.status = 'submetida'
    ORDER BY final_score DESC`, 'Create ranking view'],

    // =====================================================
    // ENROLLMENT STATS VIEW (dashboard)
    // =====================================================
    [`CREATE OR REPLACE VIEW public.vw_enrollment_stats AS
    SELECT
      e.edition_id,
      e.center_id,
      c.name as center_name,
      c.city as center_city,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE e.status = 'rascunho') as draft_count,
      COUNT(*) FILTER (WHERE e.status = 'submetida') as submitted_count,
      COUNT(*) FILTER (WHERE e.status = 'aprovada') as approved_count,
      COUNT(*) FILTER (WHERE e.status = 'desistente') as dropout_count,
      COUNT(DISTINCT ev.evaluator_id) as evaluator_count,
      COUNT(DISTINCT CASE WHEN ev.id IS NOT NULL THEN e.id END) as evaluated_count
    FROM public.enrollments e
    LEFT JOIN public.centers c ON c.id = e.center_id
    LEFT JOIN public.evaluations ev ON ev.enrollment_id = e.id
    GROUP BY e.edition_id, e.center_id, c.name, c.city`, 'Create enrollment stats view'],

    // =====================================================
    // GRANT ACCESS TO VIEWS
    // =====================================================
    ['GRANT SELECT ON public.vw_enrollment_ranking TO authenticated', 'Grant ranking view access'],
    ['GRANT SELECT ON public.vw_enrollment_stats TO authenticated', 'Grant stats view access'],

    // =====================================================
    // UPDATE ENROLLMENTS POLICY - staff can update ci_score
    // =====================================================
    [`CREATE POLICY "Coordinators can update ci_score" ON public.enrollments
      FOR UPDATE USING (
        public.get_my_edition_role() IN ('coordenador', 'admin')
        AND center_id = public.get_my_center_id()
      )`, 'CI score update policy'],

    // Staff can see all enrollments
    [`CREATE POLICY "Staff can view all enrollments" ON public.enrollments
      FOR SELECT USING (
        public.get_my_edition_role() IN ('avaliador', 'coordenador', 'admin')
      )`, 'Staff view all enrollments'],
  ]

  for (const [sql, desc] of queries) {
    try {
      await client.query(sql)
      console.log('OK:', desc)
    } catch (e) {
      if (e.message.includes('already exists')) console.log('SKIP:', desc, '(exists)')
      else console.log('ERROR:', desc, '-', e.message.substring(0, 100))
    }
  }

  // Verify
  const r = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'evaluations' ORDER BY ordinal_position")
  console.log('\nEvaluations columns:', r.rows.map(c => c.column_name).join(', '))

  await client.end()
  console.log('\nDone!')
}

run()
