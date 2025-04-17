export default {
  server: {
    port: 5173,
    open: true
  },
  optimizeDeps: {
    include: ["@walletconnect/modal-sign-html"]
  },
  ssr: {
    noExternal: ["@walletconnect/modal-sign-html"]
  }
}