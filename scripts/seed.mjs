const NEW_URL = "https://ghukwnsmuimbejpevahk.supabase.co"
const NEW_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodWt3bnNtdWltYmVqcGV2YWhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY5ODYxNywiZXhwIjoyMDkwMjc0NjE3fQ.Lt5VIdDXCIauolgJpCn36N_08a9jZxyLjW8bLw1Um9Y"

const headers = {
  "apikey": NEW_KEY,
  "Authorization": `Bearer ${NEW_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=minimal"
}

async function insert(table, data) {
  const res = await fetch(`${NEW_URL}/rest/v1/${table}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data)
  })
  const text = await res.text()
  console.log(`${table}: ${res.status} - ${text || "OK"} (${data.length} rows)`)
}

const contents = [
  // Problema
  {title:"Mentalidade de CEO",description:"Instrutor: Tiago - 49 educação - 14min",module:"Problema",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105319655/rendition/source/file.mp4?loc=external&signature=bb02b8944b8299b193511786ebe1e26a09900a2ce4356a71f27a823089652531",order_index:1},
  {title:"Mito da Ideia Genial",description:"Instrutor: Tiago - 49 educação - 8min",module:"Problema",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105317687/rendition/1080p/file.mp4?loc=external&signature=df26c3892f232c5e885350e5bbefda775ff02862cb4e0a673aa61c7da96526fe",order_index:2},
  {title:"Necessidades se desenvolvem",description:"Instrutor: Victor - 49 educação - 5min",module:"Problema",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105296641/rendition/source/file.mp4?loc=external&signature=14f6046dab1b1410e6d850ae99a874ba5247e4e52c1e5ba11c3b9147b642e019",order_index:3},
  {title:"Perfil de cliente ideal",description:"Instrutor: Maiara - 49 educação - 11min",module:"Problema",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105261473/rendition/source/file.mp4?loc=external&signature=918e745c3164d8e58427600b1b2e2c4300f310c16cf9b43308f289ca10a0df16",order_index:4},
  // Validação
  {title:"Ciclo de Validação",description:"Instrutor: Tiago - 49 educação - 8min",module:"Validação",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105299247/rendition/source/file.mp4?loc=external&signature=7162c1c713d9b0e0cfd362793a0e473d78d84244809797d48cb6642ac4b5c620",order_index:1},
  {title:"Validação de Impacto",description:"Instrutor: Tiago - 49 educação - 15min",module:"Validação",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105319756/rendition/source/file.mp4?loc=external&signature=2f2783d3953e8266d9ea97460e0deb23f89016040bef9d7c353c467e12b15d18",order_index:2},
  // Cliente
  {title:"Hacks de Prospecção",description:"Instrutor: Tiago - 49 educação - 9min",module:"Cliente",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105316751/rendition/source/file.mp4?loc=external&signature=9f4bfab38c6a5213737c94e24e28401a2da90a75ac0f65d3ab8b652257436644",order_index:1},
  {title:"Trajetória do cliente",description:"Instrutor: Maiara - 49 educação - 5min",module:"Cliente",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105292344/rendition/source/file.mp4?loc=external&signature=b3c9347438ab1d5967330783519bdea0cdc604aa654dcf180389dcf83be87dcb",order_index:2},
  // MVP
  {title:"Design Thinking",description:"Instrutor: Tiago - 49 educação - 8min",module:"MVP",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105316603/rendition/source/file.mp4?loc=external&signature=13d627a2f02257bdcd6f775e9c5b57d1f7da5bd8063cb50a1dd6c495d5828e6d",order_index:1},
  {title:"IA na construção do seu Projeto",description:"Instrutor: Marcelo - 49 educação - 11min",module:"MVP",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105305939/rendition/source/file.mp4?loc=external&signature=0f209d803e510eac96cd88d298826a9a7ab848017a2747315f04cb145447c423",order_index:2},
  // Oferta
  {title:"Atalhos de Crescimento",description:"Instrutor: Tiago - 49 educação - 6min",module:"Oferta",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105316724/rendition/source/file.mp4?loc=external&signature=9061834155b13cd6c364c0406d26b471dc54fbc710cea2e7760fc83002eb48e2",order_index:1},
  {title:"Página de Alta Conversão",description:"Instrutor: Tiago - 49 educação - 11min",module:"Oferta",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105317694/rendition/source/file.mp4?loc=external&signature=391df4935cc95e01680c122fbc2e2672b679579d38bdc69773bdcdca7737c16f",order_index:2},
  {title:"Proposta de Valor",description:"Instrutor: Tiago - 49 educação - 8min",module:"Oferta",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105319461/rendition/source/file.mp4?loc=external&signature=ad96fea2d6b291906837b5a6eb305ba2db46c73de14fa512c2ca8e6387d05fd5",order_index:3},
  // Marketing
  {title:"Branding & Marca",description:"Instrutor: Tiago - 49 educação - 8min",module:"Marketing",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105297806/rendition/source/file.mp4?loc=external&signature=d68bd868b11607f7966134cd79426671294f6f857fc871b54b581c58c6603ff6",order_index:1},
  {title:"Copywriting",description:"Instrutor: Tiago - 49 educação - 6min",module:"Marketing",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105315180/rendition/source/file.mp4?loc=external&signature=c91be9f5c84a365d5fa648fa5cb008a5451c3744cdf0597b50ba7e9b47cfee7c",order_index:2},
  {title:"Storytelling",description:"Instrutor: Tiago - 49 educação - 8min",module:"Marketing",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105319587/rendition/source/file.mp4?loc=external&signature=ea496dc1f8f9cf2b66a668295d51647336698ae0eb3672f14119d29b51d9485c",order_index:3},
  // Vendas
  {title:"Do Zero à Escala",description:"Instrutor: Marcelo - 49 educação - 12min",module:"Vendas",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105307910/rendition/source/file.mp4?loc=external&signature=46141c6ca87d8b3218a96f5f5278d4b9b4e0e0accb747eb5d9b36c16e7a17217",order_index:1},
  {title:"O que é SPIN Selling",description:"Instrutor: Victor - 49 educação - 5min",module:"Vendas",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105294041/rendition/source/file.mp4?loc=external&signature=c98f2c8543575722fa3f970a33680e7acb62d14a52d6b2fc0ac823d7e9cc3e45",order_index:2},
  {title:"Modelo SPIN",description:"Instrutor: Victor - 49 educação - 12min",module:"Vendas",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105295087/rendition/source/file.mp4?loc=external&signature=11768a76cdc829df280c73e8ac494492fb48ba6519496fe9c1a04a8c93db6f37",order_index:3},
  {title:"Negócios Escaláveis",description:"Instrutor: Tiago - 49 educação - 7min",module:"Vendas",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105317718/rendition/source/file.mp4?loc=external&signature=ef0379a6d3d6ab28cfe63c687bba5b84af020c29005cd521abc966d4a80c1e68",order_index:4},
  // Fomento
  {title:"Capital de Risco no Brasil",description:"Instrutor: Marcelo - 49 educação - 7min",module:"Fomento",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105225793/rendition/source/file.mp4?loc=external&signature=62b6cc578a533867d8baa82584984358f10221c6060bd69ebc85f5b03b5527b4",order_index:1},
  {title:"Investimentos em Startups",description:"Instrutor: Marcelo - 49 educação - 7min",module:"Fomento",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105836116/rendition/source/file.mp4?loc=external&signature=981c0872a6ec289e98fe8269f5c53baa07ce6a59c426ecb43d0bef303cd5e493",order_index:2},
  // Pitch
  {title:"Como Calcular seu Valuation",description:"Instrutor: Marcelo - 49 educação - 15min",module:"Pitch",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105302723/rendition/1080p/file.mp4?loc=external&signature=f890b48db433e3c6316d825930bf6062f3952501d9f3bd917845b6a275d9bb6e",order_index:1},
  {title:"Como Construir seu Pitch Deck",description:"Instrutor: Marcelo - 49 educação - 10min",module:"Pitch",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105304845/rendition/source/file.mp4?loc=external&signature=86558fde77800164c32b13121115048b08dfed92ed00e27f4ce6c97c38d0b661",order_index:2},
  {title:"Diluição e Captable",description:"Instrutor: Marcelo - 49 educação - 6min",module:"Pitch",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105237369/rendition/source/file.mp4?loc=external&signature=17a389ec9773ddda8fe94bdfa17ae25136a3741def1ed0da109209c773a39336",order_index:3},
  // Startups
  {title:"Processos",description:"Instrutor: Maiara - 49 educação - 9min",module:"Startups",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105264144/rendition/source/file.mp4?loc=external&signature=ddc650a72c94b594b5c24461fd2d6da02552b661c986625b751a4178f1924b03",order_index:1},
  {title:"Profissional de venda",description:"Instrutor: Maiara - 49 educação - 4min",module:"Startups",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1105290959/rendition/source/file.mp4?loc=external&signature=a541ee94d52b11fb56ae8f5566ead0ad638e471bf2c3b079d79a8d56e2d66ad3",order_index:2},
  // Lives Bônus
  {title:"Como Escrever o seu Projeto",description:"Instrutor: Luiz Salomão - 83min",module:"Lives Bônus",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1108552609/rendition/source/file.mp4?loc=external&signature=7d717afaaaff7e3815d985efee22f111dae1b228eb9b2dd72073c17bb54bc087",order_index:1},
  {title:"Contabilidade Básica para sua Empresa",description:"Instrutor: Paolo Recke - Vision Partners - 90min",module:"Lives Bônus",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1111303694/rendition/source/file.mp4?loc=external&signature=0fa2253f3ca90f7d0bc866ff4650eb106eb159717434c2dee96566b430767e7e",order_index:2},
  {title:"Noções jurídicas para negócios inovadores",description:"Instrutor: Marcos Buson - MOA Ventures - 88min",module:"Lives Bônus",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1112538188/rendition/source/file.mp4?loc=external&signature=70fde26daa74bf4f83d250529b19b2fc1639a313f0618024b55e73dfdcaf81cb",order_index:3},
  {title:"Governança e contratos iniciais",description:"Instrutor: Marcos Buson - MOA Ventures - 97min",module:"Lives Bônus",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1118750804/rendition/source/file.mp4?loc=external&signature=f7ab44a12c2acee7a773e5d8adeb2453d3ebb51c4da5ee8eabd7145ec6e199ac",order_index:4},
  {title:"Captação de recursos em editais de fomento",description:"Instrutor: Meirielle Tainara - 99min",module:"Lives Bônus",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1118752403/rendition/source/file.mp4?loc=external&signature=f2f79321efe19467cfab6756fa82ae5b9dc527c8e5c986641d8c1377f6a0033b",order_index:5},
  {title:"Dicas para captação de investimento anjo",description:"Instrutor: 49 educação - 79min",module:"Lives Bônus",type:"video",video_url:"https://player.vimeo.com/progressive_redirect/playback/1120291436/rendition/source/file.mp4?loc=external&signature=680c22141557757b8bd728033eb37dfec49e178b4c0705dccfb929e3dec5c078",order_index:6},
  // Materiais de Apoio
  {title:"Da Ideia ao MVP",description:"64 páginas",module:"Materiais de Apoio",type:"material",video_url:"https://drive.google.com/file/d/1XCVwp9xKnhJsObpSrK_B-rTgvsbH1hDv/preview",order_index:1},
  {title:"Glossário Startups",description:"34 páginas",module:"Materiais de Apoio",type:"material",video_url:"https://drive.google.com/file/d/1jfON4JnbaguSj_qHx-6AFeIuD4CZpn-P/preview",order_index:2},
  {title:"Lista de Ferramentas",description:"13 páginas",module:"Materiais de Apoio",type:"material",video_url:"https://drive.google.com/file/d/1125vduclIMrQBwPo_YoUzIpHX7rGH4KC/preview",order_index:3},
  {title:"Guia Essencial Vol.1 - Descoberta",description:"Guia Essencial para Empreendedores",module:"Materiais de Apoio",type:"material",video_url:"https://pwaqixlskgnincscltmn.supabase.co/storage/v1/object/public/capas/materiais-apoio/Guia%20Essencial%20Volume%201.pdf",order_index:4},
  {title:"Guia Essencial Vol.2 - Ideação",description:"Guia Essencial para Empreendedores",module:"Materiais de Apoio",type:"material",video_url:"https://pwaqixlskgnincscltmn.supabase.co/storage/v1/object/public/capas/materiais-apoio/Guia%20Essencial%20Volume%202.pdf",order_index:5},
  {title:"Guia Essencial Vol.3 - Modelagem",description:"Guia Essencial para Empreendedores",module:"Materiais de Apoio",type:"material",video_url:"https://pwaqixlskgnincscltmn.supabase.co/storage/v1/object/public/capas/materiais-apoio/Guia%20Essencial%20Volume%203.pdf",order_index:6},
  {title:"Guia Essencial Vol.4 - Implantação",description:"Guia Essencial para Empreendedores",module:"Materiais de Apoio",type:"material",video_url:"https://pwaqixlskgnincscltmn.supabase.co/storage/v1/object/public/capas/materiais-apoio/Guia%20Essencial%20Volume%204.PDF",order_index:7},
  {title:"Bootcamp",description:"42 páginas",module:"Materiais de Apoio",type:"material",video_url:"https://drive.google.com/file/d/1Qvb7PXRc_NoPj1FrEidObmC7iemj5X6h/preview",order_index:8},
]

await insert("contents", contents)

// Verify totals
const eventsRes = await fetch(`${NEW_URL}/rest/v1/events?select=id`, { headers })
const eventsData = await eventsRes.json()
console.log(`\nTotal events in DB: ${eventsData.length}`)

const contentsRes = await fetch(`${NEW_URL}/rest/v1/contents?select=id`, { headers })
const contentsData = await contentsRes.json()
console.log(`Total contents in DB: ${contentsData.length}`)
