import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("client"),
  avatar: text("avatar"),
  company: text("company"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  avatar: true,
  company: true,
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planning"),
  progress: integer("progress").notNull().default(0),
  dueDate: text("due_date"),
  createdAt: text("created_at").notNull(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  team: json("team").notNull().default([]),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  status: true,
  progress: true,
  dueDate: true,
  createdAt: true,
  createdBy: true,
  team: true,
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  assignedTo: integer("assigned_to")
    .references(() => users.id),
  dueDate: text("due_date"),
  status: text("status").notNull().default("todo"),
  boardColumn: text("board_column").notNull().default("todo"),
  priority: text("priority").default("medium"),
  labels: json("labels").default([]),
  completed: boolean("completed").notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  order: integer("order").default(0),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  projectId: true,
  assignedTo: true,
  dueDate: true,
  status: true,
  boardColumn: true,
  priority: true,
  labels: true,
  completed: true,
  createdAt: true,
  updatedAt: true,
  order: true,
});

// Files table
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fileType: text("file_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  projectId: integer("project_id")
    .references(() => projects.id),
  uploadedBy: integer("uploaded_by")
    .notNull()
    .references(() => users.id),
  uploadedAt: text("uploaded_at").notNull(),
  status: text("status").notNull().default("draft"),
});

export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  fileType: true,
  size: true,
  path: true,
  projectId: true,
  uploadedBy: true,
  uploadedAt: true,
  status: true,
});

// Comments table - for design reviews
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  fileId: integer("file_id")
    .notNull()
    .references(() => files.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").notNull(),
  positionX: integer("position_x"),
  positionY: integer("position_y"),
  resolved: boolean("resolved").notNull().default(false),
  resolvedBy: integer("resolved_by")
    .references(() => users.id),
  resolvedAt: text("resolved_at"),
  resolvedNote: text("resolved_note"),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  fileId: true,
  userId: true,
  createdAt: true,
  positionX: true,
  positionY: true,
  resolved: true,
  resolvedBy: true,
  resolvedAt: true,
  resolvedNote: true,
});

// Activity log
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  projectId: integer("project_id")
    .references(() => projects.id),
  resourceId: integer("resource_id"),
  resourceType: text("resource_type"),
  createdAt: text("created_at").notNull(),
  metadata: json("metadata"),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  description: true,
  userId: true,
  projectId: true,
  resourceId: true,
  resourceType: true,
  createdAt: true,
  metadata: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// ---- LMS Schema ----

// Course categories table
export const courseCategories = pgTable("course_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// LMS - Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  coverImage: text("cover_image"),
  level: text("level").default("beginner"),
  price: integer("price").default(0),
  isPublished: boolean("is_published").default(false),
  instructorId: integer("instructor_id")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  duration: integer("duration"), // in minutes
  categoryId: integer("category_id"),
  prerequisites: json("prerequisites").default([]),
  tags: json("tags").default([]),
  featured: boolean("featured").default(false),
  enrollmentCount: integer("enrollment_count").default(0),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  slug: true,
  coverImage: true,
  level: true,
  price: true,
  isPublished: true,
  instructorId: true,
  createdAt: true,
  updatedAt: true,
  duration: true,
  categoryId: true,
  prerequisites: true,
  tags: true,
  featured: true,
});

export const insertCourseCategorySchema = createInsertSchema(courseCategories).pick({
  name: true,
  slug: true,
  description: true,
  icon: true,
});

// Course sections table
export const courseSections = pgTable("course_sections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  order: integer("order").default(0),
});

export const insertCourseSectionSchema = createInsertSchema(courseSections).pick({
  title: true,
  description: true,
  courseId: true,
  order: true,
});

// Course lessons table
export const courseLessons = pgTable("course_lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  duration: integer("duration"), // in seconds
  sectionId: integer("section_id")
    .notNull()
    .references(() => courseSections.id),
  order: integer("order").default(0),
  status: text("status").default("draft"),
  isPreview: boolean("is_preview").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCourseLessonSchema = createInsertSchema(courseLessons).pick({
  title: true,
  slug: true,
  content: true,
  videoUrl: true,
  duration: true,
  sectionId: true,
  order: true,
  status: true,
  isPreview: true,
});

// Course enrollments table
export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  enrolledAt: timestamp("enrolled_at", { mode: "date", withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { mode: "date", withTimezone: true }),
  progress: integer("progress").default(0), // percentage
  completedLessons: json("completed_lessons").default({}),
  status: text("status").default("active"), // active, completed, abandoned
  certificate: text("certificate"),
});

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments).pick({
  userId: true,
  courseId: true,
  enrolledAt: true,
  completedAt: true,
  progress: true,
  completedLessons: true,
  status: true,
  certificate: true,
});

