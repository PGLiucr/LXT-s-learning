# 1. 问题

服务层的 fetchCET6Vocabulary 返回未显式标注类型的数组，页面 WordsPage 以 any[] 接收并流转到导入流程。这样一来，只要外部 JSON 结构变化，问题会在运行时（如 handleImportCET6）才暴露，编译期无法预警，增加维护和修改成本。

## 1.1. **类型安全缺失**
- 位置：src/services/dictionaryService.ts 第 5-30 行；src/pages/WordsPage.tsx 第 20-25 行。
- 表现：
  - 服务函数未声明返回类型；映射时使用 item: any。
  - 组件状态 `libraryWords` 声明为 any[]，下游需要假设字段存在。
- 影响：
  - 一旦外部数据（CDN JSON）字段名或结构调整，导入流程在运行时才失败。
  - 编译器无法提示潜在问题，维护者需要额外心智负担来“猜测”数据形状。
- 问题代码示例：
```ts
// src/services/dictionaryService.ts
export const fetchCET6Vocabulary = async () => {
  const response = await fetch('...')
  const data = await response.json()
  return data
    .filter((item: any) => item && item.word)
    .map((item: any) => ({
      english_word: item.word,
      chinese_meaning: item.translations ? item.translations.map((t: any) => t.translation).join('; ') : '',
      phonetic_symbol: item.phonetic || '',
      example_sentence: item.phrases && item.phrases.length > 0
        ? `${item.phrases[0].phrase} - ${item.phrases[0].translation}`
        : ''
    }))
}

// src/pages/WordsPage.tsx
const [libraryWords, setLibraryWords] = useState<any[]>([])
```

## 1.2. **外部数据解析缺少最小类型守卫**
- 位置：src/services/dictionaryService.ts 第 13-24 行（数据转换）。
- 表现：直接以 any 读取并映射外部 JSON，无最小字段校验（如 `word` 是否为字符串）。
- 影响：当外部源返回异常对象时，映射过程可能生成不完整/错误的数据，进一步污染组件状态。
- 说明：即便我们统一返回类型，缺少基本“类型守卫”也会让异常数据悄然进入系统，增加排查难度。

# 2. 收益

核心收益：统一服务层与组件对“词库项”的类型约束为 Omit<Word, 'id' | 'user_id' | 'created_at' | 'review_date' | 'mastery_level'>[]，并增加最小类型守卫，使编译期与早期运行期即可暴露问题，降低导入流程的隐性风险。

## 2.1. **降低隐式 any 风险与提高可读性**
- 隐式 any 的使用点预计从 **2** 处（服务映射与组件状态）降至 **0**。
- 代码意图更清晰：维护者可以在全局搜索 `LibraryWord` 即理解数据形状和使用范围。

## 2.2. **更早暴露外部数据异常**
- 通过最小类型守卫，非法项在转换阶段被过滤或抛出，避免在导入时才失败。
- 运行时排查范围更小，错误更可定位。

## 2.3. **更易测试与扩展**
- 统一类型后，单元测试可以直接构造 `LibraryWord[]`，覆盖选择与导入路径。
- 若后续需要为词库项增加新字段，只需扩展单一类型别名与映射逻辑。

# 3. 方案

总体思路：定义 `LibraryWord` 类型别名，统一服务层返回与组件状态类型为 `LibraryWord[]`；为外部 JSON 引入最小类型守卫，以更稳健的方式进行映射与降级。

## 3.1. **引入类型别名与最小守卫：解决“类型安全缺失”和“外部数据解析缺少守卫”**

### 方案概述
- 在 `src/types/index.ts` 或服务层附近定义 `LibraryWord`：`Omit<Word, 'id' | 'user_id' | 'created_at' | 'review_date' | 'mastery_level'>`。
- 为外部 JSON 定义最小结构 `ExternalItem` 与类型守卫 `isExternalItem`。
- 显式标注 `fetchCET6Vocabulary` 的返回类型为 `Promise<LibraryWord[]>`。
- 将 `WordsPage` 的 `libraryWords` 改为 `LibraryWord[]`。

