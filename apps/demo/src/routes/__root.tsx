import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router'
import '@zixiao-labs/react/styles.css'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Zixiao UI — 多一种表达' },
      {
        name: 'description',
        content: '@zixiao-labs 多风格 React 组件实验室。一套组件 API，多种设计表达。',
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="about-page">
      <p className="eyebrow">404 / NOT FOUND</p>
      <h1>这个页面还不存在。</h1>
      <Link to="/">返回组件实验室 →</Link>
    </main>
  ),
  component: Root,
})

function Root() {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          跳转到内容
        </a>
        <header className="site-header">
          <Link className="brand" to="/" aria-label="Zixiao UI 首页">
            <span className="brand-mark" aria-hidden="true">
              z.
            </span>
            <span>
              ZIXIAO<span className="brand-divider"> / </span>UI LAB
            </span>
          </Link>
          <nav aria-label="主导航">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'is-active' }}>
              组件实验室
            </Link>
            <Link to="/about" activeProps={{ className: 'is-active' }}>
              设计原则
            </Link>
          </nav>
          <span className="version-tag">
            v0.0.0 <span> / STARTER</span>
          </span>
        </header>
        <div id="main-content" tabIndex={-1}>
          <Outlet />
        </div>
        <footer className="site-footer">
          <span>@zixiao-labs / 用一致的基础，创造不同的表达。</span>
          <span>React 19 · Nasti · Oxc</span>
        </footer>
        <Scripts />
      </body>
    </html>
  )
}
