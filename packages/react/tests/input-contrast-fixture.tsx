import { Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Input, InputGroup, NumberField, SearchField, TextArea, TextField } from '../src/forms'

/** Real component markup for CSS contrast tests; native editing is tested in the demo. */
export const inputContrastFixture = renderToStaticMarkup(
  <section id="fields" data-zx-style="clean">
    {(['outline', 'tonal'] as const).map((variant) => (
      <Fragment key={variant}>
        <Input aria-label={`Input ${variant}`} variant={variant} placeholder="陈予安或林舒" />
        <TextArea
          aria-label={`TextArea ${variant}`}
          variant={variant}
          placeholder="简要说明调整内容"
        />
        <TextField
          label={`TextField ${variant}`}
          variant={variant}
          placeholder="name@example.com"
          startContent="邮箱 /"
          endContent=".design"
        />
        <InputGroup
          aria-label={`InputGroup ${variant}`}
          variant={variant}
          startContent="项目 /"
          endContent=".design"
        >
          {/* The group's backing surface wins over its transparent child's variant. */}
          <Input
            aria-label={`Grouped input ${variant}`}
            variant={variant === 'tonal' ? 'outline' : 'tonal'}
            placeholder="北岸设计"
          />
        </InputGroup>
        <SearchField
          label={`SearchField ${variant}`}
          variant={variant}
          placeholder="陈予安、林舒"
        />
        <NumberField label={`NumberField ${variant}`} variant={variant} placeholder="人数" />
      </Fragment>
    ))}
    <Input aria-label="只读项目" variant="tonal" defaultValue="北岸设计" readOnly />
    <Input aria-label="禁用项目" variant="tonal" defaultValue="北岸设计" disabled />
  </section>,
)
