import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/', // 배포 경로 설정 (필요시 변경)
      server: {
        port: 5174,
        strictPort: true, // 포트가 사용 중이면 에러 발생 (자동 변경 방지)
        host: true // 네트워크에서 접근 가능하게 설정
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false, // 프로덕션에서는 소스맵 비활성화
        minify: 'terser', // 코드 압축
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              utils: ['jspdf', 'html2canvas']
            }
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY),
        'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