// Course progress table - tracks individual lesson completion
export const courseProgress = pgTable("course_progress", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id")
    .notNull()
    .references(() => courseEnrollments.id),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => courseLessons.id),
  completed: boolean("completed").default(false),
  completedAt: text("completed_at"),
  timeSpent: integer("time_spent").default(0), // in seconds
  lastPosition: integer("last_position").default(0), // for video progress tracking
});

export const insertCourseProgressSchema = createInsertSchema(courseProgress).pick({
  enrollmentId: true,
  lessonId: true,
  completed: true,
  completedAt: true,
  timeSpent: true,
  lastPosition: true,
});

// Course reviews table
export const courseReviews = pgTable("course_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
});

export const insertCourseReviewSchema = createInsertSchema(courseReviews).pick({
  userId: true,
  courseId: true,
  rating: true,
  review: true,
  createdAt: true,
  updatedAt: true,
});

// Course quizzes table
export const courseQuizzes = pgTable("course_quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  lessonId: integer("lesson_id")
    .references(() => courseLessons.id),
  timeLimit: integer("time_limit"), // in seconds, null means no limit
  passingScore: integer("passing_score").default(70), // percentage
  attemptsAllowed: integer("attempts_allowed").default(3),
  randomizeQuestions: boolean("randomize_questions").default(false),
});

export const insertCourseQuizSchema = createInsertSchema(courseQuizzes).pick({
  title: true,
  description: true,
  lessonId: true,
  timeLimit: true,
  passingScore: true,
  attemptsAllowed: true,
  randomizeQuestions: true,
});

// Quiz questions table
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => courseQuizzes.id),
  question: text("question").notNull(),
  type: text("type").notNull().default("multiple_choice"), // multiple_choice, true_false, fill_blank, etc.
  options: json("options").default([]),
  correctAnswer: json("correct_answer").notNull(),
  explanation: text("explanation"),
  points: integer("points").default(1),
  order: integer("order").default(0),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).pick({
  quizId: true,
  question: true,
  type: true,
  options: true,
  correctAnswer: true,
  explanation: true,
  points: true,
  order: true,
});

// Quiz attempts table
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => courseQuizzes.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  score: integer("score"),
  totalPoints: integer("total_points"),
  passed: boolean("passed"),
  timeSpent: integer("time_spent"), // in seconds
  answers: json("answers").default([]),
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).pick({
  quizId: true,
  userId: true,
  startedAt: true,
  completedAt: true,
  score: true,
  totalPoints: true,
  passed: true,
  timeSpent: true,
  answers: true,
});

// Certificates table
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  certificateNumber: text("certificate_number").notNull().unique(),
  issuedAt: text("issued_at").notNull(),
  expiresAt: text("expires_at"),
  pdfUrl: text("pdf_url"),
  metadata: json("metadata").default({}),
});

export const insertCertificateSchema = createInsertSchema(certificates).pick({
  userId: true,
  courseId: true,
  certificateNumber: true,
  issuedAt: true,
  expiresAt: true,
  pdfUrl: true,
  metadata: true,
});

// LMS Types
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type CourseCategory = typeof courseCategories.$inferSelect;
export type InsertCourseCategory = z.infer<typeof insertCourseCategorySchema>;

export type CourseSection = typeof courseSections.$inferSelect;
export type InsertCourseSection = z.infer<typeof insertCourseSectionSchema>;

export type CourseLesson = typeof courseLessons.$inferSelect;
export type InsertCourseLesson = z.infer<typeof insertCourseLessonSchema>;

export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;

export type CourseProgress = typeof courseProgress.$inferSelect;
export type InsertCourseProgress = z.infer<typeof insertCourseProgressSchema>;

export type CourseReview = typeof courseReviews.$inferSelect;
export type InsertCourseReview = z.infer<typeof insertCourseReviewSchema>;

