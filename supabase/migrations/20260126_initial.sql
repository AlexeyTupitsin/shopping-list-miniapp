-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  added_by BIGINT,
  completed_by BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create list_members table
CREATE TABLE IF NOT EXISTS list_members (
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (list_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lists_owner_id ON lists(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_list_id ON items(list_id);
CREATE INDEX IF NOT EXISTS idx_items_is_completed ON items(is_completed);
CREATE INDEX IF NOT EXISTS idx_list_members_user_id ON list_members(user_id);

-- Enable Row Level Security
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lists table
-- Users can view lists they own or are members of
CREATE POLICY "Users can view their own lists or lists they are members of"
  ON lists FOR SELECT
  USING (
    owner_id = auth.uid()::BIGINT OR
    EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = lists.id
      AND list_members.user_id = auth.uid()::BIGINT
    )
  );

-- Users can create their own lists
CREATE POLICY "Users can create their own lists"
  ON lists FOR INSERT
  WITH CHECK (owner_id = auth.uid()::BIGINT);

-- Users can update their own lists
CREATE POLICY "Users can update their own lists"
  ON lists FOR UPDATE
  USING (owner_id = auth.uid()::BIGINT);

-- Users can delete their own lists
CREATE POLICY "Users can delete their own lists"
  ON lists FOR DELETE
  USING (owner_id = auth.uid()::BIGINT);

-- RLS Policies for items table
-- Users can view items from lists they have access to
CREATE POLICY "Users can view items from accessible lists"
  ON items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = items.list_id
      AND (
        lists.owner_id = auth.uid()::BIGINT OR
        EXISTS (
          SELECT 1 FROM list_members
          WHERE list_members.list_id = lists.id
          AND list_members.user_id = auth.uid()::BIGINT
        )
      )
    )
  );

-- Users can add items to accessible lists
CREATE POLICY "Users can add items to accessible lists"
  ON items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = items.list_id
      AND (
        lists.owner_id = auth.uid()::BIGINT OR
        EXISTS (
          SELECT 1 FROM list_members
          WHERE list_members.list_id = lists.id
          AND list_members.user_id = auth.uid()::BIGINT
        )
      )
    )
  );

-- Users can update items in accessible lists
CREATE POLICY "Users can update items in accessible lists"
  ON items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = items.list_id
      AND (
        lists.owner_id = auth.uid()::BIGINT OR
        EXISTS (
          SELECT 1 FROM list_members
          WHERE list_members.list_id = lists.id
          AND list_members.user_id = auth.uid()::BIGINT
        )
      )
    )
  );

-- Users can delete items from accessible lists
CREATE POLICY "Users can delete items from accessible lists"
  ON items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = items.list_id
      AND (
        lists.owner_id = auth.uid()::BIGINT OR
        EXISTS (
          SELECT 1 FROM list_members
          WHERE list_members.list_id = lists.id
          AND list_members.user_id = auth.uid()::BIGINT
        )
      )
    )
  );

-- RLS Policies for list_members table
-- Users can view members of lists they own or are members of
CREATE POLICY "Users can view members of accessible lists"
  ON list_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_members.list_id
      AND (
        lists.owner_id = auth.uid()::BIGINT OR
        EXISTS (
          SELECT 1 FROM list_members lm
          WHERE lm.list_id = lists.id
          AND lm.user_id = auth.uid()::BIGINT
        )
      )
    )
  );

-- Only list owners can add members
CREATE POLICY "Only list owners can add members"
  ON list_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_members.list_id
      AND lists.owner_id = auth.uid()::BIGINT
    )
  );

-- Only list owners can remove members
CREATE POLICY "Only list owners can remove members"
  ON list_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_members.list_id
      AND lists.owner_id = auth.uid()::BIGINT
    )
  );
