# CI 与 npm 发布

当前唯一公开发布目标是 **`@zixiao-labs/ui-kits-react`**，首个版本预设为 `0.1.0`。许可证为 MIT，版权署名为 **Zixiao Laboratories**。Solid、shared、两个 demo 与 workspace 根包继续保持 `private: true`；不使用递归发布。

本次配置不等于已经发布。推送普通提交或合并 PR 不会发布 npm 包，只有推送 `react-v<package.json 中的版本>` 标签才会触发自动发布。创建 GitHub Release 时若同时新建匹配标签，也可能产生该 push 事件；不要把它当作只保存发布说明的操作。

## CI 做什么

`.github/workflows/ci.yml` 在 `main` 的 push、所有 PR，以及发布工作流调用时运行：

| Job                | 检查                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| Checks             | Node 22 / 24 / 26；冻结 lockfile 安装、lint、格式、全 workspace 类型、Lightning 单元测试、发布元数据 |
| Build and package  | Node 24；React / Solid 组件包及两个 demo 的生产构建、React 打包、React / Solid tarball 消费测试      |
| Browser regression | Chromium + WebKit；现有 Lightning 浏览器回归，包括 Solid 与 OTP 跨浏览器检查；上传截图               |

pnpm 版本从根 `package.json#packageManager` 读取。Actions 固定到完整 commit SHA；依赖安装使用 `pnpm install --frozen-lockfile`。不恢复依赖缓存，以免发布构建复用污染的缓存。

Linux 的 GPU 像素回归使用 Chromium 自带的 SwANGLE（ANGLE + SwiftShader）软件路径，让页面合成与 WebGPU 选择一致的软件后端；不要单独强制 Chromium 的 Vulkan compositor，否则可能在首次 canvas 提交时丢失设备。它不依赖 runner 的独立显卡，也不跳过真实 WebGPU 渲染断言；这验证渲染正确性，不代表硬件性能测试。CI 显式设置 `UI_KITS_TEST_SOFTWARE_GPU=1`，本地也可用同一开关复现软件路径。

CI 同时通过 Xvfb 虚拟显示运行套件，并设置 `UI_KITS_TEST_GPU_HEADED=1`，仅让材质 / GPU 套件使用有界面 Chromium，确保像素断言经过实际 canvas 合成路径；其他套件仍为 headless。Xvfb / xauth 由 workflow 安装，无需维护者手动提供显示器或显卡。

`Build and package` 上传 `react-package` artifact，其中只有 `ui-kits-react.tgz`。它是由 **pnpm pack** 生成、已经过真实独立安装、Bundler / NodeNext 类型检查、Node SSR 和 tree-shaking 检查的同一个归档。浏览器结果保留为 `browser-results`。两类 artifact 均保留 7 天。

普通 CI 不执行 `npm publish --dry-run`，也不需要 npm 登录、token 或发布权限。dry-run 仍会查询 registry 并检查版本冲突，当前版本已发布时也会失败；日志中的未登录提示只是 warning，给 CI 加 token 并不能解决重复版本错误。归档由打包和消费测试验证，版本是否可发布及 OIDC 授权由最终 publish job 检查，不必为了让普通 CI 通过而升级版本。

## 首次启用：需要手动配置

### 1. GitHub 仓库与 Environment

