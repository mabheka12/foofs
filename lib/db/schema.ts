// lib/db/schema.ts
import { 
  pgTable, 
  serial, 
  text, 
  varchar, 
  numeric, 
  boolean, 
  timestamp, 
  jsonb, 
  integer,
  uniqueIndex,
  primaryKey
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const states = pgTable('states', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  abbreviation: varchar('abbreviation', { length: 2 }).notNull().unique(),
  description: text('description'),
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  stateId: integer('state_id').references(() => states.id, { onDelete: 'cascade' }).notNull(),
  county: varchar('county', { length: 100 }),
  population: integer('population'),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  description: text('description'),
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueStateCity: uniqueIndex('unique_state_city').on(table.stateId, table.slug),
}))

export const contractors = pgTable('contractors', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  businessName: varchar('business_name', { length: 200 }),
  description: text('description'),
  address: text('address'),
  cityId: integer('city_id').references(() => cities.id, { onDelete: 'cascade' }).notNull(),
  stateId: integer('state_id').references(() => states.id, { onDelete: 'cascade' }).notNull(),
  zipCode: varchar('zip_code', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  website: varchar('website', { length: 200 }),
  googleMapsUrl: text('google_maps_url'),
  googlePlaceId: varchar('google_place_id', { length: 100 }),
  rating: numeric('rating', { precision: 3, scale: 1 }),
  reviewCount: integer('review_count').default(0),
  licenseNumber: varchar('license_number', { length: 50 }),
  insuranceVerified: boolean('insurance_verified').default(false),
  yearsInBusiness: integer('years_in_business'),
  servicesOffered: jsonb('services_offered').$type<string[]>(),
  serviceAreas: jsonb('service_areas').$type<string[]>(),
  emergencyService: boolean('emergency_service').default(false),
  freeEstimates: boolean('free_estimates').default(false),
  financingAvailable: boolean('financing_available').default(false),
  warrantyOffered: boolean('warranty_offered').default(false),
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: text('meta_description'),
  featured: boolean('featured').default(false),
  verified: boolean('verified').default(false),
  published: boolean('published').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueStateCitySlug: uniqueIndex('unique_state_city_slug').on(table.stateId, table.cityId, table.slug),
}))

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  contractorId: integer('contractor_id').references(() => contractors.id, { onDelete: 'cascade' }).notNull(),
  authorName: varchar('author_name', { length: 100 }),
  rating: integer('rating').notNull(),
  content: text('content'),
  googleReviewId: varchar('google_review_id', { length: 100 }),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  featuredImage: text('featured_image'),
  author: varchar('author', { length: 100 }),
  stateId: integer('state_id').references(() => states.id, { onDelete: 'set null' }),
  cityId: integer('city_id').references(() => cities.id, { onDelete: 'set null' }),
  tags: jsonb('tags').$type<string[]>(),
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: text('meta_description'),
  published: boolean('published').default(true),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const serviceTypes = pgTable('service_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const contractorServices = pgTable('contractor_services', {
  contractorId: integer('contractor_id').references(() => contractors.id, { onDelete: 'cascade' }).notNull(),
  serviceTypeId: integer('service_type_id').references(() => serviceTypes.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.contractorId, table.serviceTypeId] }),
}))

// Relations
export const statesRelations = relations(states, ({ many }) => ({
  cities: many(cities),
  contractors: many(contractors),
  blogPosts: many(blogPosts),
}))

export const citiesRelations = relations(cities, ({ one, many }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id],
  }),
  contractors: many(contractors),
  blogPosts: many(blogPosts),
}))

export const contractorsRelations = relations(contractors, ({ one, many }) => ({
  city: one(cities, {
    fields: [contractors.cityId],
    references: [cities.id],
  }),
  state: one(states, {
    fields: [contractors.stateId],
    references: [states.id],
  }),
  reviews: many(reviews),
  services: many(serviceTypes, {
    relationName: 'contractorServices',
  }),
}))