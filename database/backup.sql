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
-- Name: file_info; Type: TABLE; Schema: public; Owner: golatex_admin
--

CREATE TABLE public.file_info (
    file_id uuid NOT NULL,
    project_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(10) NOT NULL,
    file_dir character varying(255) NOT NULL,
    content text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_updated_by uuid,
    last_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.file_info OWNER TO golatex_admin;

--
-- Name: project_info; Type: TABLE; Schema: public; Owner: golatex_admin
--

CREATE TABLE public.project_info (
    project_id uuid NOT NULL,
    project_name character varying(255) NOT NULL,
    project_tier character varying(10) NOT NULL,
    project_share_type smallint DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_updated_by uuid,
    last_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_info OWNER TO golatex_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: golatex_admin
--

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO golatex_admin;

--
-- Name: user_info; Type: TABLE; Schema: public; Owner: golatex_admin
--

CREATE TABLE public.user_info (
    user_id uuid NOT NULL,
    user_tier character varying(10) NOT NULL,
    subscription_end_time timestamp without time zone,
    email character varying(255),
    password character varying(255),
    is_confirmed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_info OWNER TO golatex_admin;

--
-- Name: user_project; Type: TABLE; Schema: public; Owner: golatex_admin
--

CREATE TABLE public.user_project (
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_project OWNER TO golatex_admin;

--
-- Data for Name: file_info; Type: TABLE DATA; Schema: public; Owner: golatex_admin
--

COPY public.file_info (file_id, project_id, file_name, file_type, file_dir, content, created_by, created_at, last_updated_by, last_updated_at) FROM stdin;
a2cccdae-4b70-40ce-a477-61978c668ea9	8d666504-ab03-4942-a8b3-81cfa9fe8472	aFolder	folder	/tmp/8d666504-ab03-4942-a8b3-81cfa9fe8472/aFolder		99c4c321-2e63-4325-a891-b31672dab356	2025-03-13 05:18:25.978849	99c4c321-2e63-4325-a891-b31672dab356	2025-03-13 05:18:25.978849
2865cbd7-eb29-4419-a4cc-bf8dd7da06ce	8d666504-ab03-4942-a8b3-81cfa9fe8472	aaa	cpp	/tmp/8d666504-ab03-4942-a8b3-81cfa9fe8472		dddd087f-114f-41dc-82ef-5c55c160016e	2025-03-13 05:18:33.30478	dddd087f-114f-41dc-82ef-5c55c160016e	2025-03-13 05:18:33.30478
12f55014-9587-482d-9576-9cb1e4ca2ec9	8d666504-ab03-4942-a8b3-81cfa9fe8472	bFolder	folder	/tmp/8d666504-ab03-4942-a8b3-81cfa9fe8472/bFolder		43db479f-fb27-4196-a25d-c703632b13a7	2025-03-13 05:18:40.382598	43db479f-fb27-4196-a25d-c703632b13a7	2025-03-13 05:18:40.382598
fe38fa88-3b36-4583-9f97-67db99ce98e6	8d666504-ab03-4942-a8b3-81cfa9fe8472	test	tex	/tmp/8d666504-ab03-4942-a8b3-81cfa9fe8472/bFolder		e746ed57-9055-495c-a2d1-a0e4c8fc46b4	2025-03-13 05:24:16.155411	e746ed57-9055-495c-a2d1-a0e4c8fc46b4	2025-03-13 05:24:16.155411
552308bb-167f-4dd1-8335-1d063b045fff	9e03955b-de0b-4991-a79c-2e3208cdc7dc	main	tex	/tmp/9e03955b-de0b-4991-a79c-2e3208cdc7dc	\\documentclass{article}\n\n\\title{kkk}\n\\author{Gia Bao Le}\n\\date{February 2025}\n\n\\begin{document}\n\n\\maketitle\n\n\\section{Introduction}\n\n\\end{document}	cf821c84-e228-4c3d-9ccd-d96ea9628882	2025-04-19 02:37:22.23645	cf821c84-e228-4c3d-9ccd-d96ea9628882	2025-04-19 02:37:22.23645
\.


--
-- Data for Name: project_info; Type: TABLE DATA; Schema: public; Owner: golatex_admin
--

COPY public.project_info (project_id, project_name, project_tier, project_share_type, created_by, created_at, last_updated_by, last_updated_at) FROM stdin;
8d666504-ab03-4942-a8b3-81cfa9fe8472	testProject	GUEST	0	\N	2025-03-13 13:18:18.01679	\N	2025-03-13 13:18:18.01679
2a7dc34a-2d0f-470c-88c9-d78749c628fc	testProjectFreeTier	FREE	1	\N	2025-03-13 13:18:18.01679	\N	2025-03-13 13:18:18.01679
9e03955b-de0b-4991-a79c-2e3208cdc7dc	testProd	FREE	1	cf821c84-e228-4c3d-9ccd-d96ea9628882	2025-04-13 11:46:26.107958	cf821c84-e228-4c3d-9ccd-d96ea9628882	2025-04-13 11:46:26.107958
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: golatex_admin
--

COPY public.schema_migrations (version, dirty) FROM stdin;
4	f
\.


--
-- Data for Name: user_info; Type: TABLE DATA; Schema: public; Owner: golatex_admin
--

COPY public.user_info (user_id, user_tier, subscription_end_time, email, password, is_confirmed, created_at, last_updated_at) FROM stdin;
cf821c84-e228-4c3d-9ccd-d96ea9628882	FREE	\N	lgbaoo.106@gmail.com	$2a$10$bfDXA0qtLHOWAlE/XKE4he0CHw0eN8d8KK3IYIKYXFB0TFvmeTyy6	t	2025-03-14 08:11:33.896147	2025-03-14 08:11:33.896147
\.


--
-- Data for Name: user_project; Type: TABLE DATA; Schema: public; Owner: golatex_admin
--

COPY public.user_project (project_id, user_id, email, created_at, last_updated_at) FROM stdin;
\.


--
-- Name: file_info file_info_pkey; Type: CONSTRAINT; Schema: public; Owner: golatex_admin
--

ALTER TABLE ONLY public.file_info
    ADD CONSTRAINT file_info_pkey PRIMARY KEY (file_id);


--
-- Name: project_info project_info_pkey; Type: CONSTRAINT; Schema: public; Owner: golatex_admin
--

ALTER TABLE ONLY public.project_info
    ADD CONSTRAINT project_info_pkey PRIMARY KEY (project_id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: golatex_admin
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: user_info user_info_pkey; Type: CONSTRAINT; Schema: public; Owner: golatex_admin
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_pkey PRIMARY KEY (user_id);


--
-- Name: file_info file_info_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: golatex_admin
--

ALTER TABLE ONLY public.file_info
    ADD CONSTRAINT file_info_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_info(project_id);


--
-- Name: user_project user_project_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: golatex_admin
--

ALTER TABLE ONLY public.user_project
    ADD CONSTRAINT user_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_info(project_id);


--
-- Name: user_project user_project_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: golatex_admin
--

ALTER TABLE ONLY public.user_project
    ADD CONSTRAINT user_project_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_info(user_id);


--
-- PostgreSQL database dump complete
--

