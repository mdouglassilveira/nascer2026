import { readFileSync } from 'fs'

const TOKEN = 'sbp_23602d2defff875fcb5830eb3908262ec4901dd9'
const PROJECT_REF = 'ghukwnsmuimbejpevahk'

// Read and inline the function code (replace the cors import)
const corsCode = `const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}\n`

let funcCode = readFileSync('../supabase/functions/invite-member/index.ts', 'utf8')
funcCode = funcCode.replace('import { corsHeaders } from "../_shared/cors.ts"\n', corsCode)

// First, try to create the function
const createRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/functions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    slug: 'invite-member',
    name: 'invite-member',
    body: funcCode,
    verify_jwt: true,
  }),
})

const createData = await createRes.text()
console.log('Create status:', createRes.status)
console.log('Create response:', createData)

if (createRes.status === 409) {
  // Already exists, update it
  const updateRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/invite-member`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      body: funcCode,
      verify_jwt: true,
    }),
  })
  console.log('Update status:', updateRes.status)
  console.log('Update response:', await updateRes.text())
}
