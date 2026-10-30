CREATE TABLE "public"."anamnesis" (
  "id"            uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "user_id"       uuid,
  "weight"        numeric,
  "height"        numeric,
  "injuries"      text,
  "days_per_week" integer,
  "par_q_data"    jsonb,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "birth_date"    date,
  "ai_analysis"   text,
  CONSTRAINT "anamnesis_pkey" PRIMARY KEY (id),
  CONSTRAINT "anamnesis_user_id_unique" UNIQUE (user_id)
);

ALTER TABLE "public"."anamnesis"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."assessments" (
  "id"              uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "user_id"         uuid,
  "assessment_date" date                     NOT NULL,
  "weight"          numeric,
  "body_fat"        numeric,
  "lean_mass"       numeric,
  "photo_url"       text,
  "created_at"      timestamp with time zone DEFAULT now(),
  CONSTRAINT "assessments_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."assessments"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."evaluations" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "date"       text                     NOT NULL,
  "weight"     numeric,
  "body_fat"   numeric,
  "lean_mass"  numeric,
  "waist"      numeric,
  "photo_url"  text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "evaluations_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."evaluations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."exercise_logs" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"            uuid                     NOT NULL,
  "exercise_id"        uuid                     NOT NULL,
  "workout_id"         uuid                     NOT NULL,
  "weight_used"        text,
  "completed_at"       timestamp with time zone DEFAULT now(),
  "workout_session_id" uuid,
  CONSTRAINT "exercise_logs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."exercise_logs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."exercises" (
  "id"               uuid    NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "workout_id"       uuid,
  "name"             text    NOT NULL,
  "sets"             text,
  "reps"             text,
  "rest"             text,
  "note"             text,
  "video_url"        text,
  "order_index"      integer,
  "illustration_url" text,
  "muscle_group"     text,
  "description"      text,
  CONSTRAINT "exercises_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."exercises"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."notifications" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "title"      text                     NOT NULL,
  "message"    text                     NOT NULL,
  "is_read"    boolean                  DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "notifications_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."notifications"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."plans" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       text                     NOT NULL,
  "price"      numeric(10,2)            NOT NULL,
  "cycle"      text                     NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "plans_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."plans"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."push_subscriptions" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid,
  "endpoint"   text                     NOT NULL,
  "p256dh"     text                     NOT NULL,
  "auth"       text                     NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "push_subscriptions_endpoint_key" UNIQUE (endpoint),
  CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."push_subscriptions"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."users" (
  "id"             uuid                     NOT NULL,
  "role"           text                     DEFAULT 'student'::text,
  "full_name"      text                     NOT NULL,
  "objective"      text,
  "plan_status"    text                     DEFAULT 'pending'::text,
  "expire_date"    date,
  "created_at"     timestamp with time zone DEFAULT now(),
  "plan_name"      text                     DEFAULT 'Mensal'::text,
  "plan_value"     numeric                  DEFAULT 150,
  "avatar_url"     text,
  "pix_key"        text,
  "is_first_login" boolean                  DEFAULT true,
  CONSTRAINT "users_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."users"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."workout_sessions" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "workout_id"     uuid                     NOT NULL,
  "started_at"     timestamp with time zone NOT NULL,
  "completed_at"   timestamp with time zone NOT NULL,
  "total_duration" integer                  NOT NULL,
  "created_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "workout_sessions_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."workout_sessions"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."workouts" (
  "id"          uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "user_id"     uuid,
  "title"       text                     NOT NULL,
  "is_ai_draft" boolean                  DEFAULT false,
  "status"      text                     DEFAULT 'draft'::text,
  "created_at"  timestamp with time zone DEFAULT now(),
  "icon"        character varying(10),
  "ai_notes"    text,
  CONSTRAINT "workouts_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."workouts"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."evaluations"
  ADD CONSTRAINT "evaluations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."exercise_logs"
  ADD CONSTRAINT "exercise_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."exercise_logs"
  ADD CONSTRAINT "exercise_logs_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;

ALTER TABLE "public"."notifications"
  ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."users"
  ADD CONSTRAINT "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id);

ALTER TABLE "public"."anamnesis"
  ADD CONSTRAINT "anamnesis_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE "public"."assessments"
  ADD CONSTRAINT "assessments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE "public"."push_subscriptions"
  ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."exercise_logs"
  ADD CONSTRAINT "exercise_logs_workout_session_id_fkey" FOREIGN KEY (workout_session_id) REFERENCES public.workout_sessions(id) ON DELETE CASCADE;

ALTER TABLE "public"."exercise_logs"
  ADD CONSTRAINT "exercise_logs_workout_id_fkey" FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;

ALTER TABLE "public"."exercises"
  ADD CONSTRAINT "exercises_workout_id_fkey" FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;

ALTER TABLE "public"."workouts"
  ADD CONSTRAINT "workouts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id);

CREATE INDEX exercise_logs_session_idx ON public.exercise_logs USING btree (workout_session_id);

CREATE INDEX exercise_logs_user_exercise_idx ON public.exercise_logs USING btree (user_id, exercise_id, completed_at DESC);

CREATE INDEX idx_evaluations_user_id ON public.evaluations USING btree (user_id);

CREATE INDEX idx_exercise_logs_user_id ON public.exercise_logs USING btree (user_id);

CREATE INDEX idx_exercise_logs_workout_id ON public.exercise_logs USING btree (workout_id);

CREATE INDEX idx_exercises_workout_id ON public.exercises USING btree (workout_id);

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id)
  WHERE (is_read = false);

CREATE INDEX idx_users_role ON public.users USING btree (ROLE);

CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions USING btree (user_id);

CREATE INDEX idx_workout_sessions_workout_id ON public.workout_sessions USING btree (workout_id);

CREATE INDEX idx_workouts_status ON public.workouts USING btree (status);

CREATE INDEX idx_workouts_user_id ON public.workouts USING btree (user_id);

CREATE POLICY "evaluations_select_own" ON "public"."evaluations"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "exercise_logs_delete_own" ON "public"."exercise_logs"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "exercise_logs_insert_own" ON "public"."exercise_logs"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "exercise_logs_select_own" ON "public"."exercise_logs"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "exercises_select_own" ON "public"."exercises"
  FOR SELECT
  TO PUBLIC
  USING (((workout_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.workouts
  WHERE ((workouts.id = exercises.workout_id) AND (workouts.user_id = auth.uid()))))));

CREATE POLICY "exercises_select_via_workout" ON "public"."exercises"
  FOR SELECT
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.workouts
  WHERE ((workouts.id = exercises.workout_id) AND (workouts.user_id = auth.uid())))));

