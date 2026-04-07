-- Add multi-image and variants support to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;

-- Backfill: copy existing image_url into images array for products that have one
UPDATE products
SET images = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL
  AND image_url != ''
  AND (images IS NULL OR images = '[]'::jsonb);
