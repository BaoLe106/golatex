--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg120+1)
-- Dumped by pg_dump version 17.2 (Debian 17.2-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: document_info; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.document_info (
    document_id uuid NOT NULL,
    user_id uuid,
    email character varying(255),
    is_tex_on_s3 boolean DEFAULT false NOT NULL,
    is_pdf_on_s3 boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_compiled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.document_info OWNER TO admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO admin;

--
-- Data for Name: document_info; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.document_info (document_id, user_id, email, is_tex_on_s3, is_pdf_on_s3, created_at, last_compiled_at) FROM stdin;
5ab97135-825d-420e-b60b-2ded2117ba49	\N	\N	t	f	2025-02-05 01:01:51.139144	2025-02-05 01:01:51.139144
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.schema_migrations (version, dirty) FROM stdin;
1	f
\.


--
-- Name: document_info document_info_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document_info
    ADD CONSTRAINT document_info_pkey PRIMARY KEY (document_id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- PostgreSQL database dump complete
--

