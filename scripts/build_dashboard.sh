cd "$(dirname "$0")/dashboard"
VITE_BASE_API="${VITE_BASE_API:-/api/}" pnpm build
