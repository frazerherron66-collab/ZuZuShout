
-- Enums
CREATE TYPE public.user_role AS ENUM ('child','parent');
CREATE TYPE public.avatar_template AS ENUM ('fox','panda','robot','cat','dino');
CREATE TYPE public.video_category AS ENUM ('laboratory','pixel_play','studio','vibe_flow','nature_scouts');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'child',
  avatar public.avatar_template NOT NULL DEFAULT 'fox',
  paired_with UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pairing_code TEXT,
  pairing_code_expires_at TIMESTAMPTZ,
  paused BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX profiles_pairing_code_idx ON public.profiles(pairing_code) WHERE pairing_code IS NOT NULL;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper: get paired_with for current user
CREATE OR REPLACE FUNCTION public.get_paired_with(_uid UUID)
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT paired_with FROM public.profiles WHERE id = _uid
$$;

CREATE POLICY "view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR id = public.get_paired_with(auth.uid()) OR paired_with = auth.uid());

CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Parent can update their paired child's paused field via separate policy
CREATE POLICY "parent updates paired child" ON public.profiles FOR UPDATE TO authenticated
  USING (paired_with = auth.uid()) WITH CHECK (paired_with = auth.uid());

CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'child'),
    COALESCE((NEW.raw_user_meta_data->>'avatar')::public.avatar_template, 'fox')
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Videos (sample content - publicly readable)
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category public.video_category NOT NULL,
  video_url TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_avatar public.avatar_template NOT NULL DEFAULT 'fox',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "videos public read" ON public.videos FOR SELECT TO authenticated USING (true);

-- Shouts
CREATE TABLE public.shouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, video_id)
);
ALTER TABLE public.shouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "child manages own shouts" ON public.shouts FOR ALL TO authenticated
  USING (child_id = auth.uid()) WITH CHECK (child_id = auth.uid());
CREATE POLICY "parent reads paired child shouts" ON public.shouts FOR SELECT TO authenticated
  USING (child_id IN (SELECT id FROM public.profiles WHERE paired_with = auth.uid()));

-- Search history
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "child manages own searches" ON public.search_history FOR ALL TO authenticated
  USING (child_id = auth.uid()) WITH CHECK (child_id = auth.uid());
CREATE POLICY "parent reads paired child searches" ON public.search_history FOR SELECT TO authenticated
  USING (child_id IN (SELECT id FROM public.profiles WHERE paired_with = auth.uid()));

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users insert own reports" ON public.reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "users see own reports" ON public.reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

-- Pairing function: child redeems code => links both ways
CREATE OR REPLACE FUNCTION public.redeem_pairing_code(_code TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  parent_profile public.profiles;
BEGIN
  SELECT * INTO parent_profile FROM public.profiles
    WHERE pairing_code = _code
      AND role = 'parent'
      AND (pairing_code_expires_at IS NULL OR pairing_code_expires_at > now())
    LIMIT 1;
  IF parent_profile.id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired code';
  END IF;
  -- Link child -> parent and parent -> child
  UPDATE public.profiles SET paired_with = parent_profile.id, updated_at = now() WHERE id = auth.uid();
  UPDATE public.profiles SET paired_with = auth.uid(), pairing_code = NULL, pairing_code_expires_at = NULL, updated_at = now() WHERE id = parent_profile.id;
  RETURN parent_profile.id;
END; $$;

-- Realtime
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.shouts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shouts;

-- Seed sample videos (open-source demo videos)
INSERT INTO public.videos (title, description, category, video_url, creator_name, creator_avatar) VALUES
  ('Volcano Eruption Experiment','Baking soda and vinegar fun!','laboratory','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4','LabFox','fox'),
  ('Pixel Castle Build','Building epic castles in Minecraft!','pixel_play','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4','PixelPanda','panda'),
  ('Watercolor Galaxy','Painting the night sky','studio','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4','ArtBot','robot'),
  ('Drum Beat Tutorial','Learn this catchy beat','vibe_flow','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4','VibeCat','cat'),
  ('Forest Bug Hunt','Tiny critters everywhere','nature_scouts','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4','DinoScout','dino'),
  ('Slime Science','Make stretchy slime safely','laboratory','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4','LabFox','fox'),
  ('Speed Run Challenge','Beating my best time!','pixel_play','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4','PixelPanda','panda');
