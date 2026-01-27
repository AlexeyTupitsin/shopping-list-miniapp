-- Add all list owners as members to their lists
-- This is needed for lists created before the list_members feature

INSERT INTO list_members (list_id, user_id, joined_at)
SELECT
  id as list_id,
  owner_id as user_id,
  created_at as joined_at
FROM lists
WHERE NOT EXISTS (
  SELECT 1
  FROM list_members
  WHERE list_members.list_id = lists.id
    AND list_members.user_id = lists.owner_id
);
