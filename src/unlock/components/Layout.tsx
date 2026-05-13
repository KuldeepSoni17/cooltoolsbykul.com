import { Link, NavLink, Outlet } from 'react-router-dom'
import { MVP_HUBS } from '../data/opportunities'

export function Layout() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <header className="border-b border-border bg-bg-primary/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="font-display text-lg font-bold tracking-tight">
            Unlock
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-xs">
            <NavLink
              to="/feed"
              className={({ isActive }) =>
                isActive ? 'text-accent-yellow' : 'text-text-secondary hover:text-text-primary'
              }
            >
              Feed
            </NavLink>
            {MVP_HUBS.map((h) => (
              <NavLink
                key={h.slug}
                to={`/hub/${h.slug}`}
                className={({ isActive }) =>
                  isActive ? 'text-accent-teal' : 'text-text-secondary hover:text-text-primary'
                }
              >
                {h.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-border py-8 text-center text-[11px] text-text-secondary">
        You already have more than you think.
      </footer>
    </div>
  )
}
