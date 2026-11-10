import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router'
import { I18nProvider } from '@zixiao-labs/ui-kits-react'
import { ThemeProvider } from '../theme'
import { ThemeModeSelect } from '../theme-mode-select'
import '@zixiao-labs/ui-kits-react/styles.css'
import '../styles.css'
import '../catalog.css'
import '../docs.css'
import '../theme-workbench.css'
import '../effects-workbench.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Zixiao Laboratories UI Kits — 多风格 React 组件库' },
      {
        name: 'description',
        content:
          'Zixiao Laboratories UI Kits：一套 React 组件 API，Clean、Endfield、鹤坡及室内变体、Minimal、Soft 与 Brutalist 多种风格，支持切换与局部混用。',
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
    <html lang="zh-CN" data-zx-style="clean">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <a className="skip-link" href="#main-content">
            跳转到内容
          </a>
          <header className="site-header">
            <Link className="brand" to="/" aria-label="Zixiao Laboratories UI Kits 首页">
              <span className="brand-mark" aria-hidden="true">
                z
              </span>
              <span className="brand-name">
                Zixiao Laboratories<small>UI Kits</small>
              </span>
            </Link>
            <nav aria-label="主导航">
              <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'is-active' }}>
                组件
              </Link>
              <Link to="/about" activeProps={{ className: 'is-active' }}>
                设计原则
              </Link>
            </nav>
            <span className="version-tag">React / TS</span>
            <ThemeModeSelect label="页面主题" compact />
          </header>
          <div id="main-content" tabIndex={-1}>
            <I18nProvider locale="zh-CN">
              <Outlet />
            </I18nProvider>
          </div>
          <footer className="site-footer">
            <span>Zixiao Laboratories UI Kits</span>
            <span>一套行为，多种表达 / React · TypeScript</span>
          </footer>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
