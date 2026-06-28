-- 1. Service add-ons (ironing, folding, pickup, delivery, express, etc.)
CREATE TABLE public.service_addons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  price numeric NOT NULL DEFAULT 0,
  pricing_type text NOT NULL DEFAULT 'flat', -- 'flat' (once per order) | 'per_item' (x total items)
  currency text NOT NULL DEFAULT 'KES',
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.service_addons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_addons TO authenticated;
GRANT ALL ON public.service_addons TO service_role;

ALTER TABLE public.service_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read add-ons"
  ON public.service_addons FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage add-ons"
  ON public.service_addons FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_service_addons_updated_at
  BEFORE UPDATE ON public.service_addons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Order number sequence
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1001;

-- 3. Orders
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL DEFAULT ('MR-' || nextval('public.order_number_seq')::text) UNIQUE,
  user_id uuid,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  fulfillment_type text NOT NULL DEFAULT 'pickup_delivery', -- 'pickup_delivery' | 'dropoff'
  address text,
  scheduled_at timestamptz,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'on_delivery',
  subtotal numeric NOT NULL DEFAULT 0,
  addons_total numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KES',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Order items
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  service_id uuid,
  service_name text NOT NULL,
  unit_price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  line_total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "Admins can manage all order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. Order add-ons
CREATE TABLE public.order_addons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  addon_id uuid,
  addon_name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  line_total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_addons TO authenticated;
GRANT ALL ON public.order_addons TO service_role;

ALTER TABLE public.order_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own order add-ons"
  ON public.order_addons FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "Admins can manage all order add-ons"
  ON public.order_addons FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 6. Seed add-ons
INSERT INTO public.service_addons (slug, name, description, icon, price, pricing_type, display_order) VALUES
  ('ironing', 'Ironing & Pressing', 'Crisp, wrinkle-free finish on every garment.', 'wind', 30, 'per_item', 1),
  ('folding', 'Premium Folding', 'Neatly folded and packaged, ready to store.', 'package', 10, 'per_item', 2),
  ('pickup', 'Doorstep Pickup', 'We collect your laundry from your door.', 'truck', 150, 'flat', 3),
  ('delivery', 'Doorstep Delivery', 'Freshly cleaned items returned to your door.', 'truck', 150, 'flat', 4),
  ('express', 'Emergency Priority Cleaning', 'Jump the queue — priority same-day handling.', 'zap', 500, 'flat', 5),
  ('stain', 'Stain Treatment', 'Targeted treatment for tough stains.', 'sparkles', 100, 'per_item', 6),
  ('softener', 'Premium Fabric Softener', 'Extra-soft, fragrant finish.', 'flower', 50, 'flat', 7);

-- 7. Every service finishes within a day
UPDATE public.services
  SET estimated_processing_hours = 12,
      estimated_delivery_hours = 24;