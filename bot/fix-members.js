// Fix missing members
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

async function fixMembers() {
  console.log('Adding missing list owners as members...')

  // Get all lists
  const { data: lists } = await supabase.from('lists').select('*')

  for (const list of lists) {
    // Check if owner is a member
    const { data: existing } = await supabase
      .from('list_members')
      .select('*')
      .eq('list_id', list.id)
      .eq('user_id', list.owner_id)
      .single()

    if (!existing) {
      console.log(`Adding owner ${list.owner_id} to list "${list.name}" (${list.id.substring(0, 8)}...)`)
      const { error } = await supabase
        .from('list_members')
        .insert({
          list_id: list.id,
          user_id: list.owner_id,
          joined_at: list.created_at
        })

      if (error) {
        console.error('Error:', error.message)
      } else {
        console.log('  ✓ Added')
      }
    } else {
      console.log(`Owner ${list.owner_id} already member of "${list.name}"`)
    }
  }

  console.log('\nDone! Checking result...')
  const { data: members } = await supabase.from('list_members').select('*')
  console.log(`Total members: ${members?.length || 0}`)
}

fixMembers().then(() => process.exit(0))