export type CourseQuiz = typeof courseQuizzes.$inferSelect;
export type InsertCourseQuiz = z.infer<typeof insertCourseQuizSchema>;

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;

// ---- Design Review and Annotation Schema ----

// Designs table
export const designs = pgTable("designs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  version: integer("version").default(1),
  status: text("status").notNull().default("draft"), // draft, in-review, approved, rejected
  projectId: integer("project_id")
    .references(() => projects.id),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  width: integer("width"),
  height: integer("height"),
  tags: json("tags").default([]),
});

export const insertDesignSchema = createInsertSchema(designs).pick({
  title: true,
  description: true,
  imageUrl: true,
  thumbnailUrl: true,
  version: true,
  status: true,
  projectId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  width: true,
  height: true,
  tags: true,
});

// Annotations table
export const annotations = pgTable("annotations", {
  id: serial("id").primaryKey(),
  designId: integer("design_id")
    .notNull()
    .references(() => designs.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  x: integer("x").notNull(), // X coordinate on the design
  y: integer("y").notNull(), // Y coordinate on the design
  width: integer("width").default(150), // Width of annotation box
  height: integer("height").default(80), // Height of annotation box
  color: varchar("color", { length: 7 }).default("#FF5733"), // Hex color code
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  resolved: boolean("resolved").default(false),
  resolvedBy: integer("resolved_by")
    .references(() => users.id),
  resolvedAt: text("resolved_at"),
  shape: text("shape").default("rectangle"), // rectangle, circle, arrow, freeform
  pathData: text("path_data"), // SVG path data for freeform shapes
  replies: json("replies").default([]),
});

export const insertAnnotationSchema = createInsertSchema(annotations).pick({
  designId: true,
  userId: true,
  content: true,
  x: true,
  y: true,
  width: true,
  height: true,
  color: true,
  createdAt: true,
  updatedAt: true,
  resolved: true,
  resolvedBy: true,
  resolvedAt: true,
  shape: true,
  pathData: true,
  replies: true,
});

// Design versions table
export const designVersions = pgTable("design_versions", {
  id: serial("id").primaryKey(),
  designId: integer("design_id")
    .notNull()
    .references(() => designs.id),
  versionNumber: integer("version_number").notNull(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").notNull(),
  notes: text("notes"),
  width: integer("width"),
  height: integer("height"),
});

export const insertDesignVersionSchema = createInsertSchema(designVersions).pick({
  designId: true,
  versionNumber: true,
  imageUrl: true,
  thumbnailUrl: true,
  createdBy: true,
  createdAt: true,
  notes: true,
  width: true,
  height: true,
});

// Design approvals table
export const designApprovals = pgTable("design_approvals", {
  id: serial("id").primaryKey(),
  designId: integer("design_id")
    .notNull()
    .references(() => designs.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull(), // approved, rejected, needs-changes
  comment: text("comment"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
});

export const insertDesignApprovalSchema = createInsertSchema(designApprovals).pick({
  designId: true,
  userId: true,
  status: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
});

// Design collaboration settings
export const designCollaboration = pgTable("design_collaboration", {
  id: serial("id").primaryKey(),
  designId: integer("design_id")
    .notNull()
    .references(() => designs.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull().default("viewer"), // owner, editor, reviewer, viewer
  addedBy: integer("added_by")
    .notNull()
    .references(() => users.id),
  addedAt: text("added_at").notNull(),
  notificationsEnabled: boolean("notifications_enabled").default(true),
});

export const insertDesignCollaborationSchema = createInsertSchema(designCollaboration).pick({
  designId: true,
  userId: true,
  role: true,
  addedBy: true,
  addedAt: true,
  notificationsEnabled: true,
});

// Design Review Types
export type Design = typeof designs.$inferSelect;
export type InsertDesign = z.infer<typeof insertDesignSchema>;

export type Annotation = typeof annotations.$inferSelect;
export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;

export type DesignVersion = typeof designVersions.$inferSelect;
export type InsertDesignVersion = z.infer<typeof insertDesignVersionSchema>;

export type DesignApproval = typeof designApprovals.$inferSelect;
export type InsertDesignApproval = z.infer<typeof insertDesignApprovalSchema>;

export type DesignCollaboration = typeof designCollaboration.$inferSelect;
export type InsertDesignCollaboration = z.infer<typeof insertDesignCollaborationSchema>;
