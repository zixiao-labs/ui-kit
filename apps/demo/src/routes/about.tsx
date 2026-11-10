import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="about-page">
      <p className="eyebrow">THE FOUNDATION</p>
      <h1>先统一行为，再表达风格。</h1>
      <p>
        Zixiao Laboratories UI Kits 是多风格 React 组件库。组件负责语义、交互与无障碍，CSS tokens
        负责色彩、形状与质感，demo 负责验证它们能否一起工作。
      </p>
      <div className="principle-grid">
        <section>
          <span className="section-number">01 / BEHAVIOR</span>
          <h2>一套组件 API</h2>
          <p>先从 Button 验证原生属性、键盘操作、禁用和加载状态，不为每种风格复制组件。</p>
        </section>
        <section>
          <span className="section-number">02 / EXPRESSION</span>
          <h2>局部样式作用域</h2>
          <p>
            Clean、Endfield、鹤坡、Minimal、Soft 与 Brutalist 共享行为。用 data-zx-style 和
            data-zx-color-mode 切换外观，同一页面可以并存多个风格。
          </p>
        </section>
        <section>
          <span className="section-number">03 / GROWTH</span>
          <h2>让复杂度按需出现</h2>
          <p>先验证简单组件。等出现重复需求后，再提取 primitives、独立主题包和发布流程。</p>
        </section>
      </div>
    </main>
  )
}
