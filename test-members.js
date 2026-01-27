// Quick test to check list_members data
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oanavyipgiczofhhfask.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbmF2eWlwZ2ljem9maGhmYXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMzk5OTAsImV4cCI6MjA1MjgxNTk5MH0.sb_publishable_PrX93Qoqa9IAgKvV6bXd5Q_BR56ZrLq'

const supabase = createClient(supabaseUrl, supabaseKey)

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
      console.log(`  - ${list.name} (owner: ${list.owner_id}, id: ${list.id})`)
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
      console.log(`  - list: ${member.list_id}, user: ${member.user_id}`)
    })
  }
}

checkData()
