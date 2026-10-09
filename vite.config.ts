import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// ページから外部への通信（fetch・外部ファイルの読み込み）を、ブラウザの仕組みでも止める。
// 開発用サーバーはインラインのスクリプトを使うため、公開用のビルドにだけ入れる
const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "manifest-src 'self'",
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

function contentSecurityPolicy(): Plugin {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html) =>
        html.replace(
          '<head>',
          `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`,
        ),
    },
  };
}

// base: './' で、どのURL配下（GitHub Pages など）に置いても動くようにする
export default defineConfig({
  base: './',
  plugins: [react(), contentSecurityPolicy()],
});