在 [zixiao-labs/ui-kit](https://github.com/zixiao-labs/ui-kit/settings) 中：

1. 将这些配置通过正常 PR 流程合入 `main`，确认 GitHub Actions 已启用，并允许本流程用到的 `actions/*` 与 `pnpm/action-setup`。
2. 在 **Settings → Environments** 创建名为 **`npm`** 的 Environment，名称区分大小写。
3. 建议添加 Required reviewers，并禁止自审；发布 job 会在完整 CI 通过后等待批准。
4. Deployment branches and tags 选择 **Selected branches and tags**，添加 **Tag** 规则 `react-v*`。不要仅选择 protected branches，否则标签发布可能被拦截。
5. 建议为 `main` 配置 PR 审查与必需 CI 检查，并为 `react-v*` 配置 tag ruleset，限制创建、修改和删除标签的权限。

此 Environment **不需要 `NPM_TOKEN`、`NODE_AUTH_TOKEN` 或任何 npm Secret**。OIDC 权限只给最终的 publish job，其他 job 只有仓库只读权限。发布流程还会验证标签对应的提交已经存在于 `origin/main`。

### 2. npm 账号与首次建包

确认你有 npm **`@zixiao-labs` scope** 的发包权限，并为账号启用 2FA。GitHub organization 和 npm organization 的权限相互独立。

新包尚不存在时，没有包设置页可绑定 Trusted Publisher。需要维护者先完成一次登录发布来创建包；不要把账号凭据或 token 写入仓库。推荐直接使用 `main` 上**所有 CI job 均成功**的那次运行中的 `react-package`：

1. 从 GitHub Actions 运行页下载并解压 artifact，得到 `ui-kits-react.tgz`。
2. 在本地检查归档内容、包名、版本、MIT 许可证与 `dist` 导出，不要重新用 npm 从源码目录打包。
3. 使用有 scope 写权限的账号执行以下命令，并按提示完成浏览器登录 / 2FA：

```sh
npm login --registry=https://registry.npmjs.org/
npm publish ./ui-kits-react.tgz --dry-run --ignore-scripts --access public --registry=https://registry.npmjs.org/

# 确认后才执行：这一步会真正公开发布，不可覆盖相同版本
npm publish ./ui-kits-react.tgz --ignore-scripts --access public --registry=https://registry.npmjs.org/
```

这次本地首次发布不带 GitHub provenance；后续 OIDC 发布才由 GitHub 生成。若改为本地构建，先执行下方的完整验证与 `pnpm release:pack`，使用 `test-results/ui-kits-react.tgz`，不要跳过 tarball 消费验证。

### 3. 在 npm 绑定 Trusted Publisher

包首次创建后，打开 [React 包设置](https://www.npmjs.com/package/@zixiao-labs/ui-kits-react/access)，进入 **Settings → Trusted publishing**，添加 **GitHub Actions**：

| npm 字段             | 必须填写的值           |
| -------------------- | ---------------------- |
| Organization or user | `zixiao-labs`          |
| Repository           | `ui-kit`               |
| Workflow filename    | `publish.yml`          |
| Environment name     | `npm`                  |
| Allowed actions      | 允许 **`npm publish`** |

Workflow filename **只填文件名**，不是 `.github/workflows/publish.yml`，也不是 `ci.yml`。本流程不使用 `npm stage publish` 或 `npm dist-tag`，不需要额外的 dist-tag 权限。不要把绑定指向 fork 或另一个 workflow。

按 npm 当前规则，新创建的 Trusted Publisher 配置需在 **2 天内完成第一次成功的 OIDC 发布**；过期后要删除并重新添加。首次登录发布已经使用了 `0.1.0` 时，需要先将 React 版本改为 `0.1.1`，再通过下面的标签流程验证 OIDC；**不要试图重新发布 `0.1.0`**。

OIDC 成功后，建议在 npm **Publishing access** 选择 **Require two-factor authentication and disallow tokens**，移除不再需要的自动化 token。此项不会禁用 Trusted Publishing。

## 后续发布

1. 只修改 `packages/react/package.json` 中的版本，并准备对应发布说明。无需同步修改 Solid / shared / demo 的版本。
2. 提交 PR，通过 CI 后合入 `main`。
3. 在已更新到该提交的 `main` 上确认 `pnpm release:check` 通过，再创建和推送对应标签。例如 React 版本为 `0.1.1` 时：

```sh
git tag react-v0.1.1
git push origin react-v0.1.1
```

4. `Publish React` 先校验标签与版本、许可证、仓库地址、其他包的私有状态和 `main` 祖先关系，再在**该标签提交**重新运行完整 CI。
5. CI 全部成功后，由 `npm` Environment 的 reviewer 批准最终 publish job。
6. GitHub-hosted runner 使用 Node 24 + npm 11.12.1（满足 Trusted Publishing 的 npm >=11.5.1 / Node >=22.14 要求），通过 `id-token: write` 获取短期身份，执行：

```sh
npm publish ./release/ui-kits-react.tgz --ignore-scripts --access public --provenance --tag latest
```

最终 job 下载本次 CI 的 artifact，不 checkout 源码、不安装项目依赖、不重新构建、不运行包生命周期脚本，也不会发布 Solid。GitHub 仓库和 npm 包必须保持公开，才能生成 provenance。

稳定版本 `X.Y.Z` 发布到 `latest`；命名预发布版本如 `0.2.0-beta.1` 使用标签 `react-v0.2.0-beta.1`，自动发布到 `next`，不会覆盖 `latest`。不支持 SemVer build metadata（`+build`）。同一版本不能覆盖；失败后先确认 npm 是否已经收到该版本，避免盲目重试。版本已存在时应新增版本，不要删除或移动已发布标签。

首次创建 npm 包后，后续正常发版不需要 `npm login`。`npm whoami` 不支持用来检测 OIDC 授权，最终权限只能通过真实的授权发布验证。

## 本地发布前验证

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm release:pack
UI_KITS_REACT_TARBALL=test-results/ui-kits-react.tgz pnpm test:package
pnpm exec playwright install chromium webkit
UI_KITS_TEST_WEBKIT=1 pnpm test:e2e
```

只复现 CI 的 GPU / 材质回归，可运行：

```sh
UI_KITS_TEST_SOFTWARE_GPU=1 pnpm exec lightning run --config lightning.e2e.config.ts tests/effects.e2e.test.ts
```

Linux 无显示服务器时，复现 CI 的有界面像素路径：

```sh
UI_KITS_TEST_SOFTWARE_GPU=1 UI_KITS_TEST_GPU_HEADED=1 xvfb-run --auto-servernum --server-args="-screen 0 1920x1440x24" pnpm exec lightning run --config lightning.e2e.config.ts tests/effects.e2e.test.ts
```

`pnpm release:check` 也可传入期望的标签：`pnpm release:check react-v0.1.0`。`pnpm release:pack` 自动检查元数据并由 `prepack` 构建，只打包，不发布。

**不要执行 `npm publish packages/react` 或在源码目录内执行 `npm publish`**：本地 `exports` 故意指向 `src`，必须先用 pnpm 的 pack 转换为 `publishConfig.exports` 中的 `dist` 入口。对转换完成的 `.tgz` 执行 `npm publish` 则是本流程的正确方式。

## 参考

- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements/)
