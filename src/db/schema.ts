import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// ─── UTILISATEURS & ROLES ──────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  isActive: integer('is_active').default(1).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description'),
});

export const userRoles = sqliteTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
});

// ─── CATALOGUE & PRODUITS ──────────────────────────────────────────────────
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description').notNull(),
  priceMinor: integer('price_minor').notNull(),
  comparePrice: integer('compare_price'),
  categoryId: text('category_id').notNull().references(() => categories.id),
  // Utiliser integer simple (0/1) pour éviter les conflits de type Drizzle SQLite
  isFeatured: integer('is_featured').default(0).notNull(),
  isActive: integer('is_active').default(1).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  bucket: text('bucket').notNull(),
  assetFolder: text('asset_folder'),
  storagePath: text('storage_path').notNull(),
  publicBasePath: text('public_base_path').notNull(),
  altText: text('alt_text'),
  focalX: integer('focal_x').default(50).notNull(),
  focalY: integer('focal_y').default(50).notNull(),
  width: integer('width'),
  height: integer('height'),
  mimeType: text('mime_type'),
  source: text('source'),
  sourceUrl: text('source_url'),
  licenseNote: text('license_note'),
  isStock: integer('is_stock').default(0).notNull(),
  variantsJson: text('variants_json').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export const productImages = sqliteTable('product_images', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  mediaId: text('media_id').references(() => media.id, { onDelete: 'set null' }),
  url: text('url'),
  altText: text('alt_text'),
  isMain: integer('is_main').default(0).notNull(),
  order: integer('order').default(0).notNull(),
});

export const siteSections = sqliteTable('site_sections', {
  id: text('id').primaryKey(),
  sectionKey: text('section_key').unique().notNull(),
  label: text('label').notNull(),
  mediaId: text('media_id').references(() => media.id, { onDelete: 'set null' }),
  metaJson: text('meta_json'),
});

export const beautyServices = sqliteTable('beauty_services', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon'),
  mediaId: text('media_id').references(() => media.id, { onDelete: 'set null' }),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: integer('is_active').default(1).notNull(),
});

export const galleryItems = sqliteTable('gallery_items', {
  id: text('id').primaryKey(),
  mediaId: text('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  caption: text('caption'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: integer('is_active').default(1).notNull(),
});

export const inventory = sqliteTable('inventory', {
  id: text('id').primaryKey(),
  productId: text('product_id').unique().notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').default(0).notNull(),
});

// ─── RELATIONS ─────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  inventory: one(inventory, { fields: [products.id], references: [inventory.productId] }),
}));

export const mediaRelations = relations(media, ({ many }) => ({
  productImages: many(productImages),
  siteSections: many(siteSections),
  beautyServices: many(beautyServices),
  galleryItems: many(galleryItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
  media: one(media, { fields: [productImages.mediaId], references: [media.id] }),
}));

export const siteSectionsRelations = relations(siteSections, ({ one }) => ({
  media: one(media, { fields: [siteSections.mediaId], references: [media.id] }),
}));

export const beautyServicesRelations = relations(beautyServices, ({ one }) => ({
  media: one(media, { fields: [beautyServices.mediaId], references: [media.id] }),
}));

export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  media: one(media, { fields: [galleryItems.mediaId], references: [media.id] }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, { fields: [inventory.productId], references: [products.id] }),
}));

// ─── PROMOTIONS (COUPONS) ──────────────────────────────────────────────────
export const coupons = sqliteTable('coupons', {
  id: text('id').primaryKey(),
  code: text('code').unique().notNull(), // ex: DIVAY20
  discountPct: integer('discount_pct'), // Pourcentage de réduction (ex: 20)
  discountFix: integer('discount_fix'), // Réduction fixe en centimes
  usageLimit: integer('usage_limit'), // Limite d'utilisation (null = illimité)
  usedCount: integer('used_count').default(0).notNull(),
  isActive: integer('is_active').default(1).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

// ─── COMMANDES ─────────────────────────────────────────────────────────────
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').unique().notNull(), // ex: DIV-8A3B
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }), // null si achat invité
  status: text('status').default('PENDING').notNull(),
  totalMinor: integer('total_minor').notNull(),
  currency: text('currency').default('USD').notNull(),
  paymentMethod: text('payment_method').default('COD').notNull(),
  
  // Infos livraison snapshot
  shippingName: text('shipping_name').notNull(),
  shippingEmail: text('shipping_email').notNull(),
  shippingPhone: text('shipping_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  shippingCity: text('shipping_city').notNull(),
  
  stripeSessionId: text('stripe_session_id'),
  trackingNote: text('tracking_note'), // "Colis remis au livreur..."
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export const orderLines = sqliteTable('order_lines', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: text('product_name').notNull(), // Snapshot du nom au moment de l'achat
  quantity: integer('quantity').notNull(),
  priceMinor: integer('price_minor').notNull(), // Snapshot du prix
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  lines: many(orderLines),
}));

export const orderLinesRelations = relations(orderLines, ({ one }) => ({
  order: one(orders, { fields: [orderLines.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderLines.productId], references: [products.id] }),
}));

// ─── RENDEZ-VOUS (RÉSERVATIONS DE PRESTATIONS) ─────────────────────────────
export const appointments = sqliteTable('appointments', {
  id: text('id').primaryKey(),
  reference: text('reference').unique().notNull(), // ex: RDV-7K2F
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  serviceSlug: text('service_slug').notNull(),
  serviceName: text('service_name').notNull(), // snapshot
  priceFc: integer('price_fc').notNull(), // snapshot
  date: text('date').notNull(), // YYYY-MM-DD
  time: text('time').notNull(), // HH:MM
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  notes: text('notes'),
  status: text('status').default('PENDING').notNull(), // PENDING | CONFIRMED | DONE | CANCELLED
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});
// ─── JOURNAL ────────────────────────────────────────────────────────────────
export const articles = sqliteTable('articles', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  coverUrl: text('cover_url'),
  authorName: text('author_name'),
  published: integer('published').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ─── NEWSLETTER ────────────────────────────────────────────────────────────
export const newsletter = sqliteTable('newsletter', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});