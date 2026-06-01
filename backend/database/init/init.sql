-- DROP TYPE public.transactiontype;

-- Включаем расширение для генерации UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE TYPE public.transactiontype AS ENUM (
	'income',
	'expense');
-- public.alembic_version определение

-- Drop table

-- DROP TABLE public.alembic_version;

CREATE TABLE public.alembic_version (
	version_num varchar(32) NOT NULL,
	CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);


-- public.users определение

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	"name" varchar(100) NOT NULL,
	email varchar(255) NOT NULL,
	hashed_password varchar(255) NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	is_deleted bool DEFAULT false NOT NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_is_deleted ON public.users USING btree (is_deleted);
CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);

-- Table Triggers

CREATE TRIGGER trigger_users_updated_at BEFORE
UPDATE
    ON
    public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- public.categories определение

-- Drop table

-- DROP TABLE public.categories;

CREATE TABLE public.categories (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" public.transactiontype NOT NULL,
	cat_limit numeric(10, 2) NULL,
	is_deleted bool DEFAULT false NOT NULL,
	icon_path varchar(255) DEFAULT 'default_icon'::character varying NOT NULL,
	background_color varchar(7) DEFAULT '#FFFFFF'::character varying NOT NULL,
	icon_color varchar(7) DEFAULT '#000000'::character varying NOT NULL,
	CONSTRAINT categories_cat_limit_check CHECK ((cat_limit >= (0)::numeric)),
	CONSTRAINT categories_pkey PRIMARY KEY (id),
	CONSTRAINT categories_type_check CHECK (((type)::text = ANY (ARRAY[('income'::character varying)::text, ('expense'::character varying)::text]))),
	CONSTRAINT categories_user_id_name_type_key UNIQUE (user_id, name, type),
	CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_categories_is_deleted ON public.categories USING btree (is_deleted);
CREATE INDEX idx_categories_user_id ON public.categories USING btree (user_id);


-- public.refresh_tokens определение

-- Drop table

-- DROP TABLE public.refresh_tokens;

CREATE TABLE public.refresh_tokens (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NOT NULL,
	"token" varchar(500) NOT NULL,
	expires_at timestamptz NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	revoked timestamptz NULL,
	CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
	CONSTRAINT refresh_tokens_token_key UNIQUE (token),
	CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_refresh_tokens_expires_revoked ON public.refresh_tokens USING btree (expires_at, revoked) WHERE (revoked IS NULL);
CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);
CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);
CREATE UNIQUE INDEX ix_refresh_tokens_token ON public.refresh_tokens USING btree (token);


-- public.transactions определение

-- Drop table

-- DROP TABLE public.transactions;

CREATE TABLE public.transactions (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NOT NULL,
	category_id uuid NULL,
	amount numeric(12, 2) NOT NULL,
	"type" public.transactiontype NOT NULL,
	transaction_date timestamptz NOT NULL,
	description text NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	is_deleted bool DEFAULT false NOT NULL,
	is_synced bool DEFAULT false NOT NULL,
	CONSTRAINT transactions_amount_check CHECK ((amount > (0)::numeric)),
	CONSTRAINT transactions_pkey PRIMARY KEY (id),
	CONSTRAINT transactions_type_check CHECK (((type)::text = ANY (ARRAY[('income'::character varying)::text, ('expense'::character varying)::text]))),
	CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL,
	CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_transactions_is_deleted ON public.transactions USING btree (is_deleted);
CREATE INDEX idx_transactions_user_category ON public.transactions USING btree (user_id, category_id);
CREATE INDEX idx_transactions_user_date ON public.transactions USING btree (user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_type ON public.transactions USING btree (user_id, type);

-- Table Triggers

CREATE TRIGGER trigger_transactions_updated_at BEFORE
UPDATE
    ON
    public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- DROP FUNCTION public.uuid_generate_v1();

CREATE OR REPLACE FUNCTION public.uuid_generate_v1()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1$function$
;

-- DROP FUNCTION public.uuid_generate_v1mc();

CREATE OR REPLACE FUNCTION public.uuid_generate_v1mc()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1mc$function$
;

-- DROP FUNCTION public.uuid_generate_v3(uuid, text);

CREATE OR REPLACE FUNCTION public.uuid_generate_v3(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v3$function$
;

-- DROP FUNCTION public.uuid_generate_v4();

CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v4$function$
;

-- DROP FUNCTION public.uuid_generate_v5(uuid, text);

CREATE OR REPLACE FUNCTION public.uuid_generate_v5(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v5$function$
;

-- DROP FUNCTION public.uuid_nil();

CREATE OR REPLACE FUNCTION public.uuid_nil()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_nil$function$
;

-- DROP FUNCTION public.uuid_ns_dns();

CREATE OR REPLACE FUNCTION public.uuid_ns_dns()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_dns$function$
;

-- DROP FUNCTION public.uuid_ns_oid();

CREATE OR REPLACE FUNCTION public.uuid_ns_oid()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_oid$function$
;

-- DROP FUNCTION public.uuid_ns_url();

CREATE OR REPLACE FUNCTION public.uuid_ns_url()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_url$function$
;

-- DROP FUNCTION public.uuid_ns_x500();

CREATE OR REPLACE FUNCTION public.uuid_ns_x500()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_x500$function$
;

-- Insert alembic versions to track applied migrations
INSERT INTO public.alembic_version (version_num) VALUES
('95a7ff1ffd91'),
('640d08a77405'),
('8f2c1a3b4d5e'),
('b18ed1c12f77'),
('34d6c7280467');