
mkdir -p app/health
cat > app/health/page.tsx <<'TSX'
export default function Health(){return <main style={{padding:24}}>health ✅</main>}
