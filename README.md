# InventorySys

A modern inventory management system built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

- User authentication and registration
- Product management (add, edit, delete products)
- Category management
- Stock transaction tracking
- Dashboard with overview
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Supabase account

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Manoj-ku22/InventorySys.git
   cd InventorySys
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Supabase:

   - Create a new project on [Supabase](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Create a `.env` file in the root directory and add:

     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

   - Install Supabase CLI if you haven't:

     ```bash
     npm install -g supabase
     ```

   - Link your project:

     ```bash
     supabase link --project-ref your_project_ref
     ```

   - Run the migration to set up the database:

     ```bash
     supabase db push
     ```

4. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

- `src/components/` - Reusable React components (modals, layout)
- `src/pages/` - Main page components (Dashboard, Products, etc.)
- `src/contexts/` - React contexts for state management (Auth)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility libraries (Supabase client)
- `src/types/` - TypeScript type definitions
- `supabase/migrations/` - Database schema migrations

## Technologies Used

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Icons:** Lucide React
- **Linting:** ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.