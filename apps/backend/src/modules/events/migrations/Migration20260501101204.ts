import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260501101204 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "event" ("id" text not null, "slug" text not null, "title_de" text not null, "title_es" text not null, "description_de" text not null, "description_es" text not null, "starts_at" timestamptz not null, "ends_at" timestamptz null, "location" text null, "cover_image_url" text null, "is_published" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_event_deleted_at" ON "event" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "event" cascade;`);
  }

}