CREATE POLICY "notifications_select_own" ON "public"."notifications"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "notifications_update_own" ON "public"."notifications"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "plans_select_all" ON "public"."plans"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "plans_select_authenticated" ON "public"."plans"
  FOR SELECT
  TO PUBLIC
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "users_select_own" ON "public"."users"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = id));

CREATE POLICY "users_update_own" ON "public"."users"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = id));

CREATE POLICY "workouts_select_own" ON "public"."workouts"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "allow authenticated uploads 1qdy59v_0" ON "storage"."objects"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "allow authenticated uploads 1qdy59v_1" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (true);

CREATE POLICY "allow authenticated uploads 1qdy59v_2" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING (true);

CREATE POLICY "allow authenticated uploads 1qdy59v_3" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING (true);

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."anamnesis";

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."users";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."anamnesis" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."anamnesis" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."anamnesis" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."anamnesis" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."assessments" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."assessments" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."assessments" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."assessments" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."evaluations" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."evaluations" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."evaluations" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."evaluations" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."exercise_logs" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."exercise_logs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."exercise_logs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."exercise_logs" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."exercises" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."exercises" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."exercises" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."exercises" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."notifications" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."notifications" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."notifications" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."notifications" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."plans" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."plans" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."plans" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."plans" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."push_subscriptions" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."push_subscriptions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."push_subscriptions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."push_subscriptions" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."users" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workout_sessions" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."workout_sessions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workout_sessions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workout_sessions" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workouts" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."workouts" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workouts" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workouts" TO "service_role";

