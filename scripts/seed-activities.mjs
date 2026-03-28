const NEW_URL = "https://ghukwnsmuimbejpevahk.supabase.co"
const NEW_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodWt3bnNtdWltYmVqcGV2YWhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY5ODYxNywiZXhwIjoyMDkwMjc0NjE3fQ.Lt5VIdDXCIauolgJpCn36N_08a9jZxyLjW8bLw1Um9Y"

const activities = [
  {
    title: "Sprint 1 - Identificação do Problema",
    description: "Descreva o problema que seu projeto resolve, as dores do cliente e a relevância do problema.",
    order_index: 1,
    fields: [
      { name: "problema", label: "Qual problema seu projeto resolve?", type: "textarea", required: true },
      { name: "dores", label: "Quais são as principais dores do seu cliente?", type: "textarea", required: true },
      { name: "relevancia", label: "Por que esse problema é relevante?", type: "textarea", required: true },
      { name: "causas", label: "Quais são as causas desse problema?", type: "textarea", required: false }
    ]
  },
  {
    title: "Sprint 2 - Análise de Mercado",
    description: "Analise o tamanho do mercado (TAM/SAM/SOM), concorrentes e oportunidades.",
    order_index: 2,
    fields: [
      { name: "segmento", label: "Qual é o segmento de mercado?", type: "textarea", required: true },
      { name: "tamanho", label: "Qual o tamanho do mercado (TAM/SAM/SOM)?", type: "textarea", required: true },
      { name: "oportunidades", label: "Quais são as principais oportunidades?", type: "textarea", required: true },
      { name: "concorrentes", label: "Quem são seus concorrentes diretos e indiretos?", type: "textarea", required: true }
    ]
  },
  {
    title: "Sprint 3 - Definição de Cliente",
    description: "Defina seu cliente ideal (ICP), persona e público-alvo.",
    order_index: 3,
    fields: [
      { name: "modelo_b2b", label: "Qual é o modelo do negócio? (B2B, B2C, B2B2C, etc.)", type: "text", required: true },
      { name: "cliente_ideal", label: "Quem é seu cliente ideal (quem paga)?", type: "textarea", required: true },
      { name: "persona", label: "Descreva sua persona principal", type: "textarea", required: true },
      { name: "publico_alvo", label: "Quem é seu público-alvo (quem usa)?", type: "textarea", required: true }
    ]
  },
  {
    title: "Sprint 4 - Solução e MVP",
    description: "Descreva sua solução, funcionalidades principais e estratégia de MVP.",
    order_index: 4,
    fields: [
      { name: "solucao", label: "Descreva sua solução", type: "textarea", required: true },
      { name: "funcionalidades", label: "Quais são as funcionalidades principais?", type: "textarea", required: true },
      { name: "mvp", label: "Como será seu MVP (Produto Mínimo Viável)?", type: "textarea", required: true },
      { name: "tecnologia", label: "Quais tecnologias serão utilizadas?", type: "textarea", required: false }
    ]
  },
  {
    title: "Sprint 5 - Link do MVP / Protótipo",
    description: "Compartilhe o link do seu MVP, protótipo ou landing page.",
    order_index: 5,
    fields: [
      { name: "link_mvp", label: "Link do MVP / Protótipo / Landing Page", type: "text", required: true },
      { name: "descricao_mvp", label: "Descreva brevemente o que está no link", type: "textarea", required: true },
      { name: "aprendizados", label: "Quais aprendizados você teve ao construir o MVP?", type: "textarea", required: false }
    ]
  },
  {
    title: "Sprint 6 - Modelo de Negócio",
    description: "Defina seu modelo de negócio, monetização, canais de venda e ticket médio.",
    order_index: 6,
    fields: [
      { name: "modelo_negocio", label: "Qual é seu modelo de negócio?", type: "textarea", required: true },
      { name: "modelo_monetizacao", label: "Como você monetiza? (SaaS, Marketplace, Ticket, Assinatura, etc.)", type: "select", required: true, options: ["SaaS", "Marketplace", "Ticket", "Assinatura", "Freemium", "Comissão", "Licenciamento", "Outro"] },
      { name: "canais", label: "Quais são seus canais de venda e atração?", type: "textarea", required: true },
      { name: "ticket_medio", label: "Qual é o ticket médio esperado?", type: "text", required: true }
    ]
  },
  {
    title: "Sprint 7 - Funil de Vendas",
    description: "Descreva sua estratégia de qualificação, convencimento e fechamento de vendas.",
    order_index: 7,
    fields: [
      { name: "qualificacao", label: "Como você qualifica seus leads?", type: "textarea", required: true },
      { name: "convencimento", label: "Qual é sua estratégia de convencimento?", type: "textarea", required: true },
      { name: "fechamento", label: "Como é seu processo de fechamento?", type: "textarea", required: true }
    ]
  },
  {
    title: "Super Pitch - Versão 1",
    description: "Envie a primeira versão do seu pitch (vídeo ou apresentação).",
    order_index: 8,
    fields: [
      { name: "pitch_video_url", label: "Link do vídeo do pitch", type: "text", required: true },
      { name: "pitch_observacoes", label: "Observações sobre o pitch", type: "textarea", required: false }
    ]
  },
  {
    title: "Super Pitch - Versão Final",
    description: "Envie a versão final do seu pitch com vídeo e PDF do pitch deck.",
    order_index: 9,
    fields: [
      { name: "pitch_video_final", label: "Link do vídeo do pitch final", type: "text", required: true },
      { name: "pitch_pdf", label: "Link do PDF do Pitch Deck", type: "text", required: true },
      { name: "pitch_comentario", label: "Comentários finais", type: "textarea", required: false }
    ]
  }
]

const res = await fetch(`${NEW_URL}/rest/v1/activities`, {
  method: "POST",
  headers: {
    "apikey": NEW_KEY,
    "Authorization": `Bearer ${NEW_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  },
  body: JSON.stringify(activities)
})

const data = await res.json()
console.log(`Status: ${res.status}`)
console.log(`Activities inserted: ${data.length}`)
data.forEach(a => console.log(`  ${a.order_index}. ${a.title}`))