### 实施步骤
- 新增或导出类型别名 `LibraryWord`。
- 在服务层为 `fetchCET6Vocabulary` 添加返回类型并用守卫过滤非法项。
- 在页面组件将 `useState<any[]>` 改为 `useState<LibraryWord[]>([])`。
- 保持导入流程不变（`...w, mastery_level, review_date` 的补齐仍然成立）。

### 修改前代码（代表性片段）
```ts
// src/services/dictionaryService.ts
export const fetchCET6Vocabulary = async () => {
  const response = await fetch('...')
  const data = await response.json()
  return data
    .filter((item: any) => item && item.word)
    .map((item: any) => ({ /* ... */ }))
}

// src/pages/WordsPage.tsx
const [libraryWords, setLibraryWords] = useState<any[]>([])
```

### 修改后代码（示例实现）
```ts
// src/types/index.ts（或服务层文件中临时声明）
import type { Word } from '@/types'
export type LibraryWord = Omit<Word, 'id' | 'user_id' | 'created_at' | 'review_date' | 'mastery_level'>

// src/services/dictionaryService.ts
type ExternalItem = {
  word?: string
  translations?: { translation: string }[]
  phonetic?: string
  phrases?: { phrase: string; translation: string }[]
}

const isExternalItem = (x: unknown): x is ExternalItem => {
  return !!x && typeof (x as any).word === 'string'
}

export const fetchCET6Vocabulary = async (): Promise<LibraryWord[]> => {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/gh/KyleBing/english-vocabulary@master/json/4-CET6-%E9%A1%BA%E5%BA%8F.json')
    if (!response.ok) throw new Error('Failed to fetch vocabulary')
    const raw: unknown = await response.json()

    if (!Array.isArray(raw)) throw new Error('Invalid data shape')
    return raw
      .filter(isExternalItem)
      .map((item) => ({
        english_word: item.word!,
        chinese_meaning: item.translations ? item.translations.map(t => t.translation).join('; ') : '',
        phonetic_symbol: item.phonetic || '',
        example_sentence: item.phrases && item.phrases.length > 0
          ? `${item.phrases[0].phrase} - ${item.phrases[0].translation}`
          : ''
      }))
  } catch (error) {
    console.error('Failed to fetch from external source, falling back to sample:', error)
    return CET6_SAMPLE // 已是 LibraryWord[]
  }
}

// src/pages/WordsPage.tsx
const [libraryWords, setLibraryWords] = useState<LibraryWord[]>([])
```

### 说明
- 以上代码通过显式返回类型与最小守卫，提高了编译期与早期运行期的健壮性。
- 现有导入逻辑：
```ts
const wordsToImport = libraryWords.filter(w => selectedLibraryWords.includes(w.english_word))
// 后续插入时补齐 user_id、mastery_level、review_date，不与 LibraryWord 冲突
```

# 4. 回归范围

本次变更不涉及业务流程重构，重点验证“词库加载-选择-导入”的端到端链路在 Mock 与真实模式下的正确性，以及在外部数据异常时的降级与提示。

## 4.1. 主链路
- 打开 CET-6 Library：
  - 首次进入时调用 `fetchCET6Vocabulary`，UI 正常渲染；`libraryWords` 为 `LibraryWord[]`。
- 勾选并导入：
  - Mock 模式：本地新增词条，列表更新且提示成功，字段完整。
  - 非 Mock 模式：向 supabase 插入补齐后的词条，列表更新且提示成功。
- 检索与展示：导入后的词条在主列表、拼写/听写等功能中正常显示。

（可选用例示例）
- 预置条件：无词库缓存，网络正常。
- 操作：打开库 -> 选择 3 个单词 -> 导入。
- 期望：导入数量提示为 3；新词条字段完整；无控制台错误。

## 4.2. 边界情况
- 外部 CDN 不可用：回退到 `CET6_SAMPLE`，UI 提示并仍能选择与导入。
- 外部 JSON 缺少 `translations` 或 `phrases`：
  - 映射为空字符串或首项短语，UI 仍正常。
- 空库返回：`libraryWords.length === 0` 分支展示“无数据”提示；不崩溃。
- 重复导入：当前逻辑未去重，行为与既有实现保持一致（可记录后续优化）。
