// Quick test to check list_members data
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

async function checkData() {
  console.log('Checking lists...')
  const { data: lists, error: listsError } = await supabase
    .from('lists')
    .select('*')

  if (listsError) {
    console.error('Error fetching lists:', listsError)
  } else {
    console.log('Lists:', lists?.length || 0)
    lists?.forEach(list => {
      console.log(`  - ${list.name} (owner: ${list.owner_id}, id: ${list.id.substring(0, 8)}...)`)
    })
  }

  console.log('\nChecking list_members...')
  const { data: members, error: membersError } = await supabase
    .from('list_members')
    .select('*')

  if (membersError) {
    console.error('Error fetching members:', membersError)
  } else {
    console.log('Members:', members?.length || 0)
    members?.forEach(member => {
      console.log(`  - list: ${member.list_id.substring(0, 8)}..., user: ${member.user_id}`)
    })
  }

  // Check specific user
  console.log('\nChecking for user 138899775 (your account):')
  const { data: userLists } = await supabase
    .from('lists')
    .select('*')
    .eq('owner_id', 138899775)

  console.log('  Owned lists:', userLists?.length || 0)

  const { data: userMemberships } = await supabase
    .from('list_members')
    .select('*')
    .eq('user_id', 138899775)

  console.log('  Member in lists:', userMemberships?.length || 0)
}

checkData().then(() => process.exit(0))
