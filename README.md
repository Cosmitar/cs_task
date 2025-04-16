# CS Test Task
live version: [https://cs-task-psi.vercel.app](cs-task-psi.vercel.app)

## Development

- clone this repo
- install dependencies `npm install`
- config env vars (provided privately)
- run locally `npm run dev`

## Prisma Studio
- run `npx prisma studio`

Currently there's only one instance of the DB, the same for live version in Vercel.

## Deployment
- CI setup for deploying on Vercel everything pushed to main.

# **The Task: Develop a Basic Reddit Clone**

Your mission is to create a basic full stack reddit clone bootstrapped with [create t3 app](https://create.t3.gg/). As part of this task, you're expected to do the following:

1. **Create a relational database schema using [Prisma](https://www.prisma.io/) or [Drizzle ORM](https://orm.drizzle.team/):** The schema should include all the models that are necessary for the requirements below.
2. **Secure your app with authentication:** Some of the functionality should only be accessible to authenticated users - make sure to properly secure your application.
3. **Implement the provided UI designs one-to-one:** Follow the below UI designs and implement those one-to-one in the frontend of your application.

## UI Designs
https://www.figma.com/file/AbJgSOzRu7IQdJ6nXbaoXx/Test-Task---UI-Designs?type=design&node-id=10:242&mode=design&t=vP3CYe8v6u9t5FAy-1

## **Functional Requirements**

- **Reading Posts:** Allow all users to read posts (including not logged in ones)
- **Creating Posts:** Enable only logged-in users to create posts
- **Commenting:** Logged-in users should be able to comment on posts and other comments
- **Voting System:** Authenticated users can upvote or downvote posts and comments

## Technical Requirements

- Use [create t3 app](https://create.t3.gg/) to start your project
- Use [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com/) to implement the frontend
- Use the [Next.js App Router](https://nextjs.org/docs/app)
- Use [tRPC](https://trpc.io/) for the backend architecture
- Use [Prisma](https://www.prisma.io/) or [Drizzle](https://orm.drizzle.team/) to query the sql database
- Use [PlanetScale](https://planetscale.com/) or [Neon](https://neon.tech/) for your database
- Use [Clerk](https://clerk.com/) for user management and authentication

## Getting started

If you're unfamiliar with the technologies mentioned above or unsure how to use them, I recommend watching this tutorial first. It covers most of them in a comprehensive style and teaches you how to actually build something with them.
https://youtu.be/YkOSUVzOAA4

## Submission Guidelines

- Push your project to a public GitHub repository
- Use good commit standards
- Include a README on how to run the project
- Forward the repository link to me