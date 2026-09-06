import type { SelectOption } from 'naive-ui'
import type { FormItemRule } from 'naive-ui'

/** 表单项类型集合，按需扩展 */
export type FormItemType =
  | 'input'
  | 'password'
  | 'textarea'
  | 'number'
  | 'select'
  | 'radio'
  | 'datetimerange'

export interface FormItemOption {
  /** 字段名，对应 model 的 key，也是校验规则的 path */
  key: string
  /** label 文案 */
  label: string
  /** 控件类型，缺省为 input */
  type?: FormItemType
  placeholder?: string
  /** 生成必填校验规则（message 为 `${label}不能为空`） */
  required?: boolean
  /** select / radio 的选项 */
  options?: SelectOption[]
  /** textarea 行数，默认 3 */
  rows?: number
  /** 输入最大长度（input / textarea） */
  maxlength?: number
  /** 控件宽度，默认跟随表单布局 */
  width?: string
  /** 追加/覆盖该字段的校验规则（覆盖 required 生成的默认规则） */
  rule?: FormItemRule | FormItemRule[]
}
