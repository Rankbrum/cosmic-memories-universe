-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Categories / constellations
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Memories
CREATE TABLE public.memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  memory_date date,
  location text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  importance text NOT NULL DEFAULT 'normal',
  secret boolean NOT NULL DEFAULT false,
  visibility text NOT NULL DEFAULT 'public',
  cover_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.memories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memories TO authenticated;
GRANT ALL ON public.memories TO service_role;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memories public read" ON public.memories FOR SELECT USING (visibility <> 'private');
CREATE POLICY "memories admin read" ON public.memories FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "memories admin write" ON public.memories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Media
CREATE TABLE public.memory_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id uuid NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'image',
  storage_path text NOT NULL,
  caption text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.memory_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_media TO authenticated;
GRANT ALL ON public.memory_media TO service_role;
ALTER TABLE public.memory_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media follows memory read" ON public.memory_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.memories m WHERE m.id = memory_id AND m.visibility <> 'private')
);
CREATE POLICY "media admin write" ON public.memory_media FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX ON public.memory_media (memory_id);
CREATE INDEX ON public.memories (category_id);

-- Seed constellations
INSERT INTO public.categories (name, slug, position) VALUES
  ('Onde tudo começou', 'onde-tudo-comecou', 1),
  ('Nosso namoro', 'nosso-namoro', 2),
  ('Primeiros momentos', 'primeiros-momentos', 3),
  ('Nossas aventuras', 'nossas-aventuras', 4),
  ('Nossas viagens', 'nossas-viagens', 5),
  ('Dias comuns que ficaram especiais', 'dias-comuns', 6),
  ('Momentos engraçados', 'momentos-engracados', 7),
  ('Nossa família', 'nossa-familia', 8),
  ('Datas especiais', 'datas-especiais', 9),
  ('Nosso noivado', 'nosso-noivado', 10),
  ('Nosso casamento', 'nosso-casamento', 11),
  ('Nosso futuro', 'nosso-futuro', 12);