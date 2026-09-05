import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'http://localhost:8081/admin'
  const wsTarget = apiTarget.replace(/^http/, 'ws').replace(/\/admin$/, '')

  return {
    plugins: [
      vue(),
      vueJsx(),
      // Naive UI 模板按需自动导入
      Components({ resolvers: [NaiveUiResolver()], dts: 'src/components.d.ts' }),
      createSvgIconsPlugin({
        iconDirs: [fileURLToPath(new URL('./src/icons/svg', import.meta.url))],
        symbolId: 'icon-[name]',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        // 替代旧 style-resources-loader 的全局注入
        scss: {
          additionalData:
            '@use "@/styles/variables.scss" as *; @use "@/styles/mixins.scss" as *;',
        },
      },
    },
    server: {
      port: 8888,
      host: '0.0.0.0',
      open: true,
      proxy: {
        // 对应旧 devServer.proxy：/api -> VITE_API_URL 并去掉 /api 前缀
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        // WebSocket 同源代理，前端用 ws(s)://<host>/ws/<clientId> 连接
        '/ws': {
          target: wsTarget,
          ws: true,
        },
      },
    },
    build: {
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          // Vite 8（Rolldown）仅支持函数形式
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined
            if (/node_modules\/(echarts|zrender)\//.test(id)) {
              return 'echarts'
            }
            if (
              /node_modules\/(naive-ui|@css-render|css-render|vueuc|seemly|treemate|vooks|vdirs|date-fns)\//.test(
                id,
              )
            ) {
              return 'naive-ui'
            }
            return undefined
          },
        },
      },
    },
  }
})
