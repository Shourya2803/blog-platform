# 📝 Blog Management System

This is a **Next.js** project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).  
It’s a full-stack **Blog Management System** built with **Next.js**, **tRPC**, **Drizzle ORM**, **Zod**, **shadcn/ui**, and **Cloudinary** — allowing users to **create**, **edit**, **save drafts**, and **publish blogs** seamlessly.

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone <your-repo-link>
cd blog-management
2️⃣ Install dependencies
bash
Copy code
npm install
# or
yarn install
# or
pnpm install
3️⃣ Set up environment variables
Create a .env file in the root directory and add:

bash
Copy code
DATABASE_URL=your_database_url
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
4️⃣ Run database migrations (if using Drizzle)
bash
Copy code
npm run db:push
5️⃣ Run the development server
bash
Copy code
npm run dev
# or
yarn dev
# or
pnpm dev
Now open http://localhost:3000 to view the app in your browser.

🧰 Tech Stack Used
⚛️ Next.js 14 – App Router for full-stack React

⚡ tRPC – Type-safe APIs between frontend and backend

🪶 Drizzle ORM – Lightweight SQL ORM

🧩 Zod – Schema validation

🎨 shadcn/ui – Reusable accessible UI components

☁️ Cloudinary – Image upload & optimization

🧠 Framer Motion – Smooth UI animations

💾 PostgreSQL – Database

✨ Features Implemented
🥇 Priority 1 – Core Features
✅ Create new blog posts with title, content, categories, and image

✅ Upload images using Cloudinary

✅ Validation using Zod

✅ View all published blogs

🥈 Priority 2 – Editing & Draft Management
✅ Edit existing blogs (title, content, categories, publish status)

✅ Draft system: posts with published = false shown on a separate Drafts Page

✅ Individual detailed blog page

🥉 Priority 3 – UI & Extras
✅ Modern UI built with shadcn/ui and Tailwind CSS

✅ Framer Motion animations for transitions

✅ Word count and estimated reading time

✅ Responsive design for mobile and desktop

⚖️ Trade-offs & Design Decisions
Chose tRPC for direct type-safe communication instead of REST for simplicity and safety.

Used Drizzle ORM for lightweight schema control and SQL visibility.

Skipped image editing in edit mode to reduce complexity.

Stored drafts and published posts in the same table to simplify schema and filtering logic.

⏱️ Time Spent
Task	Time
Setting up project & DB schema	2 hrs
Building API routes with tRPC	3 hrs
Integrating Cloudinary upload	1 hr
UI development with shadcn/ui	3 hrs
Adding edit & draft functionality	2 hrs
Testing & documentation	1 hr

📦 Deployment
You can deploy this project easily using Vercel:

Push your repository to GitHub

Connect your repo on Vercel

Add the same .env variables in Vercel dashboard

Deploy 🚀

📚 Learn More
To learn more about the main tools used:

Next.js Documentation

tRPC Docs

Drizzle ORM

Zod Validation

shadcn/ui

Cloudinary Docs

🧑‍💻 Author
Made with ❤️ by Shourya Mittal

yaml
Copy code

---

Would you like me to also generate a **short version** (for submission or repo overview) below thi
