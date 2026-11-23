import { readFileSync } from 'node:fs'

const usage = '用法：node check-plan.mjs <design-plan.json>'
const commonTaste = ['clear-copy', 'real-content', 'aligned-grid', 'browser-qa']
const tasteByPage = new Map([
  ['workspace', commonTaste],
  ['editorial', [...commonTaste, 'story-moment']],
  ['landing', [...commonTaste, 'hero', 'story-moment']],
])
const styles = ['hepo', 'hepo-interior', 'existing']

function check(plan) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
    return ['设计卡必须是 JSON 对象。']
  }

  const issues = []
  const allowedTaste = tasteByPage.get(plan.page)
  if (!allowedTaste) issues.push(`page 必须为 ${[...tasteByPage.keys()].join('、')} 之一。`)
  if (!styles.includes(plan.style)) issues.push(`style 必须为 ${styles.join('、')} 之一。`)
  for (const key of ['direction', 'subject', 'action']) {
    if (typeof plan[key] !== 'string' || !plan[key].trim()) {
      issues.push(`${key} 必须填写实际设计决定。`)
    }
  }
  if (!Array.isArray(plan.taste) || plan.taste.some((item) => typeof item !== 'string')) {
    issues.push('taste 必须是手法名称列表；未借用时填 []。')
  } else if (allowedTaste) {
    for (const item of new Set(plan.taste)) {
      if (!allowedTaste.includes(item)) {
        issues.push(
          `taste: ${JSON.stringify(item)} 不属于 ${plan.page} 的可借用手法。可选：${allowedTaste.join('、')}。`,
        )
      }
    }
  }
  return issues
}

const args = process.argv.slice(2)
if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
  console.log(usage)
} else if (args.length !== 1) {
  console.error(usage)
  process.exitCode = 1
} else {
  try {
    const issues = check(JSON.parse(readFileSync(args[0], 'utf8')))
    if (issues.length) {
      for (const issue of issues) console.error(`- ${issue}`)
      process.exitCode = 1
    } else {
      console.log('设计卡符合默认规则；仍需在真实页面完成视觉与交互验收。')
    }
  } catch (error) {
    console.error(`无法读取设计卡 ${JSON.stringify(args[0])}：${error.message}`)
    process.exitCode = 1
  }
}
