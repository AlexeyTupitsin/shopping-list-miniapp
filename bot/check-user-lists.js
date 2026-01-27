// Check what lists a user should see
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

async function checkUserLists(userId) {
  console.log(`\n=== Lists for user ${userId} ===\n`)

  // Fetch lists where user is owner
  const { data: ownerLists } = await supabase
    .from('lists')
    .select('*')
    .eq('owner_id', userId)

  console.log('Owned lists:', ownerLists?.length || 0)
  ownerLists?.forEach(list => {
    console.log(`  - ${list.name} (${list.id.substring(0, 8)}...)`)
  })

  // Fetch lists where user is a member
  const { data: memberData } = await supabase
    .from('list_members')
    .select('list_id')
    .eq('user_id', userId)

  const memberListIds = memberData?.map(m => m.list_id) || []
  console.log('\nMember list IDs:', memberListIds.length)

  if (memberListIds.length > 0) {
    const { data: sharedLists } = await supabase
      .from('lists')
      .select('*')
      .in('id', memberListIds)

    console.log('Shared lists (from list_members):', sharedLists?.length || 0)
    sharedLists?.forEach(list => {
      console.log(`  - ${list.name} (${list.id.substring(0, 8)}..., owner: ${list.owner_id})`)
    })
  }

  // Combine
  const allListsMap = new Map()
  ownerLists?.forEach(list => allListsMap.set(list.id, list))

  if (memberListIds.length > 0) {
    const { data: sharedLists } = await supabase
      .from('lists')
      .select('*')
      .in('id', memberListIds)
    sharedLists?.forEach(list => allListsMap.set(list.id, list))
  }

  console.log('\nTotal lists user should see:', allListsMap.size)
}

async function main() {
  await checkUserLists(138899775) // Your account
  await checkUserLists(966082337) // Second account
}

main().then(() => process.exit(0))
